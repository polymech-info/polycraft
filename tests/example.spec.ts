import { test, expect } from '@playwright/test'
import normalizeUrl from 'normalize-url'

const prod = false
const LANG = 'en'
const STORE = `/${LANG}/store/`

const TEST_URL = prod ? 'https://polymech.io/' : 'https://polymech.io/'

const ITEM_URL = (item) => `${TEST_URL}/${item}`

const EXTRUDER = (extruder: string = '/products/extrusion/lydia-v4.5') => ITEM_URL(`${STORE}/${extruder}`)

test('Take a full-page screenshot', async ({ page }) => {
  await page.goto('https://polymech.io/en', { waitUntil: 'domcontentloaded' });
  await new Promise((resolve) => setTimeout(resolve, 2250));
  // Scroll to the bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Wait a bit to ensure content is loaded
  await page.waitForTimeout(2000);

  // Take a full-page screenshot
  await page.screenshot({ path: './tests/screenshot-latest.jpg', fullPage: true, quality: 100 });
});

test('Take a full-page screenshot product ', async ({ page }) => {
  await page.goto('https://polymech.io/en/store/products/sheetpress/cassandra-edczmax-rc2/', { waitUntil: 'domcontentloaded' });
  await new Promise((resolve) => setTimeout(resolve, 2250));
  // Scroll to the bottom
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

  // Wait a bit to ensure content is loaded
  await page.waitForTimeout(2000);

  // Take a full-page screenshot
  await page.screenshot({ path: './tests/screenshot-product.jpg', fullPage: true, quality: 100 });
});

test('Take screenshot area ', async ({ page }) => {
  await page.goto('http://localhost:4321/en/store/products/injection/elena-zmax-rc1#specs-tab-button-tab', { waitUntil: 'domcontentloaded' });
  await new Promise((resolve) => setTimeout(resolve, 2250))
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(2000)  
  const element = await page.locator('#tabs-view').first()
  await element.screenshot({ path: './tests/screenshot-area.jpg', quality: 100 })
});