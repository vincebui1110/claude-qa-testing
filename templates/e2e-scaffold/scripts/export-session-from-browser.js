#!/usr/bin/env node
/**
 * Export Session from Browser — Interactive session capture
 *
 * Method 1 (default): Launch Chrome, login manually, press Enter to save
 * Method 2 (--cdp): Connect to existing Chrome debug port 9222
 *
 * Usage:
 *   node scripts/export-session-from-browser.js
 *   node scripts/export-session-from-browser.js --cdp
 */
import {chromium} from '@playwright/test';
import fs from 'fs';
import path from 'path';
import readline from 'readline';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.resolve(__dirname, '..', '.auth');
const AUTH_FILE = path.join(AUTH_DIR, 'admin.json');
const useCDP = process.argv.includes('--cdp');

async function prompt(question) {
  const rl = readline.createInterface({input: process.stdin, output: process.stdout});
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

async function main() {
  if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, {recursive: true});

  let browser, context, page;

  if (useCDP) {
    // Connect to existing Chrome debug session
    console.log('Connecting to Chrome debug port 9222...');
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    context = browser.contexts()[0];
    page = context.pages()[0] || await context.newPage();
  } else {
    // Launch new Chrome (headed)
    console.log('Launching Chrome (headed mode)...');
    browser = await chromium.launch({headless: false, channel: 'chrome'});
    context = await browser.newContext();
    page = await context.newPage();
  }

  // Navigate to Shopify Admin
  const shopSlug = process.env.SHOP_DOMAIN?.replace('.myshopify.com', '') || 'claude-9967';
  const adminUrl = `https://admin.shopify.com/store/${shopSlug}`;
  console.log(`Navigating to ${adminUrl}...`);
  await page.goto(adminUrl, {timeout: 60_000}).catch(() => {});

  // Wait for user to login
  console.log('\n=== Login to Shopify Admin in the browser window ===');
  console.log('When you see the admin dashboard, come back here and press Enter.\n');
  await prompt('Press Enter after logging in... ');

  // Verify we're on admin
  const currentUrl = page.url();
  if (!currentUrl.includes('admin.shopify.com')) {
    console.log('⚠️  Warning: Not on admin.shopify.com, but saving session anyway.');
  }

  // Save session
  await context.storageState({path: AUTH_FILE});
  const content = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  console.log(`\n✅ Session saved to ${AUTH_FILE}`);
  console.log(`   ${content.cookies?.length || 0} cookies, ${content.origins?.length || 0} origins`);

  if (!useCDP) await browser.close();
}

main().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
