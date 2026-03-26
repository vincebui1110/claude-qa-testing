/**
 * Admin Auth Setup — Validates session before running admin tests
 * If session expired (>24h), throws error with refresh instructions.
 */
import {test as setup} from '@playwright/test';
import fs from 'fs';
import path from 'path';

const AUTH_FILE = path.resolve('.auth/admin.json');
const MAX_AGE_HOURS = 24;

setup('validate admin session', async ({}) => {
  // Check if auth file exists
  if (!fs.existsSync(AUTH_FILE)) {
    throw new Error(
      `Auth file not found: ${AUTH_FILE}\n\n` +
      'To create it, run one of:\n' +
      '  1. node scripts/export-session-from-browser.js\n' +
      '  2. node scripts/convert-cookies.js cookies.json\n'
    );
  }

  // Check session age
  const stat = fs.statSync(AUTH_FILE);
  const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);

  if (ageHours > MAX_AGE_HOURS) {
    throw new Error(
      `Admin session expired (${Math.round(ageHours)}h old, max ${MAX_AGE_HOURS}h).\n\n` +
      'Refresh session:\n' +
      '  node scripts/export-session-from-browser.js\n'
    );
  }

  // Validate session content
  const content = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  if (!content.cookies || content.cookies.length === 0) {
    throw new Error(
      'Auth file exists but has no cookies. Re-export session:\n' +
      '  node scripts/export-session-from-browser.js\n'
    );
  }

  console.log(`Admin session valid (${Math.round(ageHours)}h old, ${content.cookies.length} cookies)`);
});
