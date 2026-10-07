import * as path from 'path'
import { findUp } from 'find-up'

import pMap from 'p-map'
import { sanitizeFilename } from "@polymech/fs/utils"
import { execFile } from "child_process";
import { sync as read } from '@polymech/fs/read'
import { sync as exists } from '@polymech/fs/exists'
import { sync as write } from '@polymech/fs/write'
import type { Loader, LoaderContext } from 'astro/loaders'
export * from './howto-model.js'
export * from '@/base/filters.js'

import { IHowto, IImage, ITag, ITEM_TYPE } from './howto-model.js'
import { BLACKLIST, default_filters_markdown, validateLinks } from '../../base/filters.js'
import { download } from '../download.js'


const expandUrls = true

import {
  HOWTO_FILTER_LLM,
  default_image,
  HOWTO_ROOT,
  HOWTO_MIGRATION,
  HOWTO_ADD_RESOURCES,
  HOWTO_ADD_REFERENCES,
  HOWTO_SEO_LLM,
  HOWTO_MAX_ITEMS,
  HOWTO_LLM_KEYWORDS
} from "config/config.js"

import { logger } from '@/base/index.js'
import { applyFilters, default_filters_plain, FilterFunction } from '../../base/filters.js'
import { TemplateContext } from '@/base/kbot-templates.js';
import { template_filter } from '@/base/kbot.js'

const SLUG_BLACKLIST = [
  'how-to-teach-about-plastic-recycling'
]

/////////////////////////////////////////////////////////////////////////
//
//  Assets
//
/////////////////////////////////////////////////////////////////////////
export const item_path = (item: IHowto) => `${HOWTO_ROOT()}/${item.slug}`
export const asset_local_abs = async (item: IHowto, asset: IImage) => {
  const sanitizedFilename = sanitizeFilename(asset.name)
  const asset_path = path.join(HOWTO_ROOT(), item.slug, sanitizedFilename)
  if (exists(asset_path)) {
    return asset_path
  }
  return false
}
export const downloadFiles = async (dst: string, howto: IHowto) => {
  const asset_root = path.join(HOWTO_ROOT(), howto.slug)
  return await pMap(howto.files, async (i) => {
    const sanitizedFilename = sanitizeFilename(i.name).toLowerCase()
    const asset_path = path.join(HOWTO_ROOT(), howto.slug, sanitizedFilename)
    if (!exists(asset_path)) {
      try {
        await download(i.downloadUrl, asset_path)
      } catch (e) {
        logger.error('error download step file', e);
      }
    } else {
      const parts = path.parse(asset_path);
      const zipout = path.join(asset_root, 'files')
      if (parts.ext === '.rar' || parts.ext === '.zip') {
        try {
          if (!exists(asset_path)) {
            logger.error(`File does not exist: ${asset_path}`);
            return;
          }
          if (exists(zipout)) {
            return
          }
          return new Promise<boolean>((resolve, reject) => {
            const timeout = setTimeout(() => {
              child.kill()
              logger.error("Extraction timed out after 15 seconds")
              resolve(false);
            }, 15000);

            const child = execFile("7z", ["e", "" + asset_path, "-o" + zipout], (err, stdout) => {
              clearTimeout(timeout)
              if (err) {
                logger.error(err.message);
                return resolve(false)
              }
              logger.info(`Extracted rar to ${zipout}`)
              return resolve(true)
            });
          });
        } catch (e) {
          logger.error("Error during RAR extraction", e);
        }
      }
    }
  }, { concurrency: 1 })
}
export const asset_local_rel = async (item: IHowto, asset: IImage) => {
  const sanitizedFilename = sanitizeFilename(asset.name).toLowerCase()
  const asset_path = path.join(HOWTO_ROOT(), item.slug, sanitizedFilename)
  if (exists(asset_path)) {
    return asset_path
  } else {
    await download(asset.downloadUrl, asset_path)
  }
  return default_image().src
}
/////////////////////////////////////////////////////////////////////////
//
//  Data
//
/////////////////////////////////////////////////////////////////////////

