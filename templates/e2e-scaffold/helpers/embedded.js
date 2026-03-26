/**
 * Embedded App Helper — Shared across all Shopify apps
 * Reads all config from environment variables (.env.test)
 */
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});

const SHOP_DOMAIN = process.env.SHOP_DOMAIN;
const APP_HANDLE = process.env.SHOPIFY_APP_HANDLE;
const APP_DOMAIN = process.env.APP_DOMAIN;

if (!SHOP_DOMAIN || !APP_HANDLE || !APP_DOMAIN) {
  throw new Error(
    'Missing required env vars: SHOP_DOMAIN, SHOPIFY_APP_HANDLE, APP_DOMAIN.\n' +
    'Copy .env.example to .env.test and fill in values.'
  );
}

function getShopSlug() {
  return SHOP_DOMAIN.replace('.myshopify.com', '');
}

export function getEmbeddedUrl(path = '') {
  return `https://admin.shopify.com/store/${getShopSlug()}/apps/${APP_HANDLE}/embed${path}`;
}

export async function navigateToApp(page, path = '') {
  await page.goto(getEmbeddedUrl(path), {waitUntil: 'commit', timeout: 30_000}).catch(() => {});
  await page.waitForLoadState('load', {timeout: 30_000}).catch(() => {});
  await page.waitForTimeout(5000);

  return page.frameLocator(`iframe[src*="${APP_DOMAIN}"]`).first();
}

export async function waitForAppLoad(app) {
  await app.locator('.Polaris-Page, .Polaris-Card, .Polaris-LegacyCard, .Polaris-Box').first()
    .waitFor({state: 'visible', timeout: 15_000}).catch(() => {});
}

export async function getShopDataFromFrame(page) {
  const appFrame = page.frames().find(f => f.url().includes(APP_DOMAIN));
  if (!appFrame) return null;
  return appFrame.evaluate(() => window.activeShop);
}
