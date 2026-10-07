import { translate } from '../base/i18n.js'
import { I18N_SOURCE_LANGUAGE } from 'config/config.js'
import config from "./config.json" with { type: "json" }
import pMap from 'p-map'

export const items = async (opts: { locale: string }) => {
    const _T = async (text: string) => await translate(text, I18N_SOURCE_LANGUAGE, opts.locale)
    return [
        {
            "href": `/`,
            "title": _T("Home"),
            "ariaLabel": "Home",
            "class": "hover:text-orange-600"
        },
        {
            "href": `/${opts.locale}/infopages/resources`,
            "title": _T("Resources"),
            "ariaLabel": "Resources",
            "class": "hover:text-orange-600"
        }
    ]
}
const isAbsoluteUrl = (url: string): boolean => /^[a-zA-Z]+:/.test(url);

const createFooterLinks = async (items: any[], locale: string) => {
    const _T = async (text: string) => await translate(text, I18N_SOURCE_LANGUAGE, locale);

    return await pMap(items, async (item) => {
        const translatedText = await _T(item.text); // Single translation call

        return {
            "href": isAbsoluteUrl(item.href) ? item.href : `/${locale}${item.href}`,
            "title": translatedText,  // Use cached translation
            "ariaLabel": translatedText,  // Use cached translation
            "class": "hover:text-orange-600"
        };
    });
};

export const footer_left = (locale: string) => createFooterLinks(config.footer_left, locale);
export const footer_right = (locale: string) => createFooterLinks(config.footer_right, locale);
