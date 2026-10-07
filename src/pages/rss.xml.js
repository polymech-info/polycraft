import rss from '@astrojs/rss';
import { getCollection } from 'astro:content'
import sanitizeHtml from 'sanitize-html';
import MarkdownIt from 'markdown-it';
const parser = new MarkdownIt()
import { RSS_CONFIG } from '../app/config'

export async function GET(context) {
  const blog = []
  const store = []
  const all = [ ...blog ]
  return rss({
    site: context.site,    
    items: all.map((post) => ({
      link: `/blog/${post.id}/`,
      content: sanitizeHtml(parser.render(post.body), {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img'])
      }),
      ...post.data,
    })),
    ...RSS_CONFIG
  });
}
