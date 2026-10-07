import { defineCollection, z } from 'astro:content';

const resources = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    author: z.string().optional(),
    pubDate: z.date().optional(),
    tags: z.array(z.string()).optional(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }).optional(),
    sidebar: z.object({
      hide: z.boolean().optional(),
      label: z.string().optional(),
      items: z.array(z.object({
        label: z.string(),
        href: z.string(),
      })).optional(),
    }).optional(),
  }),
});
const store = defineCollection({
  type: 'content',
  schema: z.object({
    rel: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    // Add other store-specific fields as needed
  }),
});

export const collections = {
  'resources': resources,
  'store': store,
};