export const raw = async () => {
  const src = HOWTO_MIGRATION()
  const data = read(src, 'json') as any;
  let howtos = data.v3_howtos as any[]
  howtos = howtos.filter((h) => h.moderation == 'accepted');
  const tags = data.v3_tags;
  howtos.forEach((howto: IHowto) => {
    const howtoTags: ITag[] = []
    for (const ht in howto.tags) {
      const gt: any = tags.find((t) => t._id === ht) || { label: 'untagged' }
      gt && howtoTags.push(gt.label || "")
    }
    howto.user = data.v3_mappins.find((u) => u._id == howto._createdBy);
    howto.tags = howtoTags;
    howto.category = howto.category || {
      label: 'uncategorized'
    }
  })
  howtos = howtos.filter((h: IHowto) => h.steps.length > 0 && !BLACKLIST.includes(h._createdBy))
  howtos = howtos.filter((h: IHowto) => !SLUG_BLACKLIST.includes(h.slug))
  howtos = howtos.slice(0, HOWTO_MAX_ITEMS)
  return howtos
}
export const defaults = async (data: any, cwd: string, root: string) => {
  let defaultsJSON = await findUp('defaults.json', {
    stopAt: root,
    cwd: cwd
  });
  try {
    if (defaultsJSON) {
      data = {
        ...read(defaultsJSON, 'json') as any,
        ...data,
      };
    }
  } catch (error) {
  }
  return data;
}

/////////////////////////////////////////////////////////////////////////
//
//  Content filters & conversions
//
/////////////////////////////////////////////////////////////////////////

// language filter (context: commons, options: simple), see src/config/templates/commons.json
const llm_language = async (text: string): Promise<string> => await template_filter(text, 'simple', TemplateContext.COMMONS)

// default filters (plain), see src/config/filters.json
const filters_default = async (str: string, filters: FilterFunction[] = default_filters_plain) => await applyFilters(str, filters)

// combined content filter that applies both filters in reverse order (LLM first, then filters)
const content = async (str: string, filters: FilterFunction[] = default_filters_plain): Promise<string> => {
  // first apply LLM language filter
  const llm_filtered = await template_filter(str, 'simple', TemplateContext.COMMONS)
  // then apply default text filters
  return await applyFilters(llm_filtered, [...filters, validateLinks])
}

/////////////////////////////////////////////////////////////////////////
//
//  Exports
//
/////////////////////////////////////////////////////////////////////////

