import './__tests__/test-setup.js';
import { describe, it, expect } from 'vitest';
import {
  shortenUrl,
  renderLinks,
  filterBannedPhrases,
  replaceWords,
  applyFilters,
  default_filters_plain,
  default_filters_markdown,
  validateLinks
} from './filters.js';

import { item_path } from '../model/howto/howto.js';

describe('filters', () => {
  describe('item_path', () => {
    it('should generate correct path from item', () => {
      const item = { data: { slug: 'test-slug' } };
      expect(item_path(item)).toBe('/howto/test-slug');
    });
  });

  describe('shortenUrl', () => {
    it('should remove www. prefix and trailing slashes', () => {
      expect(shortenUrl('https://www.example.com/path/')).toBe('example.com/path');
    });

    it('should handle URLs without www. prefix', () => {
      expect(shortenUrl('https://example.com/path')).toBe('example.com/path');
    });

    it('should handle invalid URLs gracefully', () => {
      expect(shortenUrl('invalid-url')).toBe('invalid-url');
    });

    it('should handle URLs with query parameters', () => {
      expect(shortenUrl('https://example.com/path?param=value')).toBe('example.com/path?param=value');
    });
  });

  describe('renderLinks', () => {
    it('should render non-blacklisted links', () => {
      const input = 'Check out https://example.com';
      const expected = 'Check out <a class="text-orange-600 underline" href="https://example.com" target="_blank" rel="noopener noreferrer">example.com</a>';
      expect(renderLinks(input)).toBe(expected);
    });

    it('should replace blacklisted links with empty string', () => {
      const input = 'Check out https://preciousplastic.com';
      expect(renderLinks(input)).toBe('Check out ');
    });

    it('should handle multiple links in text', () => {
      const input = 'Check out https://example.com and https://preciousplastic.com';
      const result = renderLinks(input);
      expect(result).toContain('example.com');
      expect(result).toContain('and ');
    });
  });

  describe('filterBannedPhrases', () => {
    it('should replace banned words with [filtered]', () => {
      const input = 'The wizard used magic2';
      const expected = 'The [filtered] used [filtered]';
      expect(filterBannedPhrases(input)).toBe(expected);
    });

    it('should handle case-insensitive matching', () => {
      const input = 'The WIZARD used MAGIC2';
      const expected = 'The [filtered] used [filtered]';
      expect(filterBannedPhrases(input)).toBe(expected);
    });

    it('should not replace partial matches', () => {
      const input = 'The wizardry used magic2.0';
      const expected = 'The wizardry used [filtered].0';
      expect(filterBannedPhrases(input)).toBe(expected);
    });
  });

  describe('replaceWords', () => {
    it('should replace words according to wordReplaceMap', () => {
      const input = 'I need a Router for my Car';
      const expected = 'I need a CNC Router for my tufftuff';
      expect(replaceWords(input)).toBe(expected);
    });

    it('should handle multi-word replacements', () => {
      const input = 'I need a laptop stand';
      expect(replaceWords(input)).toBe('I need a laptoppie');
    });

    it('should handle case-insensitive matching', () => {
      const input = 'I need a ROUTER for my CAR';
      const expected = 'I need a CNC Router for my tufftuff';
      expect(replaceWords(input)).toBe(expected);
    });
  });

  describe('applyFilters', () => {
    it('should apply plain text filters in sequence', async () => {
      const input = 'Check out https://example.com with the wizard Router';
      const result = await applyFilters(input, default_filters_plain);
      expect(result).toContain('example.com');
      expect(result).toContain('[filtered]');
      expect(result).toContain('CNC Router');
    });

    it('should apply markdown filters in sequence', async () => {
      const input = 'Check out [example](https://example.com) with the wizard Router';
      const result = await applyFilters(input, default_filters_markdown);
      expect(result).toContain('example');
      expect(result).toContain('[filtered]');
      expect(result).toContain('CNC Router');
    });

    it('should handle empty input', async () => {
      expect(await applyFilters('')).toBe('');
    });

    it('should handle custom filter array', async () => {
      const customFilters = [filterBannedPhrases];
      const input = 'The wizard used magic2';
      const expected = 'The [filtered] used [filtered]';
      expect(await applyFilters(input, customFilters)).toBe(expected);
    });

    it('should handle markdown links with blacklisted URLs', async () => {
      const input = 'Check out [example](https://preciousplastic.com)';
      const result = await applyFilters(input, default_filters_markdown);
      expect(result).toBe('Check out example');
    });
  });

  describe('validateLinks', () => {
    it('should remove invalid links entirely', async () => {
      const input = 'Check out [example](https://invalid-url-that-does-not-exist.com)';
      const result = await validateLinks(input);
      expect(result).toBe('Check out example');
    });

    it('should preserve valid links', async () => {
      const input = 'Check out [example](https://example.com)';
      const result = await validateLinks(input);
      expect(result).toBe('Check out [example](https://example.com)');
    });

    it('should handle multiple links in text', async () => {
      const input = 'Check out [valid](https://example.com) and [invalid](https://invalid-url-that-does-not-exist.com)';
      const result = await validateLinks(input);
      expect(result).toBe('Check out [valid](https://example.com) and invalid');
    });

    it('should handle links with special characters', async () => {
      const input = '[special](https://example.com/path?param=value#fragment)';
      const result = await validateLinks(input);
      expect(result).toBe('[special](https://example.com/path?param=value#fragment)');
    });

    it('should handle links with special characters that are invalid', async () => {
      const input = '[special](https://invalid-url-that-does-not-exist.com/path?param=value#fragment)';
      const result = await validateLinks(input);
      expect(result).toBe('special');
    });
  });
}); 