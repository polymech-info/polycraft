import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
// Force restart
import { imagetools } from "imagetools"
import react from "@astrojs/react"
import mdx from "@astrojs/mdx";
import { defineConfig } from 'astro/config';
import sitemap from "@astrojs/sitemap";
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
import getReadingTime from 'reading-time';
import { toString } from 'mdast-util-to-string';
import { PolymechInstance } from "@polymech/astro-base/registry";
import PolymechIntegration from "@polymech/astro-base/integration";
import { loadConfig } from '@polymech/astro-base/app/config-loader';

import cache from '@polymech/astro-cache';
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const argv = yargs(hideBin(process.argv)).argv;
const config = loadConfig();

PolymechInstance.setConfig({
  ...config,
  callbacks: {
    onConfigUpdate: (config) => {
      //console.log('MyPages config updated:', config);
    },
    onLanguageChange: (lang) => {
      console.log('Language changed to:', lang);
    },
    onRouteRender: (path, { lang, slug }) => {
      console.log('Route rendered:', path, { lang, slug });
    },
    get: (path, { lang, slug }) => {
      //console.log('Getting data for:2', path, { lang, slug });
      return {
        title: 'Product Page',
        description: 'This is a product page',
        sharedPageText: 'This is shared text'
      };
    }
  }
});

export function remarkReadingTime() {
  return function (tree, { data }) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(textOnPage);
    data.astro.frontmatter.minutesRead = readingTime.text;
  };
}

export default defineConfig({
  site: 'https://library.polymech.info',
  devToolbar: {
    enabled: true,
  },
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: "en",
  },
  sidebar: [
    {
      label: 'Resources',
      autogenerate: { directory: 'resources' },
    }
  ],
  alias: {
    "@base": "../polymech-site/src"
  },
  vite: {
    resolve: {
      alias: {
        '@components': '/src/components',
        '@layouts': '/src/layouts'
      }
    },
    plugins: [
      tailwindcss({
        config: './tailwind.config.cjs',
        jit: true
      }),
    ],
    build: {
      target: 'esnext',
      assetsDir: './assets',
      modulePreload: { polyfill: false },
      commonjsOptions: { esmExternals: true },
      assetsInlineLimit: 1024,
      sourcemap: 'inline',
      
    },
    cacheDir: "./cache", 
    ssr: {
      external: ['cacache', 'glob', 'xlsx', 'sharp', '@polymech/kbot-d']
    }
  },
  markdown: {
    drafts: true,
    shikiConfig: {
      theme: "github-light-default"
    }
  },
  shikiConfig: {
    wrap: true,
    skipInline: false,
    drafts: true
  },
  integrations: [
    cache({
      cacheComponents: 'persistent'
    }),
    imagetools,
    sitemap({}),
    PolymechIntegration(),
    mdx({
      rehypePlugins: [
        rehypeAccessibleEmojis,
        remarkReadingTime
      ],
    }),
    //AstroPWA({}),
    react(),
  ]
});