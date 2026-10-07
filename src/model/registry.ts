//import { get as  handleRSS } from './rss.js'
import { get as handleMerchant } from './product/merchant.js'
import { get as handleJsonLd } from './product/json-ld.js'
import { get as handleJsonLdHowto } from './howto/json-ld-howto.js'
import type { IComponentNode, IComponentConfig } from '@polymech/commons/'

export type Handler = (node: IComponentNode, config: IComponentConfig, opts: { url?: string }) => Promise<any>

export const registry: Record<string, Handler> = {
    //'rss': handleRSS,
    'merchant': handleMerchant,
    'json-ld': handleJsonLd
}

export const get = async (type: string, node: any, config: IComponentConfig, opts: {
    url?: string
}) => {
    if (config.steps) {
        return handleJsonLdHowto(config)
    }
    const handler = registry[type]
    if (!handler) {
        return false
    }
    return await handler(node, config, opts)
}
