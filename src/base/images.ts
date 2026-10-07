export interface ExifData {
  name: string;
  value: string;
}

export interface ImageSEOData {
  src: string;
  alt: string;
  title: string;
  caption?: string;
  fileName: string;
  format: string;
  size: string;
  metadata: {
    location?: string;
    camera?: string;
    keywords: string[];
    exifData: ExifData[];
  };
}

export interface GalleryImage {
  name?: string
  url?: string
  src: string
  meta?: Meta
  keywords?: string
  description?: string
  alt?: string
  title?: string
  height?: number
  width?: number
  gps?: { lon: number, lat: number }
}

export interface MetaJSON {
  alt?: string,
  keywords?: "",
  title?: "",
  description?: ""
}
export interface Meta {
  format: string
  width: number
  height: number
  space: string
  channels: number
  depth: string
  density: number
  chromaSubsampling: string
  isProgressive: boolean
  resolutionUnit: string
  hasProfile: boolean
  hasAlpha: boolean
  orientation: number
  exif: Exif
  json: MetaJSON
  markdown: string
}

export interface Exif {
  file: File
  jfif: Jfif
  exif: Exif2
  gps: Gps
}

export interface File {
  "Bits Per Sample": BitsPerSample
  "Image Height": ImageHeight
  "Image Width": ImageWidth
  "Color Components": ColorComponents
  Subsampling: Subsampling
  FileType: FileType
}

export interface BitsPerSample {
  value: number
  description: string
}

export interface ImageHeight {
  value: number
  description: string
}

export interface ImageWidth {
  value: number
  description: string
}

export interface ColorComponents {
  value: number
  description: string
}

export interface Subsampling {
  description: string
}

export interface FileType {
  value: string
  description: string
}

export interface Jfif {
  "JFIF Version": JfifVersion
  "Resolution Unit": ResolutionUnit
  XResolution: Xresolution
  YResolution: Yresolution
  "JFIF Thumbnail Width": JfifThumbnailWidth
  "JFIF Thumbnail Height": JfifThumbnailHeight
}

export interface JfifVersion {
  value: number
  description: string
}

export interface ResolutionUnit {
  value: number
  description: string
}

export interface Xresolution {
  value: number
  description: string
}

export interface Yresolution {
  value: number
  description: string
}

export interface JfifThumbnailWidth {
  value: number
  description: string
}

export interface JfifThumbnailHeight {
  value: number
  description: string
}

export interface Exif2 {
  ImageDescription: ImageDescription
  Make: Make
  Model: Model
  Orientation: Orientation
  XResolution: Xresolution2
  YResolution: Yresolution2
  ResolutionUnit: ResolutionUnit2
  Software: Software
  DateTime: DateTime
  YCbCrPositioning: YcbCrPositioning
  "Exif IFD Pointer": ExifIfdPointer
  "GPS Info IFD Pointer": GpsInfoIfdPointer
  XPTitle: Xptitle
  XPSubject: Xpsubject
  Padding: Padding
  ExposureTime: ExposureTime
  FNumber: Fnumber
  ExposureProgram: ExposureProgram
  ISOSpeedRatings: IsospeedRatings
  ExifVersion: ExifVersion
  DateTimeOriginal: DateTimeOriginal
  DateTimeDigitized: DateTimeDigitized
  ComponentsConfiguration: ComponentsConfiguration
  ExposureBiasValue: ExposureBiasValue
  MeteringMode: MeteringMode
  LightSource: LightSource
  Flash: Flash
  FocalLength: FocalLength
  SubSecTime: SubSecTime
  SubSecTimeOriginal: SubSecTimeOriginal
  SubSecTimeDigitized: SubSecTimeDigitized
  FlashpixVersion: FlashpixVersion
  ColorSpace: ColorSpace
  PixelXDimension: PixelXdimension
  PixelYDimension: PixelYdimension
  ExposureMode: ExposureMode
  WhiteBalance: WhiteBalance
  DigitalZoomRatio: DigitalZoomRatio
  FocalLengthIn35mmFilm: FocalLengthIn35mmFilm
  SceneCaptureType: SceneCaptureType
  GPSLatitudeRef: GpslatitudeRef
  GPSLatitude: Gpslatitude
  GPSLongitudeRef: GpslongitudeRef
  GPSLongitude: Gpslongitude
  GPSAltitude: Gpsaltitude
}

