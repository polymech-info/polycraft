import puppeteer from 'puppeteer';
import { getLinkPreview } from 'link-preview-js';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

/** TODOS
*/

interface LinkPreviewResult {
  url: string;
  title: string;
  siteName?: string;
  description?: string;
  mediaType: string;
  contentType?: string;
  images: string[];
  videos: Array<{
    url?: string;
    secureUrl?: string;
    type?: string;
    width?: string;
    height?: string;
  }>;
  favicons: string[];
}

// Global browser instance cache
let globalBrowser: puppeteer.Browser | null = null;
let browserInitPromise: Promise<puppeteer.Browser> | null = null;

// Cache for meta data
const metaCache = new Map<string, {
  data: any;
  timestamp: number;
}>();

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

async function getGlobalBrowser(): Promise<puppeteer.Browser> {
  if (globalBrowser) {
    return globalBrowser;
  }

  if (browserInitPromise) {
    return browserInitPromise;
  }

  // Create chromium user data directory if it doesn't exist
  const userDataDir = path.join(process.cwd(), '.cache', 'chromium');
  if (!fs.existsSync(userDataDir)) {
    fs.mkdirSync(userDataDir, { recursive: true });
  }

  browserInitPromise = puppeteer.launch({
    headless: 'new' as any,
    args: ['--ignore-certificate-errors', '--no-sandbox', '--disable-setuid-sandbox'],
    userDataDir
  });

  try {
    globalBrowser = await browserInitPromise;
    browserInitPromise = null;
    return globalBrowser;
  } catch (error) {
    browserInitPromise = null;
    throw error;
  }
}

/**
 * Closes the global browser instance and cleans up resources.
 * This should be called when shutting down the application or when
 * you need to explicitly release browser resources.
 */
export async function clean(): Promise<void> {
  if (globalBrowser) {
    await globalBrowser.close();
    globalBrowser = null;
  }
  browserInitPromise = null;
}

export interface UrlCheckResult {
  valid: boolean;
  error?: string;
}

export interface UrlChecker {
  check(url: string, timeout?: number): Promise<UrlCheckResult>;
}

export class PuppeteerUrlChecker implements UrlChecker {
  private readonly defaultTimeout: number = 10000;
  private readonly userAgent: string = 'Mozilla/5.0 (compatible; PolymechBot/1.0; +http://polymech.org)';

  async check(url: string, timeout: number = this.defaultTimeout): Promise<UrlCheckResult> {
    try {
      const browser = await getGlobalBrowser();
      const page = await browser.newPage();
      await page.setUserAgent(this.userAgent);
      await page.setDefaultNavigationTimeout(timeout);

      const response = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: timeout
      });

      await page.close();

      if (!response) {
        return { valid: false, error: 'No response received' };
      }

      const status = response.status();
      if (status >= 200 && status < 400) {
        return { valid: true };
      }

      return {
        valid: false,
        error: `HTTP ${status}: ${response.statusText()}`
      };

    } catch (error) {
      if (error instanceof Error) {
        return {
          valid: false,
          error: error.message
        };
      }
      return {
        valid: false,
        error: 'Unknown error occurred'
      };
    }
  }

  async close(): Promise<void> {
    await clean();
  }
}

export class FetchUrlChecker implements UrlChecker {
  private readonly defaultTimeout: number = 10000;
  private readonly userAgent: string = 'Mozilla/5.0 (compatible; PolymechBot/1.0; +http://polymech.org)';

  async check(url: string, timeout: number = this.defaultTimeout): Promise<UrlCheckResult> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        signal: controller.signal,
        redirect: 'follow',
        headers: {
          'User-Agent': this.userAgent
        }
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          valid: false,
          error: `HTTP ${response.status}: ${response.statusText}`
        };
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof Error) {
        return {
          valid: false,
          error: error.message
        };
      }
      return {
        valid: false,
        error: 'Unknown error occurred'
      };
    }
  }
}

// Default checker instance
export const defaultChecker: UrlChecker = new FetchUrlChecker();

// Export a convenience function
export async function checkUrl(url: string, timeout?: number): Promise<UrlCheckResult> {
  return defaultChecker.check(url, timeout);
}

export interface MetaResult {
  title?: string;
  description?: string;
  image?: string;
  favicon?: string;
  siteName?: string;
  error?: string;
}

export async function meta(url: string): Promise<MetaResult> {
  try {
    const cached = metaCache.get(url);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }
    const urlCheck = await checkUrl(url);
    if (!urlCheck.valid) {
      return { error: urlCheck.error };
    }
    const preview = await getLinkPreview(url, {
      followRedirects: 'follow',
      timeout: 20000
    }) as LinkPreviewResult;
    const result: MetaResult = {
      title: preview.title || undefined,
      description: preview.description || undefined,
      image: preview.images?.[0] || undefined,
      favicon: preview.favicons?.[0] || undefined,
      siteName: preview.siteName || undefined
    };

    metaCache.set(url, {
      data: result,
      timestamp: Date.now()
    });
    return result;
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: 'Unknown error occurred while fetching meta data' };
  }
}

function getDefaultScreenshotPath(url: string): string {
  try {
    const urlObj = new URL(url);
    // Get domain without TLD
    const domain = urlObj.hostname.split('.').slice(0, -1).join('-');
    // Hash the path and query
    const pathHash = crypto
      .createHash('md5')
      .update(urlObj.pathname + urlObj.search)
      .digest('hex')
      .slice(0, 8);
    
    // Create cache directory if it doesn't exist
    const cacheDir = path.join(process.cwd(), '.cache', 'urls');
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    return path.join(cacheDir, `${domain}-${pathHash}.png`);
  } catch (error) {
    // If URL parsing fails, use a fallback name with timestamp
    const timestamp = Date.now();
    return path.join(process.cwd(), '.cache', 'urls', `screenshot-${timestamp}.png`);
  }
}

export interface ScreenshotOptions {
  dstPath?: string;
  timeout?: number;
  width?: number;
  height?: number;
  puppeteerOptions?: puppeteer.ScreenshotOptions;
}

export async function screenshot(url: string, options: ScreenshotOptions = {}): Promise<string> {
  const {
    timeout = 30000,
    width = 1400,
    height = 900,
    puppeteerOptions = {}
  } = options;

  // Generate default path if not provided
  const dstPath = options.dstPath || getDefaultScreenshotPath(url);

  try {
    const browser = await getGlobalBrowser();
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewport({ width, height });
    
    // Set default navigation timeout
    await page.setDefaultNavigationTimeout(timeout);

    // Navigate to URL and wait for network to be idle
    await page.goto(url, {
      waitUntil: 'networkidle0',
      timeout
    });

    // Take screenshot with merged options
    await page.screenshot({
      path: dstPath,
      fullPage: false,
      ...puppeteerOptions
    });

    await page.close();
    return dstPath;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Screenshot failed: ${error.message}`);
    }
    throw new Error('Unknown error occurred while taking screenshot');
  }
} 