import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { PuppeteerUrlChecker, FetchUrlChecker, checkUrl, UrlCheckResult, clean } from './url.js';
import { screenshot } from './url.js';
import * as fs from 'fs';
import * as path from 'path';

describe('URL Checker', () => {
  // Test URLs
  const validUrl = 'https://backend.orbit.dtu.dk/ws/portalfiles/portal/278424474/Bertelsen_et_al_2022.pdf';
  const validUrl_ = 'https://dl.asminternational.org/technical-books/edited-volume/157/Extrusion';
  const invalidUrl = 'https://example.com/404';
  const timeoutUrl = 'https://example.com/timeout';

  // Clean up after all tests
  afterAll(async () => {
    await clean();
  });

  describe('PuppeteerUrlChecker', () => {
    const checker = new PuppeteerUrlChecker();

    it('should validate a valid URL', async () => {
      const result = await checker.check('https://www.google.com');
      expect(result.valid).toBe(true);
    });

    it('should handle invalid URLs', async () => {
      const result = await checker.check('https://www.google.com/nonexistent-page-123456789');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('404');
    });

    it('should handle timeouts', async () => {
      const result = await checker.check('http://example.com:81', 1000); // Port 81 should timeout quickly
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Navigation timeout');
    });

    it('should handle network errors', async () => {
      const result = await checker.check('http://invalid.domain.thisisnotreal');
      expect(result.valid).toBe(false);
      expect(result.error).toBeTruthy();
    });
  });

  describe('FetchUrlChecker', () => {
    const checker = new FetchUrlChecker();
    let mockFetch: ReturnType<typeof vi.fn>;

    beforeEach(() => {
      mockFetch = vi.fn();
      global.fetch = mockFetch as unknown as typeof fetch;
    });

    afterAll(() => {
      // Restore the original fetch
      vi.restoreAllMocks();
    });

    it('should validate a valid URL', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK'
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);

      const result = await checker.check(validUrl);
      expect(result).toEqual({ valid: true });
    });

    it('should handle invalid URLs', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as unknown as Response;
      
      mockFetch.mockResolvedValue(mockResponse);

      const result = await checker.check(invalidUrl);
      expect(result).toEqual({
        valid: false,
        error: 'HTTP 404: Not Found'
      });
    });   

    it('should handle timeouts', async () => {
      mockFetch.mockRejectedValue(new Error('Timeout'));

      const result = await checker.check(timeoutUrl);
      expect(result).toEqual({
        valid: false,
        error: 'Timeout'
      });
    });
  });
});

describe('url screenshot', () => {
  const testUrl = 'https://www.youtube.com/watch?v=4LrrFz802To';
  const testOutputDir = path.join(__dirname, '../../test-output');
  const screenshotPath = path.join(testOutputDir, 'test-screenshot.png');
  const chromiumDir = path.join(process.cwd(), '.cache', 'chromium');

  // Create test output directory if it doesn't exist
  beforeAll(() => {
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  });

  // Clean up after all tests
  afterAll(async () => {
    await clean(); // Close browser
    if (fs.existsSync(screenshotPath)) {
      fs.unlinkSync(screenshotPath);
    }
    // Clean up default path if it exists
    const defaultPath = await screenshot(testUrl);
    if (fs.existsSync(defaultPath)) {
      fs.unlinkSync(defaultPath);
    }
  });

  it('should create and use chromium user data directory', async () => {
    await screenshot(testUrl);
    expect(fs.existsSync(chromiumDir)).toBe(true);
    // Check for typical Chrome profile directories
    expect(fs.existsSync(path.join(chromiumDir, 'Default'))).toBe(true);
  }, 60000);

  it('should take a screenshot with explicit path', async () => {
    const resultPath = await screenshot(testUrl, {
      dstPath: screenshotPath,
      timeout: 30000,
      width: 1400,
      height: 900
    });

    expect(resultPath).toBe(screenshotPath);
    expect(fs.existsSync(screenshotPath)).toBe(true);
    const stats = fs.statSync(screenshotPath);
    expect(stats.size).toBeGreaterThan(0);
  }, 60000);

  it('should take a screenshot with default path', async () => {
    const resultPath = await screenshot(testUrl);
    
    expect(resultPath).toContain(path.join('.cache', 'urls'));
    expect(resultPath).toMatch(/youtube-[a-f0-9]{8}\.png$/);
    expect(fs.existsSync(resultPath)).toBe(true);
    const stats = fs.statSync(resultPath);
    expect(stats.size).toBeGreaterThan(0);

    // Clean up
    fs.unlinkSync(resultPath);
  }, 60000);
}); 