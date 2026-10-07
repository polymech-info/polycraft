import fs from 'fs/promises';
import path from 'path';
import { logger } from './index.js'
import { meta } from './url.js';

interface CacheEntry {
  isValid: boolean;
  timestamp: number;
  meta?: {
    title?: string;
    description?: string;
    image?: string;
    favicon?: string;
    siteName?: string;
  };
}

interface CacheData {
  [url: string]: CacheEntry;
}

const CACHE_FILE = path.join(process.cwd(), '.cache', 'url-cache.json');
const CACHE_EXPIRY = 7 * 10 * 24 * 60 * 60 * 1000; // 1 week in milliseconds

class UrlCache {
  private cache: CacheData = {};
  private initialized = false;

  private async loadCache(): Promise<void> {
    if (this.initialized) return;

    try {
      const data = await fs.readFile(CACHE_FILE, 'utf-8');
      this.cache = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty cache
      this.cache = {};
    }
    this.initialized = true;
  }

  private async saveCache(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(CACHE_FILE), { recursive: true });
      await fs.writeFile(CACHE_FILE, JSON.stringify(this.cache, null, 2));
    } catch (error) {
      console.error('Error saving cache:', error);
    }
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > CACHE_EXPIRY;
  }

  async get(url: string): Promise<CacheEntry | null> {
    await this.loadCache();
    const entry = this.cache[url];
    
    if (!entry) return null;
    if (this.isExpired(entry)) {
      delete this.cache[url];
      await this.saveCache();
      return null;
    }
    
    return entry;
  }

  async set(url: string, isValid: boolean, meta?: CacheEntry['meta']): Promise<void> {
    await this.loadCache();
    this.cache[url] = {
      isValid,
      timestamp: Date.now(),
      meta
    };
    await this.saveCache();
  }

  async clear(): Promise<void> {
    this.cache = {};
    this.initialized = false;
    try {
      await fs.unlink(CACHE_FILE);
    } catch (error) {
      // Ignore if file doesn't exist
    }
  }

  async expandUrls(): Promise<void> {
    await this.loadCache();    
    for (const [url, entry] of Object.entries(this.cache)) {
      if (entry.isValid && !entry.meta) {
        try {
          const metaInfo = await meta(url);
          entry.meta = metaInfo;
          entry.timestamp = Date.now(); // Reset expiry
        } catch (error) {
          console.error(`Error expanding meta for ${url}:`, error);
        }
      }
    }
    
    await this.saveCache();
  }
}

export const urlCache = new UrlCache(); 