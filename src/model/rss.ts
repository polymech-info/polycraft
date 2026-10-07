import { RSSFeed } from '@astrojs/rss'
import rss from '@astrojs/rss';

import type { IComponentNode, IComponentConfig } from '@polymech/commons'

export const get = async (node: IComponentNode, config: IComponentConfig): Promise<RSSFeed> => {
    return {
        title: config.name,
        description: config.keywords || '',
        items: [{
            title: config.name,
            description: config.keywords || '',
            link: node.path
        }]
    }
}
