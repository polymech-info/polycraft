import * as path from 'path'
import { IMAGE_PRESET, E_BROADBAND_SPEED } from "./network.js"
import { resolve, template } from '@polymech/commons'
import { sync as read } from '@polymech/fs/read'
import { sanitizeUri } from 'micromark-util-sanitize-uri'
import { AppConfig } from './config-types.js'
import { loadConfig } from '@polymech/astro-base/app/config-loader.js'
import { appConfigSchema } from './config.schema.js'

const config = loadConfig(
  'en',
  './app-config.json',
  appConfigSchema
) as AppConfig

export const OSR_ROOT = () => path.resolve(resolve(config.core.osr_root))
export const FILE_SERVER_DEV = config.dev.file_server
export const I18N_SOURCE_LANGUAGE = config.i18n.source_language
// LLM
export const LLM_CACHE = config.llm.cache
export const LLM_CACHE_DIR = config.llm.cache_dir

export const LOGGING_NAMESPACE = config.core.logging_namespace
export const TRANSLATE_CONTENT = config.core.translate_content
export const LANGUAGES = config.core.languages
export const LANGUAGES_PROD = config.core.languages_prod
export const isRTL = (lang) => config.core.rtl_languages.includes(lang)

// i18n constants
export const I18N_STORE = (root, lang) => template(config.i18n.store, { root, lang, LANG: lang, OSR_ROOT: root })
export const I18N_CACHE = config.i18n.cache
export const I18N_ASSET_PATH = config.i18n.asset_path

// Library - Howtos
export const HOWTO_GLOB = config.howtos.glob
export const FILES_WEB = config.howtos.files_web
export const HOWTO_EDIT_ROOT = config.howtos.edit_root
export const HOWTO_FILTER_LLM = config.howtos.filter_llm
export const HOWTO_LLM_KEYWORDS = config.howtos.llm_keywords
export const HOWTO_ANNOTATIONS = config.howtos.annotations
export const HOWTO_ANNOTATIONS_CACHE = config.howtos.annotations_cache
export const HOWTO_COMPLETE_RESOURCES = config.howtos.complete_resources
export const HOWTO_ADD_HARDWARE = config.howtos.add_hardware
export const HOWTO_ADD_RESOURCES = config.howtos.add_resources
export const HOWTO_ADD_REFERENCES = config.howtos.add_references
export const HOWTO_COMPLETE_SKILLS = config.howtos.complete_skills
export const HOWTO_LOCAL_RESOURCES = config.howtos.local_resources
export const HOWTO_SEO_LLM = config.howtos.seo_llm
export const HOWTO_MAX_ITEMS = config.howtos.max_items

export const HOWTO_ROOT_INTERN = () => path.resolve(resolve(config.howtos.root_intern))
export const HOWTO_ROOT = () => path.resolve(resolve(config.howtos.root))
export const HOWTO_FILES_ABS = (id) => `${HOWTO_ROOT()}/${id}`
export const HOWTO_FILES_WEB = (id: string) => `${FILES_WEB}/${id}`
export const HOWTO_EDIT_URL = (id: string, lang: string) => `${HOWTO_EDIT_ROOT}/${id}`

// Library - Directory
export const DIRECTORY_GLOB = config.directory.glob
export const DIRECTORY_FILES_BASE = config.directory.files_base
export const DIRECTORY_EDIT_ROOT = config.directory.edit_root
export const DIRECTORY_FILTER_LLM = config.directory.filter_llm
export const DIRECTORY_ANNOTATIONS = config.directory.annotations
export const DIRECTORY_ANNOTATIONS_CACHE = config.directory.annotations_cache
export const DIRECTORY_COMPLETE_RESOURCES = config.directory.complete_resources
export const DIRECTORY_ADD_HARDWARE = config.directory.add_hardware
export const DIRECTORY_ADD_RESOURCES = config.directory.add_resources
export const DIRECTORY_ADD_REFERENCES = config.directory.add_references
export const DIRECTORY_COMPLETE_SKILLS = config.directory.complete_skills
export const DIRECTORY_LOCAL_RESOURCES = config.directory.local_resources
export const DIRECTORY_SEO_LLM = config.directory.seo_llm
export const DIRECTORY_MAX_ITEMS = config.directory.max_items

