# Session Management

## 3 Ways to Get Auth Session

### Method 1: Chrome Extension (Fastest)
1. Install EditThisCookie or Cookie-Editor extension
2. Login to Shopify Admin normally
3. Click extension → Export All Cookies (JSON)
4. Run: `node scripts/convert-cookies.js cookies.json`

### Method 2: Interactive Browser (Most Reliable)
1. Run: `node scripts/export-session-from-browser.js`
2. Chrome opens → login manually
3. Press Enter after seeing admin dashboard
4. Session saved to `.auth/admin.json`

### Method 3: CDP (Connect to Running Chrome)
1. Launch Chrome debug: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=$HOME/.chrome-debug-profile`
2. Login to Shopify Admin in that Chrome
3. Run: `node scripts/export-session-from-browser.js --cdp`

## Session Lifecycle

- **Valid**: ~24 hours after export
- **Warning**: After 20 hours (validate-session.js warns)
- **Expired**: After 24 hours (tests fail with clear error)

## Validate Session

```bash
node scripts/validate-session.js        # Verbose output
node scripts/validate-session.js --quiet # Exit code only (for CI)
```

## CI/CD Session

In GitLab CI, store `E2E_ADMIN_AUTH_JSON` as a masked CI variable.
The pipeline writes it to `.auth/admin.json` before running tests.
Refresh manually when expired (~every 2 weeks for CI).

## Puppeteer CDP Fallback

When Playwright session fails (Shopify OAuth redirect), Claude Code
automatically falls back to Puppeteer CDP connecting to Chrome debug
port 9222. This requires Chrome to be running with `--remote-debugging-port=9222`.
