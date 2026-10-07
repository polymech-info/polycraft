import * as path from 'path'
import { findUp } from 'find-up'

import pMap from 'p-map'
import { sanitizeFilename } from "@polymech/fs/utils"
import { sync as read } from '@polymech/fs/read'
import { sync as exists } from '@polymech/fs/exists'
import { sync as mkdir } from '@polymech/fs/dir'
import { sync as rm } from '@polymech/fs/remove'
import { sync as write } from '@polymech/fs/write'
import type { Loader, LoaderContext } from 'astro/loaders'
import { resolveVariables } from "@polymech/commons/variables"

import { env, logger } from '@/base/index.js'
import { download } from '../download.js'
import { default_image } from 'config/config.js'

import { applyFilters, default_filters_plain, FilterFunction } from '../../base/filters.js'
import { TemplateContext, buildPrompt, LLMConfig, createTemplates } from '@/base/kbot-templates.js'
import { template_filter } from '@/base/kbot.js'

export interface IProduct {
  title: string
  price: string
  storeName: string
  storeLink: string
  description: string
  features: string
  options: string
  authorImage: string
  images: string[]
  content: string | null
  url: string
  prefix: string
  slug: string
  files?: any[]
}

export const ITEM_TYPE = 'product'

export const PRODUCT_ROOT = () => path.join(process.cwd(), 'src/content/products')
export const PRODUCT_GLOB = () => 'src/content/products/**/*.mdx'
export const PRODUCT_MIGRATION = () => path.join(process.cwd(), 'src/model/data/data.json')
export const PRODUCT_FILTER_LLM = true

export const item_path = (item: IProduct) => `${PRODUCT_ROOT()}/${item.slug}`
export const asset_local_abs = async (item: IProduct, imageUrl: string) => {
  const sanitizedFilename = sanitizeFilename(path.basename(imageUrl))
  const asset_path = path.join(PRODUCT_ROOT(), item.slug, sanitizedFilename)
  if (exists(asset_path)) {
    return asset_path
  }
  return false
}

export const downloadFiles = async (dst: string, product: IProduct) => {
  const asset_root = path.join(PRODUCT_ROOT(), product.slug)
  return await pMap(product.images, async (imageUrl) => {
    const sanitizedFilename = sanitizeFilename(path.basename(imageUrl)).toLowerCase()
    const asset_path = path.join(PRODUCT_ROOT(), product.slug, sanitizedFilename)
    if (!exists(asset_path)) {
      try {
        await download(imageUrl, asset_path)
      } catch (e) {
        logger.error('error download product image', e)
      }
    }
  }, { concurrency: 1 })
}

export const asset_local_rel = async (item: IProduct, imageUrl: string) => {
  const sanitizedFilename = sanitizeFilename(path.basename(imageUrl)).toLowerCase()
  const asset_path = path.join(PRODUCT_ROOT(), item.slug, sanitizedFilename)
  if (exists(asset_path)) {
    return `/resources/products/${item.slug}/${sanitizedFilename}`
  } else {
    await download(imageUrl, asset_path)
  }
  return default_image().src
}

export const raw = async () => {
  const src = PRODUCT_MIGRATION()
  const data = read(src, 'json') as any
  const products = [data] // Since we're working with a single product for now
  return products
}

export const defaults = async (data: any, cwd: string, root: string) => {
  let defaultsJSON = await findUp('defaults.json', {
    stopAt: root,
    cwd: cwd
  })
  try {
    if (defaultsJSON) {
      data = {
        ...read(defaultsJSON, 'json') as any,
        ...data,
      }
    }
  } catch (error) {
  }
  return data
}

const commons = async (text: string): Promise<string> => {
  return await template_filter(text, 'simple', TemplateContext.COMMONS)
}

const content = async (str: string, filters: FilterFunction[] = default_filters_plain) => await applyFilters(str, filters)

const to_mdx = async (item: IProduct) => {
  const itemDir = item_path(item)

  // Create index.mdx with all content
  const mdxContent = [
    '---',
    `title: ${item.title}`,
    `price: ${item.price}`,
    `storeName: ${item.storeName}`,
    `storeLink: ${item.storeLink}`,
    `url: ${item.url}`,
    `prefix: ${item.prefix}`,
    '---',
    '',
    `import { Image } from 'astro:assets'`,
    '',
    `# ${item.title}`,
    '',
    ...item.images.map((img, index) => 
      `<Image src={import('./${sanitizeFilename(path.basename(img))}')} alt="${item.title} - Image ${index + 1}" />`
    ),
    '',
    item.description,
    '',
    '## Features',
    '',
    item.features,
    '',
    '## Options',
    '',
    item.options
  ].filter(Boolean).join('\n')
  write(path.join(itemDir, 'index.mdx'), mdxContent)
}

const complete = async (item: IProduct) => {
  // commons: language, tone, bullshit filter, and a piece of love, just a bit, at least :)
  if (PRODUCT_FILTER_LLM) {
    item.description = await commons(item.description || '')
  }

  // default pass, links, words, formatting, ...  
  item.description = await content(item.description)
  item.features = await content(item.features)
  item.options = await content(item.options)

  await to_mdx(item)

  return item
}

const onStoreItem = async (store: any, ctx: LoaderContext) => {
  const item = store.data.item as IProduct
  const processedImages = await pMap(item.images, async (imageUrl) => {
    return {
      url: imageUrl,
      src: await asset_local_rel(item, imageUrl) || default_image().src,
      alt: path.basename(imageUrl)
    }
  }, { concurrency: 1 })
  
  item.images = processedImages.map(img => img.url)
  item.files = await downloadFiles(item.slug, item)
  await complete(item)
  const configPath = path.join(item_path(item), 'config.json')
  write(configPath, JSON.stringify(item, null, 2))
  logger.info(`Stored item ${item.slug} at ${configPath}`)
  return item
}

export function loader(): Loader {
  const load = async ({
    config,
    logger,
    watcher,
    parseData,
    store,
    generateDigest }: LoaderContext) => {

    store.clear()
    let items = await raw()
    for (const item of items) {
      const id = item.slug
      const data = {
        slug: item.slug,
        id,
        title: item.title,
        type: ITEM_TYPE,
        components: [],
        item
      }
      const storeItem = {
        digest: await generateDigest(data),
        filePath: id,
        id: `${item.slug}`,
        data: data
      }

      await onStoreItem(storeItem, {
        logger,
        watcher,
        parseData,
        store,
        generateDigest
      } as any)

      storeItem.data['config'] = JSON.stringify(storeItem.data, null, 2)
      store.set(storeItem)
    }
  }
  return {
    name: `astro:store:${ITEM_TYPE}`,
    load
  }
} 