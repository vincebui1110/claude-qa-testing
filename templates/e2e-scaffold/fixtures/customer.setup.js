/**
 * Customer Auth Setup — For storefront tests requiring logged-in customer
 * Optional: only needed if storefront tests require customer session
 */
import {test as setup} from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_FILE = path.resolve('.auth/customer.json');
const STOREFRONT_URL = process.env.STOREFRONT_URL;
const STORE_PASSWORD = process.env.STORE_PASSWORD || '1';

setup('setup customer session', async ({page}) => {
  if (fs.existsSync(AUTH_FILE)) {
    const stat = fs.statSync(AUTH_FILE);
    const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);
    if (ageHours < 24) {
      console.log(`Customer session valid (${Math.round(ageHours)}h old)`);
      return;
    }
  }

  if (!STOREFRONT_URL) {
    console.log('STOREFRONT_URL not set — skipping customer auth setup');
    return;
  }

  // Navigate to storefront
  await page.goto(STOREFRONT_URL, {timeout: 30_000});

  // Handle store password
  const passwordInput = page.locator('input[type="password"]');
  if (await passwordInput.isVisible({timeout: 5_000}).catch(() => false)) {
    await passwordInput.fill(STORE_PASSWORD);
    await page.getByRole('button', {name: /enter|submit/i}).click();
    await page.waitForLoadState('load');
  }

  // Save customer session
  const dir = path.dirname(AUTH_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, {recursive: true});
  await page.context().storageState({path: AUTH_FILE});
  console.log('Customer session saved');
});
