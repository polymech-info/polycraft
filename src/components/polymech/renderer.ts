import { unified } from "unified"
import remarkParse from "remark-parse"
import remarkGfm from "remark-gfm"
import remarkRehype from "remark-rehype"
import rehypeRaw from "rehype-raw"
import emoji from "remark-emoji"
import rehypeStringify from "rehype-stringify"
import { createComponent } from "astro/runtime/server/astro-component.js"
import { renderTemplate, unescapeHTML } from "astro/runtime/server/index.js"

// Define the type for the component map
type ComponentMap = Record<string, (props: Record<string, string>) => unknown>;

// Function to convert Markdown to HTML and replace elements with Astro components
export async function markdown(input: string, componentsMap: ComponentMap = {}): Promise<unknown> {
    const slots: unknown[] = [];
    let slotIndex = 0;

    // Ensure input is treated as UTF-8
    const markdownText = new TextDecoder("utf-8").decode(new TextEncoder().encode(input));

    const processedHtml = await unified()
        .use(remarkParse) // Parse Markdown to AST
        .use(emoji, {
            accessible: true, // Defaults to false
            emoticon: true, // Defaults to false
        })
        .use(remarkGfm) // Enable tables, strikethrough, autolinks, etc.
        .use(remarkRehype, { allowDangerousHtml: true }) // Convert Markdown to HTML AST
        .use(rehypeRaw) // Process raw HTML inside Markdown
        .use(() => (tree) => {
            function transformNode(node: { type: string; tagName?: string; properties?: Record<string, string>; value?: string; children?: any[] }) {
                if (node.type === "element" && node.tagName && componentsMap[node.tagName]) {
                    const props = node.properties || {};

                    // Register the component as a slot instead of calling it directly
                    const slotName = `COMPONENT_SLOT_${slotIndex++}`;
                    slots[slotName] = { component: componentsMap[node.tagName], props };
                    node.type = "text";
                    node.value = `<!--${slotName}-->`; // Slot placeholder
                }

                if (node.children) {
                    node.children.forEach(transformNode);
                }
            }
            transformNode(tree);
        })
        .use(rehypeStringify) // Convert AST back to HTML
        .process(markdownText);

    return createComponent(() => renderTemplate(unescapeHTML(processedHtml.toString()), slots));
}
