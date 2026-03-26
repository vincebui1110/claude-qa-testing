# Setup Guide — E2E Testing for Shopify Apps

## Quick Start (New App)

```bash
# 1. Bootstrap E2E for an app
./scripts/bootstrap-app.sh cb

# 2. Discover APP_DOMAIN via pre-flight check (Puppeteer CDP)
# Or manually: open app in Shopify Admin, inspect iframe src

# 3. Update .env.test with correct APP_DOMAIN
cd /path/to/cookie-bar/packages/e2e
vim .env.test

# 4. Update helpers/nav.js with app-specific routes
vim helpers/nav.js

# 5. Export admin session
node scripts/export-session-from-browser.js

# 6. Run smoke test
npx playwright test tests/admin/smoke.spec.js
```

## Pre-requisites

- Node.js 18+
- Chrome installed
- Access to Shopify Admin (claude-9967 store)

## App Codes

| Code | App | Handle (staging) |
|------|-----|------------------|
| ol | Order Limit | avada-order-limit-staging |
| cb | Cookie Bar | avada-cookie-bar-staging |
| ac | Accessibility | ag-accessibility-staging-1 |
| av | Age Verification | avada-verification-staging-1 |
| sff | SEA Fraud Filter | TBD |

## Folder Structure (per app)

```
packages/e2e/
├── .auth/           # Session files (git-ignored)
├── helpers/         # embedded.js (shared), nav.js (app-specific), common.js
├── fixtures/        # admin.setup.js, customer.setup.js
├── reporters/       # tracker-reporter.js
├── scripts/         # validate-session, export-session, convert-cookies
├── tests/
│   ├── admin/       # Merchant-facing tests (iframe)
│   ├── storefront/  # Customer-facing tests (direct page)
│   └── e2e-flows/   # Cross-boundary flows
└── playwright.config.js
```
