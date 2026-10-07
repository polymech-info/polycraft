import * as path from 'node:path'
import pMap from 'p-map'
import { GlobOptions } from 'glob'
import { sanitizeUri } from 'micromark-util-sanitize-uri'
import ExifReader from 'exifreader'
import { loadImage } from "imagetools/api"
import { sanitizeFilename } from '@polymech/fs/utils'
import { resolve } from '@polymech/commons'
import { files } from '@polymech/commons'
import { sync as exists } from '@polymech/fs/exists'
import { sync as read } from '@polymech/fs/read'
import { logger } from '@/base/index.js'
import { env } from './index.js'
import { GalleryImage, MetaJSON } from './images.js'

import {
    removeArrayValues,
    removeArrays,
    removeBufferValues,
    removeEmptyObjects
} from '@/base/objects.js'

import {
    ITEM_ASSET_URL, PRODUCT_CONFIG, PRODUCT_ROOT,
    DEFAULT_IMAGE_URL, ASSETS_LOCAL,
    ASSETS_GLOB
} from 'config/config.js'

export const default_sanitizer = (files: string[]) => files.map((f) => sanitizeFilename(f))

export const default_sort = (files: string[]): string[] => {
    const getSortableParts = (filename: string) => {
        const baseName = path.parse(filename).name;
        const match = baseName.match(/^(\d+)_?(.*)$/); // Match leading numbers
        const numPart = match ? parseInt(match[1], 10) : NaN;
        const textPart = match ? match[2] : baseName; // Extract text part

        return { numPart, textPart };
    }
    return files.sort((a, b) => {
        const { numPart: aNum, textPart: aText } = getSortableParts(a)
        const { numPart: bNum, textPart: bText } = getSortableParts(b)
        if (!isNaN(aNum) && !isNaN(bNum)) {
            return aNum - bNum || aText.localeCompare(bText, undefined, { numeric: true, sensitivity: 'base' })
        }
        return aText.localeCompare(bText, undefined, { numeric: true, sensitivity: 'base' })
    })
}

export const default_filter = async (url: string) => {
    try {
        const response = await fetch(url, { method: 'HEAD' })
        if (!response.ok) {
            logger.warn(`Image URL not found ${url}`)
            return false
        }
    } catch (error) {
        logger.warn(`Image URL not found ${url} : ${error.message}`)
        return false
    }
    return true
}

export const default_filter_locale = async (url: string) => {
    return url && exists(url)
}

export const image_url = async (src, fallback = DEFAULT_IMAGE_URL) => {
    if (exists(src)) return src
    let safeSrc = src
    try {
        const response = await fetch(src, { method: 'HEAD' })
        if (!response.ok) {
            safeSrc = fallback
            logger.warn(`Image URL not found ${src}, default to ${fallback}`)
        }
    } catch (error) {
        safeSrc = fallback
    }
    return safeSrc
}

