process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

import { urlCache } from './url-cache.js';
import { filterMarkdownLinks } from "../base/markdown.js";
import { meta } from '../base/url.js';

export interface FilterFunction { (text: string): string | Promise<string> }

import filterConfig from "config/filters.json" assert { type: "json" };

export const BLACKLIST = filterConfig.BLACKLIST;
export const URL_BLACKLIST = filterConfig.URL_BLACKLIST;
export const WORD_BLACKLIST = filterConfig.WORD_BLACKLIST;
export const FILTER_MAP: Record<string, string> = filterConfig.FILTER_MAP;

/**
 * Shortens a URL by removing 'www.' prefix and trailing slashes
 * @param url - The URL to shorten
 * @returns The shortened URL or the original URL if invalid
 */
export const shortenUrl = (url: string): string => {
  try {
    const { hostname, pathname, search } = new URL(url);
    const cleanHost = hostname.replace(/^www\./, '');
    const cleanPath = pathname.replace(/\/$/, '');
    return `${cleanHost}${decodeURIComponent(cleanPath)}${search}`;
  } catch (error) {
    console.warn(`Invalid URL provided to shortenUrl: ${url}`);
    return url;
  }
};

/**
 * Gets the domain name from a URL
 * @param url - The URL to extract domain from
 * @returns The domain name or empty string if invalid
 */
export const getDomain = (url: string): string => {
  try {
    const { hostname,  } = new URL(url);
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
};

export async function validateUrl(
  url: string,
  timeout: number = 22500
): Promise<boolean> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) '
          + 'AppleWebKit/537.36 (KHTML, like Gecko) '
          + 'Chrome/111.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-User': '?1',
        'Sec-Fetch-Dest': 'document'
      }
    });

    if (!response.ok || response.status === 404) {
      console.log(`URL ${url} is 404`, response);
      await urlCache.set(url, false);
      return false;
    }

    // Get meta information for valid URLs
    const metaInfo = await meta(url);
    await urlCache.set(url, true, metaInfo);
    return true;
  } catch (error) {
    console.log(`Error validateUrl ${url}`, error);
    await urlCache.set(url, false);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
/**
 * Validates if a URL is accessible with a timeout
 * @param url - The URL to validate
 * @param timeoutMs - Timeout in milliseconds (default: 3500)
 * @returns Promise resolving to true if link is valid, false otherwise
 */
async function validateUrl_0(url: string, timeoutMs: number = 10500): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      method: 'HEAD',
      signal: controller.signal,
      mode: 'no-cors' // This allows checking cross-origin links
    });

    clearTimeout(timeoutId);

    // For no-cors mode, we can't check the status, so we assume success if we get a response
    if (response.type === 'opaque') {
      return true;
    }

    // Check if status is in 2xx range
    return response.ok;
  } catch (error) {
    // Handle various error cases
    if (error instanceof Error) {
      // AbortError means timeout
      if (error.name === 'AbortError') {
        console.warn(`Timeout checking URL: ${url}`);
        return false;
      }
      // Network errors or other fetch errors
      console.warn(`Error checking URL ${url}: ${error.message}`);
    }
    return false;
  }
}

/**
 * Validates links in text and removes invalid ones
 * @param text - The text containing links to validate
 * @returns Promise resolving to text with invalid links removed
 */
export const validateLinks = async (text: string): Promise<string> => {
  const urlRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  const matches = text.matchAll(urlRegex);
  let processedText = text;

  for (const match of matches) {
    const [fullMatch, linkText, url] = match;
    try {
      // Check cache first
      const cachedResult = await urlCache.get(url);
      if (cachedResult !== null) {
        if (!cachedResult.isValid) {
          processedText = processedText.replace(fullMatch, `~~[${linkText}](${url})~~`);
        }
        continue;
      }

      // Encode the URL to handle special characters
      const encodedUrl = encodeURI(url);
      const isValid = await validateUrl(encodedUrl);

      // Add strikethrough for invalid links while preserving the link
      if (!isValid) {
        processedText = processedText.replace(fullMatch, `~~[${linkText}](${url})~~`);
      }
    } catch (error) {
      // If there's an error checking the link, assume it's invalid
      await urlCache.set(url, false);
      processedText = processedText.replace(fullMatch, `~~[${linkText}](${url})~~`);
    }
  }

  return processedText;
};

/**
 * Renders links in text, replacing blacklisted URLs with "[Link Removed]"
 * @param text - The text containing URLs to process
 * @returns Processed text with rendered links
 */
export const renderLinks = (text: string): string =>
  text.replace(/https?:\/\/[^\s<"]+/gi, (url) => {
    const isBlacklisted = URL_BLACKLIST.some((domain) =>
      url.toLowerCase().includes(domain.toLowerCase())
    );
    if (isBlacklisted) return "";

    const domain = getDomain(url);
    const displayText = `${domain}: ${shortenUrl(url)}`;
    return `<a class="text-orange-600 underline" href="${url}" target="_blank" rel="noopener noreferrer">${displayText}</a>`;
  });

/**
 * Filters out banned phrases from text
 * @param text - The text to filter
 * @returns Text with banned phrases replaced
 */
export const filterBannedPhrases = (text: string): string =>
  WORD_BLACKLIST.reduce(
    (acc, word) => acc.replace(new RegExp(`\\b${word}\\b`, "gi"), "[filtered]"),
    text
  );

/**
 * Replaces specific words in text according to the wordReplaceMap
 * @param text - The text to process
 * @returns Text with words replaced according to the mapping
 */
export const replaceWords = (text: string): string =>
  Object.entries(FILTER_MAP).reduce(
    (acc, [word, replacement]) =>
      acc.replace(new RegExp(`\\b${word}\\b`, "gi"), replacement),
    text
  );

export const default_filters_plain: FilterFunction[] = [
  renderLinks,
  filterBannedPhrases,
  replaceWords  
] as const;

export const default_filters_markdown: FilterFunction[] = [
  (text: string) => filterMarkdownLinks(text, URL_BLACKLIST.map(url => ({ pattern: url, replacement: "" }))),
  filterBannedPhrases,
  replaceWords,
  validateLinks
] as const;

/**
 * Applies all filters to the input text in sequence
 * @param text - The text to filter
 * @param filters - Array of filter functions to apply
 * @returns Promise resolving to the filtered text
 */
export async function applyFilters(text: string = '', filters: FilterFunction[] = default_filters_plain): Promise<string> {
  return filters.reduce(
    async (promise, filterFn) => {
      const currentText = await promise;
      return filterFn(currentText);
    },
    Promise.resolve(text)
  )
}