export const DIRECTORY_MIGRATION = () => path.resolve(resolve(config.directory.migration))
export const DIRECTORY_ROOT_INTERN = () => path.resolve(resolve(config.directory.root_intern))
export const DIRECTORY_ROOT = () => path.resolve(resolve(config.directory.root))
export const DIRECTORY_FILES_ABS = (id) => `${DIRECTORY_ROOT()}/${id}`
export const DIRECTORY_FILES_WEB = (id: string) => `${DIRECTORY_FILES_BASE}/${id}`
export const DIRECTORY_EDIT_URL = (id: string, lang: string) => `${DIRECTORY_EDIT_ROOT}/${id}`

// Library Components
export const COMPONENT_ROOT = () => path.resolve(resolve(config.components.root))
export const COMPONENT_GLOB = config.components.glob
export const ENABLED_COMPONENTS = resolve(config.components.enabled)
export const COMPONENT_SPECS = (rel) => `${COMPONENT_ROOT()}/${rel}/specs.xlsx`

// Products
export const HOWTO_MIGRATION = () => path.resolve(resolve(config.products.howto_migration))

// Products
export const PRODUCT_ROOT = () => path.resolve(resolve(config.products.root))
export const PRODUCT_BRANCHES = read(path.join('.', 'library.json'), 'json')
export const PRODUCT_GLOB = config.products.glob

// Product compiler
export const PRODUCT_CONFIG = (product) =>
  path.resolve(resolve(`${PRODUCT_ROOT()}/${product}/config.json`, false,
    {
      product
    }))
export const PRODUCT_DIR = (product) => path.resolve(resolve(`${PRODUCT_ROOT()}/${product}`))
export const PRODUCT_HUGO_TEMPLATE = './osr/hugo/root.html'
export const PRODUCTS_TARGET_SRC = './src/content/en/retail'
export const PRODUCTS_TARGET = (lang) => `./content/${lang}/products`

// Product assets
export const ASSETS_LOCAL = config.assets.local
export const ASSETS_GLOB = config.assets.glob

// OSRL - Language
export const IS_DEV = true
export const OSRL_ENV = config.osrl.env
export const OSRL_ENV_DEV = config.osrl.env_dev
export const OSRL_ENVIRONMENT = IS_DEV ? OSRL_ENV_DEV : OSRL_ENV
export const OSRL_MODULE_NAME = config.osrl.module_name
export const OSRL_PRODUCT_PROFILE = config.osrl.product_profile
export const OSRL_LANG_FLAVOR = config.osrl.lang_flavor

// Products
export const ENABLED_PRODUCTS = resolve(config.products.enabled)
export const PRODUCT_SPECS = (rel) => `${PRODUCT_ROOT()}/${rel}/specs.xlsx`

// Tasks
export const TASK_CONFIG_LOG_DIRECTORY = config.tasks.config_log_directory

// Task: compile:content
export const TASK_COMPILE_CONTENT = config.tasks.compile_content
export const TASK_COMPILE_CONTENT_CACHE = config.tasks.compile_content_cache

// Task - Logging
export const TASK_LOG_DIRECTORY = config.tasks.log_directory


// Task - Retail Config
export const REGISTER_PRODUCT_TASKS = true
export const LIBARY_BRANCH = config.retail.library_branch
export const PROJECTS_BRANCH = config.retail.projects_branch
export const RETAIL_COMPILE_CACHE = config.retail.compile_cache
export const RETAIL_MEDIA_CACHE = config.retail.media_cache
export const RETAIL_LOG_LEVEL_I18N_PRODUCT_ASSETS = config.retail.log_level_i18n_product_assets

