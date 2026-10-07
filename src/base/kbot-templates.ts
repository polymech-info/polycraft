import { IKBotTask } from "@polymech/kbot-d";
import { sync as read } from "@polymech/fs/read";
import { sync as exists } from "@polymech/fs/exists";
import { z } from "zod";
import { logger } from "./index.js";
import { OptionsSchema } from "@polymech/kbot-d"

const InstructionSchema = z.object({
    flag: z.string(),
    text: z.string()
});

const InstructionSetSchema = z.record(z.array(InstructionSchema));

export interface TemplateProps extends IKBotTask {
    language?: string;
    clazz?: string;
    cache?: boolean;
    disabled?: boolean;
    template?: string;
    renderer?: string;

}
const TemplateConfigSchema = z.object({
    router: z.string().optional(),
    _router: z.string().optional(),
    model: z.string(),
    preferences: z.string(),
    mode: z.string(),
    filters: z.string().optional(),
    variables: z.record(z.string()).optional()
});

type TemplateConfig = z.infer<typeof TemplateConfigSchema>;
const LLMConfigSchema = z.object({
    options: z.record(OptionsSchema()),
    instructions: InstructionSetSchema.optional(),
    defaults: z.record(z.array(z.string())).optional()
});
type LLMConfig = z.infer<typeof LLMConfigSchema>;

export const enum TemplateContext {
    COMMONS = 'commons',
    HOWTO = 'howto',
    MARKETPLACE = 'marketplace',
    DIRECTORY = 'directory'
}
// Default configuration
export const DEFAULT_CONFIG: LLMConfig = {
    options: {},
    instructions: {},
    defaults: {}
};

const getConfigPath = (context: TemplateContext): string => {
    return `./src/config/templates/${context}.json`;
};

export const load = (context: TemplateContext = TemplateContext.COMMONS): LLMConfig => {
    const configPath = getConfigPath(context);
    if (exists(configPath)) {
        try {
            const content = read(configPath, 'json') || {};
            return LLMConfigSchema.parse(content)
        } catch (error) {
            logger.error(`Error loading ${context} config:`, error);
        }
    } else {
        logger.error(`Config file ${configPath} not found`);
    }
    return DEFAULT_CONFIG;
};

export const buildPrompt = (
    instructions: z.infer<typeof InstructionSetSchema>,
    defaults: Record<string, string[]>
): string => {
    
    const getInstructions = (category: string, flags: string[]) => {
        const set = instructions[category] || [];
        return set.filter(x => flags.includes(x.flag)).map(x => x.text);
    };
    const merged = Object.keys(instructions).reduce((acc, category) => ({
        ...acc,
        [category]: defaults[category] ?? []
    }), {} as Record<string, string[]>);

    return Object.entries(merged)
        .flatMap(([category, flags]) => getInstructions(category, flags))
        .join("\n");
};
const PromptSchema = z.object({
    template: z.string(),
    variables: z.record(z.string()).optional(),
    format: z.enum(['text', 'json', 'markdown', 'schema']).default('text')
});
type Prompt = z.infer<typeof PromptSchema>;
const PromptRegistrySchema = z.record(PromptSchema);
type PromptRegistry = z.infer<typeof PromptRegistrySchema>;

const createTemplate = (config: LLMConfig, name: string, defaults: Partial<TemplateConfig>) => {
    return (opts: Partial<TemplateConfig> = {}) => {
        const template = config.options[name] || defaults;
        const prompt = buildPrompt(
            config.instructions || {},
            config.defaults || {}
        );
        const merged = {
            ...template,
            ...opts,
            prompt: template.prompt || prompt
        };
        return merged
    }
};

export const createTemplates = (context: TemplateContext = TemplateContext.COMMONS) => {
    const config = load(context);
    return Object.keys(config.options).reduce((acc, name) => ({
        ...acc,
        [name]: createTemplate(config, name, {})
    }), {});
};
export type { TemplateConfig, LLMConfig, Prompt, PromptRegistry }

export {
    InstructionSchema,
    InstructionSetSchema,
    TemplateConfigSchema,
    LLMConfigSchema,
    PromptSchema,
    PromptRegistrySchema
}; 