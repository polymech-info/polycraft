import { glob } from 'astro/loaders'
import { defineCollection, z } from "astro:content"
import { ComponentConfigSchema } from '@polymech/commons/component'
import { loader } from '@polymech/astro-base/model/component.js'
import { loader as howtoLoader } from './model/howto/howto.js'

import { loadConfig } from '@polymech/astro-base/app/config-loader.js'

const config = loadConfig()


const LIBARY_BRANCH = config.retail.library_branch

const library = defineCollection({
  loader: loader(LIBARY_BRANCH) as any,
  schema: ComponentConfigSchema.passthrough(),
})

/*
const projects = defineCollection({
  loader: loader(PROJECTS_BRANCH) as any,
  schema: ComponentConfigSchema.passthrough(),
})
*/
/*
const helpcenter = defineCollection({
  schema: z.object({
    title: z.string(),
    intro: z.string(),
  })
})

const infopages = defineCollection({
  schema: z.object({
    title: z.string().optional(),
    intro: z.string().optional(),
  }).passthrough(),
})
*/
const howtos = defineCollection({
  loader: howtoLoader(),
  schema: z.object({
    title: z.string().optional()
  }).passthrough()
})

/*
const directory = defineCollection({
  loader: directorLoader(),
  schema: z.object({
    title: z.string().optional()
  }).passthrough()
})
*/

const resources = defineCollection({
  loader: glob({ base: './src/content/resources', pattern: '**/*.{md,mdx}' }),
  schema: z.object({
    title: z.string().optional().default('Untitled'),
    pubDate: z.date().optional().default(new Date()),
    description: z.string().optional().default('No description provided'),
    author: z.string().optional().default('Anonymous'),
    image: z.object({
      url: z.string().optional().default(''),
      alt: z.string().optional().default('')
    }).optional().default({ url: '', alt: '' }),
    tags: z.array(z.string()).optional().default([]),
    breadcrumb: z.boolean().optional().default(true)
  }).passthrough(),
});

export const collections = {
  library,
  resources,
  //helpcenter,
  //infopages,
  howtos,
  //directory
};