import { z } from "zod"

import { loadConfig } from '@polymech/astro-base/app/config-loader.js'

const config = loadConfig()

/////////////////////////////////////////////
//
// Optimizations

// Image optimization (imagetools breakpoints & min widths)

export enum E_BROADBAND_SPEED {
  SLOW = "slow",
  MEDIUM = "medium",
  FAST = "fast",
}

const imageConfigSchema = z.object({
  sizes_medium: z.string(),
  sizes_thumbs: z.string(),
  sizes_large: z.string(),
})
const imagesSchema = z.object({
  [E_BROADBAND_SPEED.SLOW]: imageConfigSchema,
  [E_BROADBAND_SPEED.MEDIUM]: imageConfigSchema,
  [E_BROADBAND_SPEED.FAST]: imageConfigSchema,
});

type Images = z.infer<typeof imagesSchema>;

export const IMAGE_PRESET: Images =
{
  [E_BROADBAND_SPEED.SLOW]: config.optimization.presets.slow,
  [E_BROADBAND_SPEED.MEDIUM]: config.optimization.presets.medium,
  [E_BROADBAND_SPEED.FAST]: config.optimization.presets.fast
}