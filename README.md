# Claude QA Testing

Automated Shopify app testing with Claude Code + Puppeteer CDP.

## Architecture

```
Claude Code (orchestrator)     Puppeteer CDP (runner)
  /qa-test skill                 Chrome debug port 9222
  → gen .spec.js from PRD        → connect existing session
  → gen QA_TRACKER.html           → navigate admin/storefront
  → gen run-ui-tests.cjs          → check elements in iframe
  → run tests                     → auto-accept "Leave page?" dialogs
  → update tracker                → report PASS/FAIL/PENDING
```

## Setup

1. Copy `skills/`, `workflows/`, `agents/` vào `~/.claude/`
2. Sửa `ENV.md` cho máy hiện tại
3. `npm install -g puppeteer-core`
4. Launch Chrome debug: `/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222 --user-data-dir=$HOME/.chrome-debug-profile`
5. Login Shopify Admin trong Chrome debug window

## Usage

```
# Trong Claude Code
> test SB-9922
> QA SB-9922
> chạy test tính năng Order Limit
```

## Key Technical Notes

- **Playwright headless KHÔNG auth được Shopify Admin** (Google OAuth interactive) → dùng Puppeteer CDP
- **Shopify embedded apps** chạy trong iframe → dùng `page.frames().find()` để interact
- **"Leave page?" dialog** khi navigate giữa pages có unsaved form state → `page.on('dialog', d => d.accept())`
- **`page.waitForTimeout()` deprecated** trong Puppeteer mới → dùng `sleep()` helper
- **Store password**: auto-fill, không hỏi user
- **Polaris v13**: một số components đổi từ Card → Box/BlockStack → cần update selectors

## Example: SB-9922

Full working example cho `[DEV][OL] Migrate to Firebase Functions v2`:

```
examples/sb-9922/
├── test-plan.md                        # Test plan + parallel split
├── run-ui-tests.cjs                    # CDP runner script (37 UI tests)
├── QA_TRACKER_SB-9922.html             # Live tracker with results
├── results.json                        # Test results JSON
├── playwright.config.js                # Playwright config (reference)
├── helpers/                            # Shared helpers
│   ├── embedded.js                     # iframe navigation
│   ├── nav.js                          # app route helpers
│   └── common.js                       # waitForToast, waitForPageLoad, etc.
├── ui-01-dashboard.spec.js             # Dashboard tests (4 cases)
├── ui-02-order-limits-list.spec.js     # List page tests (7 cases)
├── ui-03-create-edit-rule.spec.js      # CRUD tests (10 cases)
├── ui-04-branding-settings.spec.js     # Branding+Settings+Integrations+Sub (15 cases)
├── ui-05-storefront.spec.js            # Storefront tests (4 cases)
├── part-a-http-functions.spec.js       # Migration: HTTP functions (9 cases)
├── part-b-regression.spec.js           # Migration: regression (7 cases)
└── part-c-deployment-checklist.spec.js # Migration: manual checklist (21 cases)
```

### Results (2026-03-26)

| Status | Count |
|--------|-------|
| PASS   | 24    |
| FAIL   | 4 (selector issues, not app bugs) |
| Pending| 12 (no test data on staging) |
| Manual | 21 (Firebase console checks) |
| **Total** | **58** |

## File Structure

```
├── agents/qa-agent.md          # QA Agent definition
├── skills/qa-test/SKILL.md     # /qa-test skill definition
├── skills/qa-test/TRACKER_TEMPLATE.html
├── workflows/testing.md        # Testing workflow
├── ENV.md                      # Environment config
└── examples/sb-9922/           # Working example
```
