// src/integrations/build-logger.ts
import type { AstroIntegration } from 'astro';

export default function buildLogger(): AstroIntegration {
  return {
    name: 'build-logger',
    hooks: {
      'astro:build:start': () => {
        console.log('Build started');
      },
      'astro:build:setup': ({ vite, target }) => {
        console.log(`Build setup for target: ${target}`);
      },
      'astro:build:generated': ({ dir }) => {
        console.log(`Files generated in: ${dir}`);
      },
      'astro:build:ssr': ({ manifest }) => {
        console.log('SSR build complete');
        console.log(`Manifest entries: ${Object.keys(manifest).length}`);
      },
      'astro:build:done': ({ dir, routes }) => {
        console.log('Build completed');
        console.log(`Output directory: ${dir}`);
        console.log(`Built routes: ${routes.length}`);
        
        // Log details of each built route
        routes.forEach((route, index) => {
          console.log(`[${index + 1}] Route: ${route.route}`);
          console.log(`    Type: ${route.type}`);
          if (route.distURL) {
            console.log(`    Output: ${route.distURL.pathname}`);
          }
        });
      }
    },
  };
}