export const enum TemplateContext {
    COMMON = 'common',
    HOWTO = 'howto',
    DIRECTORY = 'directory',
    MARKETPLACE = 'marketplace'
}

export interface TemplateContextConfig {
    path: string;
    description: string;
}

export const TEMPLATE_CONTEXTS: Record<TemplateContext, TemplateContextConfig> = {
    [TemplateContext.COMMON]: {
        path: './src/config/templates/common.json',
        description: 'Common language and utility templates'
    },
    [TemplateContext.HOWTO]: {
        path: './src/config/templates/howto.json',
        description: 'Tutorial and guide related templates'
    },
    [TemplateContext.DIRECTORY]: {
        path: './src/config/templates/directory.json',
        description: 'Directory and listing related templates'
    },
    [TemplateContext.MARKETPLACE]: {
        path: './src/config/templates/marketplace.json',
        description: 'Marketplace and commerce related templates'
    }
}; 