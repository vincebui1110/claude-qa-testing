# Session Management

## Preferred Method: CDP với Avada Claude Profile (Fully Automatic)

Chrome profile `~/.chrome-debug-profile` là bản copy của Avada Claude profile — đã login sẵn Shopify admin.
Claude Code tự động refresh session **không cần user làm gì**.

```bash
# Auto-launch nếu chưa chạy
curl -s http://localhost:9222/json > /dev/null 2>&1 || \
  /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome \
    --remote-debugging-port=9222 \
    --user-data-dir=$HOME/.chrome-debug-profile \
    --window-size=1440,900 &disown
sleep 3

# Export session qua CDP
cd packages/e2e && node scripts/export-session-from-browser.js --cdp
```

Session được export và tự copy sang tất cả apps.

---

## Các phương pháp khác (manual)

### Method 1: Chrome Extension
1. Install EditThisCookie or Cookie-Editor extension
2. Login to Shopify Admin normally
3. Click extension → Export All Cookies (JSON)
4. Run: `node scripts/convert-cookies.js cookies.json`

### Method 2: Interactive Browser
1. Run: `node scripts/export-session-from-browser.js`
2. Chrome opens → login manually
3. Press Enter after seeing admin dashboard
4. Session saved to `.auth/admin.json`

### Method 3: CDP (manual)
1. Launch Chrome debug với profile tuỳ chọn
2. Login Shopify Admin
3. Run: `node scripts/export-session-from-browser.js --cdp`

---

## Session Lifecycle

- **Valid**: ~24-48 hours after export
- **Warning**: After 20 hours (validate-session.js warns)
- **Expired**: After 24 hours (tests fail with clear error)

## Validate Session

```bash
node scripts/validate-session.js        # Verbose output
node scripts/validate-session.js --quiet # Exit code only (for CI)
```

## App Coverage

Tất cả 4 apps đã pre-configured với `.env.test` + `.auth/admin.json`:

| App | Store | Handle |
|-----|-------|--------|
| OL | claude-9967 | avada-order-limit-staging |
| CB | claude-9967 | avada-cookie-bar-staging |
| AC | claude-9967 | ag-accessibility-staging-1 |
| AV | claude-9967 | avada-verification-staging-1 |

## CI/CD

GitLab CI variables (`E2E_ADMIN_AUTH_JSON`) cần Maintainer access để set.
Hiện tại không dùng CI pipeline — chạy test locally đủ.

