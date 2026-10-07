import { LLMRegistry } from '@polymech/astro-base/registry';

export const GET = async () => {
    const registry = LLMRegistry.getAll();
    let content = "# Polymech Documentation Index\n\n";

    // Sort sections for deterministic output
    const sections = Array.from(registry.keys()).sort();

    for (const section of sections) {
        content += `## ${section}\n\n`;
        const items = registry.get(section) || [];
        // Sort items by title for deterministic output
        items.sort((a, b) => a.title.localeCompare(b.title));

        for (const item of items) {
            content += `- [${item.title}](${item.url}): ${item.description}\n`;
        }
        content += "\n";
    }

    return new Response(content.trim(), {
        headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
};
