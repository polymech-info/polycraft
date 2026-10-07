import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { createComponent } from "astro/runtime/server/astro-component.js";
import { renderTemplate, unescapeHTML } from "astro/runtime/server/index.js";

import { findUp } from 'find-up'
import { createLogger } from '@polymech/log'
import { parse, IProfile } from '@polymech/commons/profile'

import {
    LOGGING_NAMESPACE,
    OSRL_ENV,
    OSRL_PRODUCT_PROFILE,
    PRODUCT_ROOT
} from 'config/config.js'

export const logger = createLogger(LOGGING_NAMESPACE)
export const boot = () => logger.info('Astro is booting up')
export const env = (item_rel: string = ""): IProfile => {
    let default_profile: IProfile = {
        includes: [],
        variables: {
            root: PRODUCT_ROOT(),
            product: item_rel,
            product_rel: item_rel,
        }
    }
    default_profile = parse(OSRL_PRODUCT_PROFILE, default_profile, { env: OSRL_ENV })
    return default_profile;
}
export const render = async (string) => {
    const html = `${unescapeHTML(string)}`
    return createComponent(() => renderTemplate(html as any, []))
}
export const item_defaults = async (itemDir) => {
    return await findUp('defaults.json', {
        stopAt: PRODUCT_ROOT(),
        cwd: itemDir
    })
}
export async function markdownToHtml(markdown: string): Promise<string> {
    const result = await unified()
        .use(remarkParse)
        .use(remarkRehype, { allowDangerousHtml: true }) // ← preserve raw HTML
        .use(rehypeStringify, { allowDangerousHtml: true }) // ← allow it through
        .process(markdown);

    return result.toString();
}
export const createMarkdownComponent = async (markdown: string) => {
    const html = await markdownToHtml(markdown);
    return createComponent(() => renderTemplate(html as any, []));
}
export const createHTMLComponent = async (html: string) =>
    createComponent(() => renderTemplate(unescapeHTML(html) as any, []))