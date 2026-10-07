import { specs, markdownTable, md2html } from './specs.js';
import { sync as exists } from '@polymech/fs/exists';
import { describe, it, expect } from 'vitest';

describe('specs', () => {
  describe('md2html', () => {
    it('should convert markdown to html', () => {
      const markdown = '# Hello\n\nThis is a test';
      const html = md2html(markdown);
      expect(html).toBe('<h1 id="hello">Hello</h1>\n<p>This is a test</p>');
    });

    it('should handle tables', () => {
      const markdown = '| Header 1 | Header 2 |\n|----------|----------|\n| Cell 1   | Cell 2   |';
      const html = md2html(markdown);
      expect(html).toContain('<table>');
      expect(html).toContain('<th>Header 1</th>');
      expect(html).toContain('<td>Cell 1</td>');
    });
  });

  describe('markdownTable', () => {
    it('should create a basic markdown table', () => {
      const table = [
        ['Header 1', 'Header 2'],
        ['Cell 1', 'Cell 2']
      ];
      const result = markdownTable(table);
      expect(result).toBe('| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   | Cell 2   |');
    });

    it('should handle empty cells', () => {
      const table = [
        ['Header 1', 'Header 2'],
        ['Cell 1', '']
      ];
      const result = markdownTable(table);
      expect(result).toBe('| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   |          |');
    });

    it('should handle null/undefined values', () => {
      const table = [
        ['Header 1', 'Header 2'],
        ['Cell 1', null],
        ['Cell 3', undefined]
      ];
      const result = markdownTable(table);
      expect(result).toBe('| Header 1 | Header 2 |\n| -------- | -------- |\n| Cell 1   |          |\n| Cell 3   |          |');
    });

    it('should handle custom alignment', () => {
      const table = [
        ['Header 1', 'Header 2'],
        ['Cell 1', 'Cell 2']
      ];
      const result = markdownTable(table, { align: ['l', 'r'] });
      expect(result).toBe('| Header 1 | Header 2 |\n| :------- | -------: |\n| Cell 1   |   Cell 2 |');
    });
  });

  describe('specs', () => {
    it('should return empty string for non-existent file', () => {
      const result = specs('non-existent-file.xlsx');
      expect(result).toBe('');
    });

    it('should process valid xlsx file', () => {
      // Note: This test requires a valid xlsx file in the test directory
      // You might want to create a test fixture file
      const testFile = 'test/fixtures/test.xlsx';
      if (exists(testFile)) {
        const result = specs(testFile);
        expect(result).toBeTruthy();
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      }
    });
  });
}); 