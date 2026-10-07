import { IUser } from '../directory/types.js'
export const ITEM_TYPE = 'howto'

export interface ICoverImage {
  name: string
  downloadUrl: string
  type: string
  fullPath: string
  updated: string
  size: number
  timeCreated: string
  contentType: string
}
export interface IStep {
  title: string
  text: string
  images: IImage[]
  _animationKey: string
}
export interface IImage {
  updated: string
  size: number
  fullPath: string
  timeCreated: string
  name: string
  downloadUrl: string
  contentType: string
  type: string
  src: string,
  alt: string
}

/// Taxonomy
export interface ICategory {
  _created: string
  _id: string
  _deleted: boolean
  label: string
  _modified: string
}

export interface ITags {
  [key: string]: boolean
}

export interface ITag {
  categories: string[]
  image: string
  _created: string
  _deleted: boolean
  label: string
  _createdBy: string
  _modified: string
  _id: string
}


// Extended IHowto interface with version field
export interface IHowto {
  _createdBy: string
  mentions: any[]
  _deleted: boolean
  fileLink: string
  slug: string
  _modified: string
  previousSlugs: string[]
  _created: string
  description: string
  votedUsefulBy: string[]
  creatorCountry: string
  total_downloads: number
  title: string
  time: string
  files: any[]
  category: ICategory
  difficulty_level: string
  _id: string
  tags?: ITag[]
  total_views: number
  _contentModifiedTimestamp: string
  cover_image: IImage
  comments: any[]
  moderatorFeedback: string
  steps: IStep[]
  moderation: string
  user?: IUser
  // Added version field (semver)
  version?: string
  // Added content field (description + steps)
  content?: string
  // Added content field : keywords
  keywords?: string
  // Added content field : skills
  skills?: string
  // Added content field : resources
  resources?: string
  // Added content field : references
  references?: string,
  // Added content field : brief
  brief?: string
}