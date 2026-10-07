import { describe, it, expect } from 'vitest';
import { filterMarkdownLinks } from './markdown.js';

describe('filterMarkdownLinks', () => {
    it('should filter out exact URLs', () => {
        const markdown = 'Check out [link1](https://example.com) and [link2](https://other.com)';
        const filters = [{ pattern: 'https://example.com' }];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('Check out link1 and [link2](https://other.com)');
    });

    it('should replace URLs with custom text', () => {
        const markdown = 'Check out [link1](https://example.com) and [link2](https://other.com)';
        const filters = [{ pattern: 'https://example.com', replacement: 'REPLACED' }];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('Check out REPLACED and [link2](https://other.com)');
    });

    it('should filter out URLs matching regex patterns', () => {
        const markdown = 'Visit [spam](https://spam.com) and [ads](https://advertisement.com)';
        const filters = [
            { pattern: /spam\.com/ },
            { pattern: /advertisement/ }
        ];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('Visit spam and ads');
    });

    it('should replace URLs matching regex patterns with custom text', () => {
        const markdown = 'Visit [spam](https://spam.com) and [ads](https://advertisement.com)';
        const filters = [
            { pattern: /spam\.com/, replacement: 'SPAM' },
            { pattern: /advertisement/, replacement: 'ADS' }
        ];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('Visit SPAM and ADS');
    });

    it('should handle nested markdown elements', () => {
        const markdown = '**Bold text with [link](https://example.com) inside**';
        const filters = [{ pattern: 'https://example.com' }];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('**Bold text with link inside**');
    });

    it('should handle nested markdown elements with replacement', () => {
        const markdown = '**Bold text with [link](https://example.com) inside**';
        const filters = [{ pattern: 'https://example.com', replacement: 'REPLACED' }];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('**Bold text with REPLACED inside**');
    });

    it('should preserve non-matching links', () => {
        const markdown = '[keep](https://keep.com) and [remove](https://remove.com)';
        const filters = [{ pattern: 'https://remove.com' }];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('[keep](https://keep.com) and remove');
    });

    it('should handle empty filters array', () => {
        const markdown = '[link](https://example.com)';
        const filters: { pattern: string | RegExp; replacement?: string }[] = [];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('[link](https://example.com)');
    });

    it('should handle complex markdown with multiple links', () => {
        const markdown = '# Title\n\nSome text with [link1](https://example.com) and [link2](https://spam.com).\n\n## Subtitle\n\nMore text with [link3](https://advertisement.com) and [link4](https://good.com)';
        const filters = [
            { pattern: 'https://example.com' },
            { pattern: /spam\.com/ },
            { pattern: /advertisement/ }
        ];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('# Title\n\nSome text with link1 and link2.\n\n## Subtitle\n\nMore text with link3 and [link4](https://good.com)');
    });

    it('should handle complex markdown with multiple replacements', () => {
        const markdown = '# Title\n\nSome text with [link1](https://example.com) and [link2](https://spam.com).\n\n## Subtitle\n\nMore text with [link3](https://advertisement.com) and [link4](https://good.com)';
        const filters = [
            { pattern: 'https://example.com', replacement: 'REPLACED1' },
            { pattern: /spam\.com/, replacement: 'REPLACED2' },
            { pattern: /advertisement/, replacement: 'REPLACED3' }
        ];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('# Title\n\nSome text with REPLACED1 and REPLACED2.\n\n## Subtitle\n\nMore text with REPLACED3 and [link4](https://good.com)');
    });

    it('should handle links with special characters', () => {
        const markdown = '[special](https://example.com/path?param=value#fragment)';
        const filters = [{ pattern: 'https://example.com' }];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('special');
    });

    it('should handle links with special characters and replacement', () => {
        const markdown = '[special](https://example.com/path?param=value#fragment)';
        const filters = [{ pattern: 'https://example.com', replacement: 'REPLACED' }];
        
        const result = filterMarkdownLinks(markdown, filters);
        expect(result).toBe('REPLACED');
    });
}); 