export interface ImageDescription {
  id: number
  description: string
}

export interface Make {
  id: number
  description: string
}

export interface Model {
  id: number
  description: string
}

export interface Orientation {
  id: number
  value: number
  description: string
}

export interface Xresolution2 {
  id: number
  description: string
}

export interface Yresolution2 {
  id: number
  description: string
}

export interface ResolutionUnit2 {
  id: number
  value: number
  description: string
}

export interface Software {
  id: number
  description: string
}

export interface DateTime {
  id: number
  description: string
}

export interface YcbCrPositioning {
  id: number
  value: number
  description: string
}

export interface ExifIfdPointer {
  id: number
  value: number
  description: number
}

export interface GpsInfoIfdPointer {
  id: number
  value: number
  description: number
}

export interface Xptitle {
  id: number
  description: string
}

export interface Xpsubject {
  id: number
  description: string
}

export interface Padding {
  id: number
  description: string
}

export interface ExposureTime {
  id: number
  description: string
}

export interface Fnumber {
  id: number
  description: string
}

export interface ExposureProgram {
  id: number
  value: number
  description: string
}

export interface IsospeedRatings {
  id: number
  value: number
  description: number
}

export interface ExifVersion {
  id: number
  description: string
}

export interface DateTimeOriginal {
  id: number
  description: string
}

export interface DateTimeDigitized {
  id: number
  description: string
}

export interface ComponentsConfiguration {
  id: number
  description: string
}

export interface ExposureBiasValue {
  id: number
  description: string
}

export interface MeteringMode {
  id: number
  value: number
  description: string
}

export interface LightSource {
  id: number
  value: number
  description: string
}

export interface Flash {
  id: number
  value: number
  description: string
}

export interface FocalLength {
  id: number
  description: string
}

export interface SubSecTime {
  id: number
  description: string
}

export interface SubSecTimeOriginal {
  id: number
  description: string
}

export interface SubSecTimeDigitized {
  id: number
  description: string
}

export interface FlashpixVersion {
  id: number
  description: string
}

export interface ColorSpace {
  id: number
  value: number
  description: string
}

export interface PixelXdimension {
  id: number
  value: number
  description: number
}

export interface PixelYdimension {
  id: number
  value: number
  description: number
}

export interface ExposureMode {
  id: number
  value: number
  description: string
}

export interface WhiteBalance {
  id: number
  value: number
  description: string
}

export interface DigitalZoomRatio {
  id: number
  description: string
}

export interface FocalLengthIn35mmFilm {
  id: number
  value: number
  description: string
}

export interface SceneCaptureType {
  id: number
  value: number
  description: string
}

export interface GpslatitudeRef {
  id: number
  description: string
}

export interface Gpslatitude {
  id: number
  description: number
}

export interface GpslongitudeRef {
  id: number
  description: string
}

export interface Gpslongitude {
  id: number
  description: number
}

export interface Gpsaltitude {
  id: number
  description: string
}

export interface Gps {
  Latitude: number
  Longitude: number
}

export const generateDefaultImageJSONLD = (imageData: ImageSEOData) => {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    "contentUrl": imageData.src,
    "name": imageData.title,
    "description": imageData.caption || imageData.alt,
    "width": parseInt(imageData.size.split('x')[0]),
    "height": parseInt(imageData.size.split('x')[1]),
    "thumbnail": `https://example.com/thumbnails/${imageData.fileName}`,
    "license": "https://example.com/license",
    "acquireLicensePage": "https://example.com/buy-license",
    "copyrightNotice": `© ${new Date().getFullYear()} Default Organization`,
    "creator": {
      "@type": "Person",
      "name": "Default Creator Name"
    },
    "copyrightHolder": {
      "@type": "Organization",
      "name": "Default Organization Name"
    },
    "contentLocation": imageData.metadata.location || "Unknown location",
    "datePublished": new Date().toISOString().split('T')[0],
    "exifData": imageData.metadata.exifData.length > 0 ? imageData.metadata.exifData : [
      {
        "@type": "PropertyValue",
        "name": "Camera",
        "value": imageData.metadata.camera || "Unknown camera"
      },
      {
        "@type": "PropertyValue",
        "name": "Keywords",
        "value": imageData.metadata.keywords.join(', ')
      }
    ]
  };
}