export const ConvertProductMedia = config.retail.convert_product_media
export const TranslateProductAssets = config.retail.translate_product_assets
export const PopulateProductDefaults = config.retail.populate_product_defaults

// CAD 
export const CAD_MAIN_MATCH = (product) => template(config.cad.main_match, { product })
export const CAD_CAM_MAIN_MATCH = (product) => template(config.cad.cam_main_match, { product })

export const CAD_CACHE = config.cad.cache
export const CAD_EXPORT_CONFIGURATIONS = config.cad.export_configurations
export const CAD_EXPORT_SUB_COMPONENTS = config.cad.export_sub_components
export const CAD_MODEL_FILE_PATH = (SOURCE, CONFIGURATION = '') =>
  SOURCE.replace('.json', `${CONFIGURATION ? '-' + CONFIGURATION : ''}${config.cad.model_ext}`)
export const CAD_DEFAULT_CONFIGURATION = config.cad.default_configuration
export const CAD_RENDERER = config.cad.renderer
export const CAD_RENDERER_VIEW = config.cad.renderer_view
export const CAD_RENDERER_QUALITY = config.cad.renderer_quality
export const CAD_EXTENSIONS = config.cad.extensions
export const CAD_MODEL_EXT = config.cad.model_ext

export const CAD_URL = (file: string, variables: Record<string, string>) =>
  sanitizeUri(template(config.assets.cad_url, { file, ...variables }))

export const ASSET_URL = (file: string, variables: Record<string, string>) =>
  sanitizeUri(template(config.assets.url, { file, ...variables }))

export const ITEM_ASSET_URL_R = (variables: Record<string, string>) =>
  template(config.assets.item_url_r, variables)

export const ITEM_ASSET_URL = (variables: Record<string, string>) =>
  template(config.assets.item_url, variables)

//back compat - osr-cad
export const parseBoolean = (value: string): boolean => {
  return value === '1' || value.toLowerCase() === 'true';
}
/////////////////////////////////////////////
//
// Rendering
export const SHOW_DESCRIPTION = config.features.show_description
export const SHOW_LICENSE = config.features.show_license
export const SHOW_RENDERINGS = config.features.show_renderings

export const SHOW_TABS = config.features.show_tabs
export const SHOW_GALLERY = config.features.show_gallery
export const SHOW_FILES = config.features.show_files
export const SHOW_SPECS = config.features.show_specs
export const SHOW_CHECKOUT = config.features.show_checkout
export const SHOW_CONTACT = config.features.show_contact
export const SHOW_3D_PREVIEW = config.features.show_3d_preview
export const SHOW_RESOURCES = config.features.show_resources
export const SHOW_DEBUG = config.features.show_debug
export const SHOW_SAMPLES = config.features.show_samples
export const SHOW_README = config.features.show_readme
export const SHOW_RELATED = config.features.show_related
export const SHOW_SHOWCASE = config.features.show_showcase
export const SHOW_SCREENSHOTS = config.features.show_screenshots

/////////////////////////////////////////////
//
// Plugins
//

// RSS
export const RSS_CONFIG = config.rss

/////////////////////////////////////////////
//
// Defaults

export const DEFAULT_IMAGE_URL = config.defaults.image_url

export const default_image = () => {
  return {
    alt: 'none',
    src: DEFAULT_IMAGE_URL,
    thumb: DEFAULT_IMAGE_URL
  }
}

export const DEFAULT_LICENSE = config.defaults.license
export const DEFAULT_CONTACT = config.defaults.contact

/////////////////////////////////////////////
//
// Optimization

export const O_IMAGE = IMAGE_PRESET[E_BROADBAND_SPEED.MEDIUM]
export const IMAGE_SETTINGS = config.optimization.image_settings