#!/usr/bin/env node
/**
 * Convert Cookies — Chrome extension JSON → Playwright storage state
 *
 * Usage:
 *   1. Install EditThisCookie or Cookie-Editor extension
 *   2. Login to Shopify Admin
 *   3. Export cookies as JSON
 *   4. Run: node scripts/convert-cookies.js cookies.json
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = path.resolve(__dirname, '..', '.auth');
const AUTH_FILE = path.join(AUTH_DIR, 'admin.json');

const inputFile = process.argv[2];
if (!inputFile) {
  console.error('Usage: node scripts/convert-cookies.js <cookies.json>');
  process.exit(1);
}

if (!fs.existsSync(inputFile)) {
  console.error(`File not found: ${inputFile}`);
  process.exit(1);
}

const raw = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
const cookies = (Array.isArray(raw) ? raw : raw.cookies || [])
  .filter(c => {
    const domain = c.domain || '';
    return domain.includes('shopify.com') || domain.includes('myshopify.com');
  })
  .map(c => ({
    name: c.name,
    value: c.value,
    domain: c.domain?.startsWith('.') ? c.domain : `.${c.domain}`,
    path: c.path || '/',
    expires: c.expirationDate || -1,
    httpOnly: c.httpOnly || false,
    secure: c.secure || true,
    sameSite: (c.sameSite || 'None').charAt(0).toUpperCase() + (c.sameSite || 'none').slice(1)
  }));

if (!fs.existsSync(AUTH_DIR)) fs.mkdirSync(AUTH_DIR, {recursive: true});

const storageState = {cookies, origins: []};
fs.writeFileSync(AUTH_FILE, JSON.stringify(storageState, null, 2));

console.log(`✅ Converted ${cookies.length} Shopify cookies → ${AUTH_FILE}`);