const to_github = async (item: IHowto) => {
  const itemDir = item_path(item)
  const readmeContent = [
    '---',
    `title: ${item.title}`,
    `slug: ${item.slug}`,
    `description: ${item.description}`,
    `tags: ${JSON.stringify(item.tags)}`,
    `category: ${item.category?.label || 'uncategorized'}`,
    `difficulty: ${item.difficulty_level}`,
    `time: ${item.time}`,
    `keywords: ${item.keywords || ''}`,
    `location: ${item.user?.geo ? `${item.user.geo.city ? `${item.user.geo.city}, ` : ''}${item.user.geo.countryName || ''}` : ''}`,
    '---',
    '',
    `# ${item.title}`,
    '',
    item.cover_image ? `![${item.title}](${sanitizeFilename(item.cover_image.name)})` : '',
    '',
    item.description,
    item.user?.geo ? `\nUser Location: ${item.user.geo.city ? `${item.user.geo.city}, ` : ''}${item.user.geo.countryName || ''}` : '',
    '',
    '## Steps',
    '',
    ...item.steps.map((step, index) => [
      `### Step ${index + 1}: ${step.title}`,
      '',
      step.text,
      '',
      // Add step images if any
      ...step.images.map(img => `\n![${img.name}](./${sanitizeFilename(img.name)})\n`)
    ].join('\n')),
    '',
    '## Resources',
    '',
    item.resources,
    '',
    '## References',
    '',
    item.references
  ].filter(Boolean).join('\n')
  write(path.join(itemDir, 'README.md'), readmeContent)
}
const to_mdx = async (item: IHowto) => {
  const itemDir = item_path(item)

  // Create index.mdx with all content
  const mdxContent = [
    '---',
    `title: ${item.title}`,
    `slug: ${item.slug}`,
    `description: ${item.description}`,
    `tags: ${JSON.stringify(item.tags)}`,
    `category: ${item.category?.label || 'uncategorized'}`,
    `difficulty: ${item.difficulty_level}`,
    `time: ${item.time}`,
    `location: ${item.user?.geo ? `${item.user.geo.city ? `${item.user.geo.city}, ` : ''}${item.user.geo.countryName || ''}` : ''}`,
    '---',
    '',
    `import { Image } from 'astro:assets'`,
    '',
    `# ${item.title}`,
    '',
    item.cover_image ? `<Image src={import('./${sanitizeFilename(item.cover_image.name)}')} alt="${item.title}" />` : '',
    '',
    item.description,
    item.user?.geo ? `\nUser Location: ${item.user.geo.city ? `${item.user.geo.city}, ` : ''}${item.user.geo.countryName || ''}` : '',
    '',
    '## Steps',
    '',
    ...item.steps.map((step, index) => [
      `### Step ${index + 1}: ${step.title}`,
      '',
      step.text,
      '',
      // Add step images if any using Astro's Image component
      ...step.images.map(img => `\n<Image src={import('./${sanitizeFilename(img.name)}')} alt="${img.name}" />\n`)
    ].join('\n'))
  ].filter(Boolean).join('\n')
  write(path.join(itemDir, 'index.mdx'), mdxContent)
}
const to_astro = async (item: IHowto) => {
  const itemDir = item_path(item)

  // Create index.astro with all content
  const astroContent = [
    '---',
    `import { Image } from 'astro:assets'`,
    `import Layout from '../../layouts/Layout.astro'`,
    '',
    `const { frontmatter } = Astro.props`,
    '',
    `const title = "${item.title}"`,
    `const description = "${item.description}"`,
    `const tags = ${JSON.stringify(item.tags)}`,
    `const category = "${item.category?.label || 'uncategorized'}"`,
    `const difficulty = "${item.difficulty_level}"`,
    `const time = "${item.time}"`,
    `const location = "${item.user?.geo ? `${item.user.geo.city ? `${item.user.geo.city}, ` : ''}${item.user.geo.countryName || ''}` : ''}"`,
    '---',
    '',
    `<Layout title={title} description={description}>`,
    '  <article class="max-w-4xl mx-auto px-4 py-8">',
    `    <h1 class="text-4xl font-bold mb-8">{title}</h1>`,
    '',
    item.cover_image ? `    <Image src={import('./${sanitizeFilename(item.cover_image.name)}')} alt={title} class="w-full rounded-lg shadow-lg mb-8" />` : '',
    '',
    `    <div class="prose prose-lg max-w-none mb-8">`,
    `      <p>{description}</p>`,
    item.user?.geo ? `      <p class="text-gray-600">User Location: ${item.user.geo.city ? `${item.user.geo.city}, ` : ''}${item.user.geo.countryName || ''}</p>` : '',
    `    </div>`,
    '',
    '    <div class="space-y-12">',
    ...item.steps.map((step, index) => [
      `      <section class="step-${index + 1}">`,
      `        <h2 class="text-2xl font-semibold mb-4">Step ${index + 1}: ${step.title}</h2>`,
      `        <div class="prose prose-lg max-w-none mb-6">`,
      `          <Fragment set:html={step.text} />`,
      `        </div>`,
      // Add step images if any using Astro's Image component
      ...step.images.map(img => `        <Image src={import('./${sanitizeFilename(img.name)}')} alt="${img.name}" class="w-full rounded-lg shadow-md mb-6" />`)
    ].join('\n')),
    '    </div>',
    '  </article>',
    '</Layout>'
  ].filter(Boolean).join('\n')
  write(path.join(itemDir, 'index.astro'), astroContent)
}

/////////////////////////////////////////////////////////////////////////
//
//  Store
//
/////////////////////////////////////////////////////////////////////////

