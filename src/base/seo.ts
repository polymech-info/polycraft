
import { IComponentConfig } from '@polymech/commons'
import { sync as read } from '@polymech/fs/read'

import { translate } from '@polymech/astro-base/base/i18n.js'
import { item_defaults } from '@/base/index.js'

import config from "../config/config.json" with { "type": "json" }
const I18N_SOURCE_LANGUAGE = 'en'

const keywords = (keywords: string) => keywords.split(',').map(k => k.trim()).filter(Boolean);

const unique = (...keywordGroups: string[][]) => {
    return Array.from(new Set(keywordGroups.flat()))
};

export const site_keywords = async (locale: string = I18N_SOURCE_LANGUAGE) => {
    const configKeywords = keywords(config.metadata.keywords || "");
    const allKeywords = unique(configKeywords)
    const system_keywords = await translate(allKeywords.join(','), I18N_SOURCE_LANGUAGE, locale);
    const keywordsArray = keywords(system_keywords)
    return keywordsArray.join(',');
};

export const item_keywords = async (item: IComponentConfig | null, locale: string = I18N_SOURCE_LANGUAGE) => {
    if (!item) {
        return (await site_keywords(locale))
    }

    let system_keywords = "";
    if (item.PRODUCT_ROOT) {
        const defaultsJson = await item_defaults(item.PRODUCT_ROOT);
        const defaults: Record<string, string> = defaultsJson ? read(defaultsJson, 'json') as Record<string, string> || {} : {}
        const defaultsKeywords = keywords(defaults.keywords || "")
        const configKeywords = await site_keywords(locale)
        const itemKeywords = keywords(item.keywords || "")
        const allKeywords = unique(defaultsKeywords, configKeywords.split(','), itemKeywords)
        system_keywords = await translate(allKeywords.join(','), I18N_SOURCE_LANGUAGE, locale)
    }
    const keywordsArray = unique([item.name], keywords(system_keywords))
    return keywordsArray.join(',')
};
