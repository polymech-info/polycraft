import { fromMarkdown } from 'mdast-util-from-markdown';
import { toMarkdown } from 'mdast-util-to-markdown';
import { Root } from 'mdast';

type LinkFilter = {
    pattern: string | RegExp;
    replacement?: string;
};

/**
 * Filters out or replaces specified links from markdown content
 * @param markdown - The markdown string to filter
 * @param filters - Array of link filters with optional replacement text
 * @returns Filtered markdown string
 */
export function filterMarkdownLinks(markdown: string, filters: LinkFilter[]): string {
    // Parse markdown to AST
    const tree = fromMarkdown(markdown) as Root;

    // Function to check if a URL should be filtered and get replacement text
    const shouldFilter = (url: string): string | null => {
        for (const filter of filters) {
            if (filter.pattern instanceof RegExp) {
                if (filter.pattern.test(url)) {
                    return filter.replacement || '';
                }
            } else if (url.includes(filter.pattern)) {
                return filter.replacement || '';
            }
        }
        return null;
    };

    // Visit all nodes and remove filtered links
    const visit = (node: any) => {
        if (node.type === 'link' && node.url) {
            const replacement = shouldFilter(node.url);
            if (replacement !== null) {
                // Replace link with replacement text or its text content
                node.type = 'text';
                node.value = replacement || node.children?.[0]?.value || '';
                delete node.url;
                delete node.children;
            }
        }

        if (node.children) {
            node.children = node.children.map((child: any) => visit(child));
        }

        return node;
    };

    // Process the tree
    const filteredTree = visit(tree);

    // Convert back to markdown with options to minimize extra newlines
    return toMarkdown(filteredTree, {
        bullet: '-',
        listItemIndent: 'one',
        tightDefinitions: true,
        handlers: {
            text: (node, _, context) => {
                const value = node.value.replace(/\n+$/, '');
                return value;
            }
        }
    }).trim();
}

/**
 * Example usage:
 * const filtered = filterMarkdownLinks(markdown, [
 *   { pattern: 'https://example.com', replacement: 'REPLACED' },
 *   { pattern: /spam\.com/, replacement: 'SPAM' },
 *   { pattern: /advertisement/ }
 * ]);
 */ 