const complete = async (item: IHowto) => {
  const configPath = path.join(item_path(item), 'config.json')
  const config = read(configPath, 'json') as IHowto || {}
  // item = { ...item, ...config }
  // Apply content filtering respecting HOWTO_FILTER_LLM flag
  if (HOWTO_FILTER_LLM) {
    item.description = await content(item.description || '')
    // Process steps with content filtering
    item.steps = await pMap(
      item.steps,
      async (step) => ({
        ...step,
        text: await content(step.text)
      })
    )
  } else {
    // Just apply validateLinks if LLM filtering is disabled
    item.description = await applyFilters(item.description || '', [validateLinks])

    // Apply only default filters to steps
    item.steps = await pMap(
      item.steps,
      async (step) => ({
        ...step,
        text: await filters_default(step.text)
      })
    )
  }

  const userLocation = item.user?.geo ? `\nUser Location: ${item.user.geo.city ? `${item.user.geo.city}, ` : ''}${item.user.geo.countryName || ''}` : ''
  item.content = [
    item.description,
    userLocation,
    ...item.steps.map(step => step.text)
  ].filter(Boolean).join('\n\n')

  if (HOWTO_LLM_KEYWORDS) {
    item.keywords = await template_filter(item.content, 'keywords', TemplateContext.HOWTO);
  }
  if (HOWTO_ADD_RESOURCES) {
    // item.resources = await template_filter(item.content, 'toolsAndHardware', TemplateContext.HOWTO);
    item.resources = await applyFilters(item.resources, default_filters_markdown);
    write(path.join(item_path(item), 'resources.md'), item.resources as string)
  }
  if (HOWTO_ADD_REFERENCES) {
    // item.references = await template_filter(item.content, 'references', TemplateContext.HOWTO);
    item.references = await applyFilters(item.references, default_filters_markdown);
    write(path.join(item_path(item), 'references.md'), item.references as string)
  }

  if (HOWTO_SEO_LLM) {
    item.brief = await template_filter(item.content, 'brief', TemplateContext.HOWTO);
  }
  item.content = await applyFilters(item.content || '', [validateLinks])
  await to_github(item)
  // await to_mdx(item)
  // await to_astro(item)

  return item
}
const onStoreItem = async (store: any) => {
  let item = store.data.item as IHowto

  item.steps = item.steps || []
  item.cover_image && (item.cover_image.src = await asset_local_rel(item, item.cover_image))

  item.steps = await pMap(item.steps, async (step) => {
    step.images = await pMap(step.images, async (image) => {
      return {
        ...image,
        src: await asset_local_rel(item, image) || default_image().src,
        alt: image.name || ''
      };
    }, {
      concurrency: 1
    });
    return step;
  }, { concurrency: 1 })

  item.steps.forEach((step) => {
    step.images = step.images.filter((image) => asset_local_abs(item, image))
  })
  item.files = await downloadFiles(item.slug, item)

  item = await complete(item)
  const configPath = path.join(item_path(item), 'config.json')
  write(configPath, JSON.stringify(item, null, 2))
  store.data.item = item
  return store
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
    if (expandUrls) {
      //await urlCache.expandUrls()
    }
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

      const storeItemProcessed = await onStoreItem(storeItem)

      // Emit to LLM Registry
      /*
      try {
        const { LLMRegistry } = await import('@polymech/astro-base/registry')
        LLMRegistry.add("How-To Guides", {
          title: data.title,
          url: `/howtos/${data.slug}`,
          description: storeItemProcessed.data.item.description || ""
        })
      } catch (e) {
        console.error("Failed to emit to LLM Registry", e)
      }
      */

      storeItemProcessed.data['config'] = JSON.stringify(storeItemProcessed.data, null, 2)
      store.set(storeItemProcessed)
    }
  }
  return {
    name: `astro:store:${ITEM_TYPE}`,
    load
  };
}

/////////////////////////////////////////////////////////////////////////
//
//  Taxonomy
//
/////////////////////////////////////////////////////////////////////////
export const group_by_cat = (items: IHowto[]) => {
  return items.reduce((acc: Record<string, IHowto[]>, item: IHowto) => {
    const category = item?.category?.label || 'Uncategorized'
    if (!acc[category]) {
      acc[category] = []
    }
    acc[category].push(item)
    return acc
  }, {})
}