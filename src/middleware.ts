import { defineMiddleware } from 'astro/middleware';

export const onRequest = defineMiddleware((context, next) => {
  if (context.request.url.endsWith('/sitemap.xml')) {
    return context.redirect('/sitemap-root.xml'); // Ensure direct access
  }
  return next();
});