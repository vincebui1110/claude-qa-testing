#!/usr/bin/env node
/**
 * Validate Session — Check if .auth/admin.json is valid
 * Exit 0 = valid, Exit 1 = expired/missing
 *
 * Usage: node scripts/validate-session.js [--quiet]
 */
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const AUTH_FILE = path.resolve(__dirname, '..', '.auth', 'admin.json');
const MAX_AGE_HOURS = 24;
const WARN_AGE_HOURS = 20;
const quiet = process.argv.includes('--quiet');

function log(msg) { if (!quiet) console.log(msg); }

// Check existence
if (!fs.existsSync(AUTH_FILE)) {
  log('❌ Session file not found: ' + AUTH_FILE);
  log('   Run: node scripts/export-session-from-browser.js');
  process.exit(1);
}

// Check age
const stat = fs.statSync(AUTH_FILE);
const ageHours = (Date.now() - stat.mtimeMs) / (1000 * 60 * 60);

if (ageHours > MAX_AGE_HOURS) {
  log(`❌ Session expired (${Math.round(ageHours)}h old, max ${MAX_AGE_HOURS}h)`);
  log('   Run: node scripts/export-session-from-browser.js');
  process.exit(1);
}

// Check content
try {
  const content = JSON.parse(fs.readFileSync(AUTH_FILE, 'utf8'));
  if (!content.cookies || content.cookies.length === 0) {
    log('❌ Session file empty (no cookies)');
    log('   Run: node scripts/export-session-from-browser.js');
    process.exit(1);
  }

  if (ageHours > WARN_AGE_HOURS) {
    log(`⚠️  Session expiring soon (${Math.round(ageHours)}h old)`);
  } else {
    log(`✅ Session valid (${Math.round(ageHours)}h old, ${content.cookies.length} cookies)`);
  }
  process.exit(0);
} catch (e) {
  log('❌ Session file corrupt: ' + e.message);
  process.exit(1);
}