export const gallery = async (assetPath, item): Promise<GalleryImage[]> => {

    const root = resolve(PRODUCT_ROOT())
    const profile = env()
    const assetSlug = path.parse(assetPath).name

    const itemConfig: any = read(PRODUCT_CONFIG(item), "json")
    if (!itemConfig) {
        logger.warn(`item gallery : item ${item} config not found !`)
        return []
    }
    const mediaPath = `${root}/${item}/${assetPath}/`
    if (!exists(mediaPath)) {
        return []
    }
    const galleryGlob = (itemConfig.gallery || {})[assetSlug]?.glob || ASSETS_GLOB
    let galleryFiles: any[] = files(mediaPath, galleryGlob, {
        cwd: mediaPath,
        absolute: false,
        nodir: true
    } as GlobOptions)

    if (!galleryFiles || galleryFiles.length == 0) {
        return []
    }

    if (!galleryFiles) {
        logger.warn(`gallery : ${item} media files not found ! ${mediaPath}`)
        return []
    }
    const assetUrl = (filePath) => {
        return sanitizeUri(ITEM_ASSET_URL(
            {
                assetPath,
                filePath,
                ITEM_REL: item,
                ...profile.variables
            }
        ))
    }
    if (!ASSETS_LOCAL) {
        galleryFiles = await pMap(galleryFiles, async (f) => (await default_filter(assetUrl(f))) ? f : null, { concurrency: 5 })
        galleryFiles = galleryFiles.filter((f) => f !== null)
        galleryFiles = default_sort(galleryFiles)
    } else {
        galleryFiles = galleryFiles.filter(default_filter_locale)
    }
    galleryFiles = default_sort(galleryFiles)

    return await pMap(galleryFiles, async (file: string) => {
        const parts = path.parse(file)
        const filePath = path.join(mediaPath, file)
        const meta_path_json = `${mediaPath}/${parts.name}.json`
        const meta_json = exists(meta_path_json) ? read(meta_path_json, "json") as MetaJSON : { alt: "", keywords: "", title: "", description: "" }
        const meta_path_md = `${mediaPath}/${parts.name}.md`
        const meta_markdown = exists(meta_path_md) ? read(meta_path_md, "string") as string : "" as string
        let imageMeta: any = await loadImage(filePath)
        let exifRaw: any = null
        try {
            exifRaw = await ExifReader.load(filePath)
        } catch (e) {
            logger.error(`ProductGallery : Error loading exif data for ${filePath}`)
            exifRaw = {}
        }
        const keywords = exifRaw?.['LastKeywordXMP']?.description || exifRaw?.iptc?.Keywords?.description || ''.split(',').map((k) => k.trim())
        const exifDescription = exifRaw?.['ImageDescription']?.description || ''
        const width = exifRaw?.['Image Width']?.value
        const height = exifRaw?.['Image Height']?.value
        const lon = exifRaw?.['GPSLongitude']?.description
        const lat = exifRaw?.['GPSLatitude']?.description

        const title = exifRaw?.title?.description || meta_json.title || ''
        const alt = meta_json.description || meta_markdown || exifDescription || exifRaw?.iptc?.['Caption/Abstract'].description || ''
        imageMeta.exif = exifRaw
        imageMeta = removeBufferValues(imageMeta)
        imageMeta = removeArrayValues(imageMeta)
        imageMeta = removeArrays(imageMeta)
        imageMeta = removeEmptyObjects(imageMeta)
        delete imageMeta.xmp
        delete imageMeta.icc
        delete imageMeta.exif.icc
        delete imageMeta.exif.xmp
        delete imageMeta.exif.iptc
        const src = ASSETS_LOCAL ? filePath : await image_url(assetUrl(file))
        const ret: GalleryImage =
        {
            name: path.parse(file).name,
            src: src,
            url: src,
            meta: {
                format: imageMeta.format,
                width: imageMeta.width,
                height: imageMeta.height,
                space: imageMeta.space,
                channels: imageMeta.channels,
                depth: imageMeta.depth,
                density: imageMeta.density,
                chromaSubsampling: imageMeta.chromaSubsampling,
                isProgressive: imageMeta.isProgressive,
                resolutionUnit: imageMeta.resolutionUnit,
                hasProfile: imageMeta.hasProfile,
                hasAlpha: imageMeta.hasAlpha,
                orientation: imageMeta.orientation,
                exif: imageMeta.exif,
                json: meta_json as MetaJSON,
                markdown: meta_markdown as string
            },
            keywords,
            description: alt,
            alt,
            width,
            height,
            title,
            gps: { lon, lat }
        }
        return ret
    })
}

/**
 * Converts gallery images to individual JSON-LD objects for SEO optimization
 * @param images Array of GalleryImage objects to convert
 * @param lang Language code for internationalization
 * @param contentUrl Base URL for the gallery content
 * @returns Array of JSON-LD representations, one for each image
 */
export const toJsonLd = async (images: GalleryImage[], lang: string, contentUrl: string) => {
    if (!images || images.length === 0) {
        return []
    }

    // Map each image to its own complete JSON-LD object
    return images.map((image, index) => {
        // Create a standalone ImageObject for each image
        const jsonLd = {
            "@context": "https://schema.org",
            "@type": "ImageObject",
            "inLanguage": lang,
            "contentUrl": contentUrl || image.src,
            "url": contentUrl || image.src,
            "name": image.title || image.name,
            "description": image.description || image.alt || "",
            "height": image.height,
            "width": image.width,
            "identifier": image.name,
            "keywords": Array.isArray(image.keywords) ? image.keywords.join(", ") : image.keywords || ""
        }

        // Add GPS coordinates if available
        if (image.gps && image.gps.lat && image.gps.lon) {
            jsonLd["contentLocation"] = {
                "@type": "Place",
                "geo": {
                    "@type": "GeoCoordinates",
                    "latitude": image.gps.lat,
                    "longitude": image.gps.lon
                }
            }
        }
        return jsonLd
    })
}
