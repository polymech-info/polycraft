import { z } from "zod"
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
  [E_BROADBAND_SPEED.SLOW]: {
    // For 2g connections: smaller image widths help performance. (Middle East & Africa)
    sizes_medium: "(min-width: 100px) 100px, 100vw",
    sizes_thumbs: "(min-width: 80px) 80px, 80vw",
    sizes_large: "(min-width: 320px) 320px, 320vw",
  },
  [E_BROADBAND_SPEED.MEDIUM]: 
  {
    // For 3g connections: a moderate size image for a balance of quality and speed.
    sizes_medium: "(min-width: 400px) 400px, 400vw",
    sizes_thumbs: "(min-width: 180px) 180px, 180vw",
    sizes_large: "(min-width: 1024px) 1024px, 1024vw",
  },
  [E_BROADBAND_SPEED.FAST]: 
  {
    // For 4g connections: larger images for high-resolution displays.
    sizes_medium: "(min-width: 1024px) 1024px, 1024vw",
    sizes_thumbs: "(min-width: 180px) 180px, 180vw",
    sizes_large: "(min-width: 1200px) 1200px, 1200vw"
  }
}