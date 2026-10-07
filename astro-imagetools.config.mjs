import { defineConfig } from "imagetools/config"
// https://astro-imagetools-docs.vercel.app/en/global-config-options/
export default defineConfig({
    placeholder: "blurred",
    format: ["avif", "jpg"],
    fallbackFormat: "jpg",
    delay:100,
    includeSourceFormat: false,
    cacheRoot: "./cache",
    cacheDir: "./cache",
    formatOptions: {
      jpg: {
        quality: 80,
      },
      png: {
        quality: 80,
      },
      webp: {
        quality: 50,
      }
    }
});