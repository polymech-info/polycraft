import { get_cached_object, set_cached_object, rm_cached_object } from "@polymech/cache"
import { run, OptionsSchema } from "@polymech/kbot-d";
import { resolveVariables } from "@polymech/commons/variables"
import { } from "@polymech/core/objects"
import { logger, env } from "./index.js"
import { removeEmptyObjects } from "@/base/objects.js"
import { LLM_CACHE } from "@/config/config.js"

import {
    TemplateProps,
    TemplateContext,
    createTemplates
} from "./kbot-templates.js";

export interface Props extends TemplateProps {
    context?: TemplateContext;
}

export const filter = async (content: string, tpl: string = 'howto', opts: Props = {}) => {
    if (!content || content.length < 20) {
        return content;
    }
    const context = opts.context || TemplateContext.COMMONS;
    const templates = createTemplates(context);
    if (!templates[tpl]) {
        return content;
    }
    const template = typeof templates[tpl] === 'function' ? templates[tpl]() : templates[tpl];
    const options = getFilterOptions(content, template, opts);
    const cache_key_obj = {
        content,
        tpl,
        context,
        ...options,
        filters: [],
        tools: []
    };
    const ca_options = JSON.parse(JSON.stringify(removeEmptyObjects(cache_key_obj)));
    let cached
    try {
        cached = await get_cached_object({ ca_options }, 'kbot') as { content: string }
    } catch (e) {
        logger.error(`Failed to get cached object for ${content.substring(0, 20)}`, e);
    }
    if (cached) {
        if (LLM_CACHE) {
            return cached.content;
        } else {
            rm_cached_object({ ca_options }, 'kbot')
        }
    }

    logger.info(`kbot: template:${tpl} : context:${context} @ ${options.model}`)
    const result = await run(options);
    if (!result || !result[0]) {
        logger.error(`No result for ${content.substring(0, 20)}`)
        return content;
    }
    if (template.format === 'json') {
        try {
            const jsonResult = JSON.parse(result[0] as string);
            await set_cached_object(content, ca_options, { content: jsonResult }, 'kbot');
            return jsonResult;
        } catch (e) {
            logger.error('Failed to parse JSON response:', e);
            return result[0];
        }
    }
    await set_cached_object({ ca_options }, 'kbot', { content: result[0] }, {})
    logger.info(`kbot-result: template:${tpl} : context:${context} @ ${options.model} : ${result[0]}`)
    return result[0] as string;
};

export const template_filter = async (text: string, template: string, context: TemplateContext = TemplateContext.COMMONS) => {
    if (!text || text.length < 20) {
        return text;
    }
    const templates = createTemplates(context);
    debugger
    if (!templates[template]) {
        logger.warn(`No template found for ${template}`);
        return text;
    }
    const templateConfig = templates[template]();
    const resolvedTemplate = Object.fromEntries(
        Object.entries(templateConfig).map(([key, value]) => [
            key,
            typeof value === 'string' ? resolveVariables(value, true) : value
        ])
    );
    const resolvedText = resolveVariables(text, true);
    const ret = await filter(resolvedText, template, {
        context,
        ...resolvedTemplate,
        prompt: `${resolvedTemplate.prompt}\n\nText to process:\n${resolvedText}`,
        variables: env().variables
    });
    return ret;
};
export const getFilterOptions = (content: string, template: any, opts: Props = {}) => {
    return OptionsSchema().parse({
        ...template,
        prompt: `${template.prompt || ""} : ${content}`,
        ...opts,
    });
};