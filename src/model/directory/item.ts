import * as path from 'path'
import { findUp } from 'find-up'
import pMap from 'p-map'
import { sanitizeFilename } from "@polymech/fs/utils"
import { execFileSync, execFile } from "child_process";
import { sync as read } from '@polymech/fs/read'
import { sync as exists } from '@polymech/fs/exists'
import { sync as mkdir } from '@polymech/fs/dir'
import { sync as rm } from '@polymech/fs/remove'
import { sync as write } from '@polymech/fs/write'
import type { Loader, LoaderContext } from 'astro/loaders'
import { resolveVariables } from "@polymech/commons/variables"
import { IUser } from './types.js'
import { BLACKLIST, default_filters_markdown, validateLinks } from '../../base/filters.js'
import { download } from '../download.js'
import { filter } from "@/base/kbot.js"
import { slugify } from "@/base/strings.js"
import { urlCache } from '../../base/url-cache.js';

const expandUrls = true
import {
  DIRECTORY_FILES_WEB,
  DIRECTORY_FILES_ABS,
  DIRECTORY_FILTER_LLM,
  default_image,
  DIRECTORY_ROOT,
  DIRECTORY_GLOB,
  DIRECTORY_MIGRATION,
  DIRECTORY_ANNOTATIONS,
  DIRECTORY_COMPLETE_RESOURCES,
  DIRECTORY_ADD_HARDWARE,
  DIRECTORY_COMPLETE_SKILLS,
  DIRECTORY_LOCAL_RESOURCES,
  DIRECTORY_ADD_RESOURCES,
  DIRECTORY_ADD_REFERENCES,
  DIRECTORY_SEO_LLM,
  DIRECTORY_MAX_ITEMS
} from "config/config.js"

import { env, logger } from '@/base/index.js'
import { applyFilters, default_filters_plain, FilterFunction } from '../../base/filters.js'
import { TemplateContext, buildPrompt, LLMConfig, createTemplates } from '@/base/kbot-templates.js'
import { template_filter } from '@/base/kbot.js'

/////////////////////////////////////////////////////////////////////////
//
//  Assets
//
/////////////////////////////////////////////////////////////////////////

export const item_path = (item: IUser) => `${DIRECTORY_ROOT()}/${item._id}`

/////////////////////////////////////////////////////////////////////////
//
//  Data
//
/////////////////////////////////////////////////////////////////////////

export const raw = async () => {
  const src = DIRECTORY_MIGRATION()
  const data = read(src, 'json') as any;
  let users = data.v3_mappins as any[]
  users = users.filter((u) => u.moderation == 'accepted' && !u._deleted);
  users = users.filter((u: IUser) => !BLACKLIST.includes(u._id))
  users = users.slice(0, DIRECTORY_MAX_ITEMS)
  return users
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

const commons = async (text: string): Promise<string> => {
  return await template_filter(text, 'simple', TemplateContext.COMMONS);
}

const content = async (str: string, filters: FilterFunction[] = default_filters_plain) => await applyFilters(str, filters)

/////////////////////////////////////////////////////////////////////////
//
//  Store
//
/////////////////////////////////////////////////////////////////////////

const complete = async (item: IUser) => {
  const configPath = path.join(item_path(item), 'config.json')
  const config = read(configPath, 'json') as IUser || {}
  // item = { ...item, ...config }
  // commons: language, tone, bullshit filter, and a piece of love, just a bit, at least :)
  if (DIRECTORY_FILTER_LLM) {
    item.detail = await commons(item.detail || '')
  }
  item.detail = await applyFilters(item.detail || '', [validateLinks])

  return item
}

const onStoreItem = async (store: any) => {
  return store
  let item = store.data.item as IUser
  item = await complete(item)
  const configPath = path.join(item_path(item), 'config.json')
  write(configPath, JSON.stringify(item, null, 2))
  logger.info(`Stored item ${item._id} at ${configPath}`)
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
    let items = await raw()
    for (const item of items) {
      const id = item._id
      const data = {
        slug: item._id,
        id,
        title: item.type,
        type: 'directory',
        components: [],
        item
      }

      let storeItem = {
        digest: await generateDigest(data),
        filePath: id,
        id: `${item._id}`,
        data: data
      }
      storeItem = await onStoreItem(storeItem)
      storeItem.data['config'] = JSON.stringify(storeItem.data, null, 2)
      store.set(storeItem)
    }
  }
  return {
    name: `astro:store:directory`,
    load
  };
}

/////////////////////////////////////////////////////////////////////////
//
//  Taxonomy
//
/////////////////////////////////////////////////////////////////////////

export const group_by_type = (items: IUser[]) => {
  return items.reduce((acc: Record<string, IUser[]>, item: IUser) => {
    const type = item?.type || 'untyped'
    if (type === 'untyped') {
      return acc
    }
    if (!acc[type]) {
      acc[type] = []
    }
    acc[type].push(item)
    return acc
  }, {})
} 