# Test Plan — SB-9922: [DEV][OL] Migrate to Firebase Functions v2

## Tổng quan

- **Ticket**: SB-9922
- **App**: Order Limit (OL)
- **Loại task**: DEV internal — Migration Firebase Functions v1 to v2
- **Tổng test cases**: 58
- **Auto test được (Playwright/CDP)**: 37 (64%) — UI-01→UI-08
- **Semi-auto (CLI/API check)**: 4 (7%) — TC-01.2→1.4, TC-04.3
- **Manual only**: 17 (29%) — TC-01.1, TC-03.x, TC-04.1→4.2, TC-06.x

## Parallel Split (cho auto tests)

| Part | Files | Groups | Cases |
|------|-------|--------|-------|
| Part A | `ui-01-dashboard.spec.js`, `ui-02-order-limits-list.spec.js` | UI-01 (4), UI-02 (7) | 11 cases |
| Part B | `ui-03-create-edit-rule.spec.js` | UI-03 (10) | 10 cases |
| Part C | `ui-04-branding-settings.spec.js`, `ui-05-storefront.spec.js` | UI-04 (5), UI-05 (4), UI-06 (2), UI-07 (4), UI-08 (4) | 19 cases |
| Manual | `part-c-deployment-checklist.spec.js` | TC-01 (4), TC-03 (10), TC-04 (3), TC-06 (4) | 21 cases |

## Chi tiết theo Group

### Migration Tests (21 cases — manual/semi-auto)

| Group | Cases | Type |
|-------|-------|------|
| TC-01: Deployment & Function List | 4 | Semi-auto (CLI) |
| TC-03: Firestore Triggers | 10 | Manual (check logs) |
| TC-04: Pub/Sub & Scheduler | 3 | Manual + Semi-auto |
| TC-06: Error Handling & Edge Cases | 4 | Manual |

### UI Functional Tests (37 cases — auto)

| Group | Cases | Spec File | Part |
|-------|-------|-----------|------|
| UI-01: Dashboard / Home Page | 4 | `ui-01-dashboard.spec.js` | A |
| UI-02: Order Limits List Page | 7 | `ui-02-order-limits-list.spec.js` | A |
| UI-03: Create & Edit Rules | 10 | `ui-03-create-edit-rule.spec.js` | B |
| UI-04: Branding & Customization | 5 | `ui-04-branding-settings.spec.js` | C |
| UI-05: Settings & Checkout Rules | 4 | `ui-04-branding-settings.spec.js` | C |
| UI-06: Integrations | 2 | `ui-04-branding-settings.spec.js` | C |
| UI-07: Subscription & Pricing | 4 | `ui-04-branding-settings.spec.js` | C |
| UI-08: Storefront | 4 | `ui-05-storefront.spec.js` | C |

## Cách chạy

```bash
cd packages/e2e

# Chạy tất cả auto tests
npx playwright test tests/sb-9922/ui-*.spec.js

# Chạy từng part
npx playwright test tests/sb-9922/ui-*.spec.js --grep @partA
npx playwright test tests/sb-9922/ui-*.spec.js --grep @partB
npx playwright test tests/sb-9922/ui-*.spec.js --grep @partC

# Chạy với tracker
TRACKER_FILE=/Users/avada/Desktop/QA_TRACKER_SB-9922.html npx playwright test tests/sb-9922/ui-*.spec.js
```

## Lưu ý

1. **Migration + UI coverage**: Test cả backend migration (functions v2) lẫn toàn bộ UI features
2. **Auth**: Dùng Puppeteer CDP kết nối Chrome debug port 9222 (Playwright headless không auth được Shopify)
3. **Store**: claude-9967.myshopify.com, password: 1
4. **App handle staging**: avada-order-limit-staging
