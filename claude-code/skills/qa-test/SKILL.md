---
name: qa-test
description: "QA Test Agent - Automated Shopify app testing. Generate test cases from PRD/codebase, run Playwright E2E tests with 3 parallel agents, update live tracker. USE WHEN test feature, QA feature, run test, chay test, test ticket, chay test tinh nang, test task."
argument-hint: "[ticket-key(s) OR feature-name(s)] [app-code]"
---

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/qa-test/PREFERENCES.md`

If this file exists, load and apply its configurations.

# QA Test Skill — Hybrid Playwright + Claude Code

Generate test cases from PRD + codebase → `.spec.js` files + Live QA Tracker → run Playwright E2E tests via 3 parallel agents → report.

## Architecture

```
Playwright (core)              Claude Code (orchestration)
• FrameLocator (iframe)        • Gen .spec.js từ PRD
• Auto-wait + assertions       • 3 agents song song
• Trace viewer khi fail        • Live QA Tracker
• CI/CD ready                  • Background execution
```

## Configuration

**Đọc `~/.claude/ENV.md` để lấy paths.** Dưới đây dùng biến từ ENV.md:

- **Working Directory**: `${SHOPIFY_APP_DIR}`
- **Store**: `${STORE_URL}`
- **Store Password**: `${STORE_PASSWORD}`
- **Tracker Template**: `${CLAUDE_DIR}/skills/qa-test/TRACKER_TEMPLATE.html`
- **Output Dir**: `${DESKTOP}`
- **Credentials**: `${SECRETS_FILE}` (KHÔNG đọc/hiển thị)
- **E2E Setup Guide**: `github.com/vincebui1110/claude-qa-testing` (templates, scripts, docs)
- **Bootstrap script**: `claude-qa-testing/scripts/bootstrap-app.sh` (setup packages/e2e/ cho app mới)

### App Codebase Mapping

| App (aliases) | Code Path | E2E Path | App Handle (staging) | App Domain (iframe) |
|---------------|-----------|----------|---------------------|---------------------|
| order limit, ol | `${SHOPIFY_APP_DIR}/order-limit/` | `packages/e2e/` | avada-order-limit-staging | avada-order-limit-staging.web.app |
| cookie bar, cb | `${SHOPIFY_APP_DIR}/cookie-bar/` | `packages/e2e/` | avada-cookie-bar-staging | avada-cookie-bar-staging.web.app |
| accessibility, ac | `${SHOPIFY_APP_DIR}/accessibility/` | `packages/e2e/` | ag-accessibility-staging-1 | ag-accessibility-staging-1.firebaseapp.com |
| age verification, av | `${SHOPIFY_APP_DIR}/age-verification/` | `packages/e2e/` | avada-verification-staging-1 | age-verification-staging-1.web.app |
| sea fraud filter, sff | `${SHOPIFY_APP_DIR}/sea-fraud-filter/` | `packages/e2e/` | — | — |

### E2E Infrastructure Reference

- **Templates repo**: `github.com/vincebui1110/claude-qa-testing`
- **Bootstrap new app**: `./scripts/bootstrap-app.sh <app-code>`
- **Sync shared helpers**: `./scripts/sync-shared.sh`
- **Validate session**: `node packages/e2e/scripts/validate-session.js`
- **Multi-layer tests**: `tests/admin/`, `tests/storefront/`, `tests/e2e-flows/`

### docs Paths

| Source | Path Pattern |
|--------|-------------|
| PRD | `${DESKTOP}/PRD_*.md` or `docs/PRD/PRD_*.md` |
| Research | `${DESKTOP}/RESEARCH_*.md` or `docs/Research/RESEARCH_*.md` |
| User Story | `${DESKTOP}/US_*.md` |

## Workflow Routing

| Sub-workflow | Trigger | Description |
|-------------|---------|-------------|
| **Generate** | "generate test", "tạo testcase" | Phase 1 only — gen .spec.js + tracker |
| **Run** | "test [ticket]", "run test", "QA [ticket]", "chạy test tính năng [X]", "test task [X]" | Full flow: generate + execute + report |
| **Resume** | "tiếp tục test", "resume test" | Continue from existing .spec.js files |
| **Multi** | "test SB-1234, SB-5678", "test task A và B" | Song song nhiều ticket |

---

## Phase 1: Generate Test Cases + .spec.js Files

### Input Resolution
1. Nhận `ticket_key` (e.g. SB-8523) hoặc `feature_name` + `app_code`
2. Nếu có ticket key: đọc Jira ticket via `mcp__jira__read_jira_issue` → lấy description, feature name
3. Tìm PRD file: search `~/Desktop/PRD_*.md` và `docs/PRD/` cho feature tương ứng
4. Nếu không tìm được PRD: hỏi user path hoặc generate từ ticket description

### Read Sources (BẮT BUỘC)
1. **Đọc PRD**: Focus vào acceptance criteria, UI flow, edge cases, design description
2. **Đọc codebase**: Explore agent hoặc Grep/Glob — routes, controllers, components, validation rules
3. **Đọc existing E2E**: Check `packages/e2e/` cho existing helpers, patterns, data files

### Setup E2E nếu chưa có

Nếu app chưa có `packages/e2e/`, đọc `~/Downloads/AI-AGENT-GUIDE.md` và follow Bước 1-5:
1. `npm init playwright@latest` trong `packages/e2e/`
2. Tạo playwright.config.js (xem template bên dưới)
3. Tạo helpers: embedded.js, nav.js, common.js, tracker.js
4. Tạo reporters/tracker-reporter.js
5. Setup auth: `.auth/admin.json`
6. Verify smoke test pass

### Generate Outputs

**1. `.spec.js` files:**

```javascript
import {test, expect} from '@playwright/test';
import {nav} from '../../../helpers/nav.js';
import {waitForPageLoad, waitForToast} from '../../../helpers/common.js';

test.describe('Feature Name @admin @smoke @partA', () => {
  test.beforeEach(async ({page}) => {
    await nav.goTo.featurePage(page);
  });

  test('1.1 Happy path description @partA @smoke', async ({page}) => {
    const app = await nav.goTo.featurePage(page);
    // Dùng app (FrameLocator) cho mọi interaction trong iframe
    await app.getByLabel('Plan name').fill('Weekly 10% Off');
    // Dùng page cho Save button (Shopify contextual bar nằm ngoài iframe)
    await page.getByRole('button', {name: /save/i}).first().click();
    await waitForToast(app, /success/i);
  });

  test('1.2 Negative case @partA @regression', async ({page}) => {
    const app = await nav.goTo.featurePage(page);
    await page.getByRole('button', {name: /save/i}).first().click();
    await expect(app.getByText(/required/i)).toBeVisible();
  });
});
```

**Quy tắc tags:**
- `@partA` / `@partB` / `@partC` — chia cho 3 agents (BẮT BUỘC)
- `@smoke` / `@regression` — priority level
- `@admin` / `@storefront` — test area
- Case ID trong title: `"1.1 Mô tả @partA @smoke"`

**Nguyên tắc chia @part:**
- Chia theo **complete modules** — không tách 1 module ra 2 agents
- Chia **đều số cases** nhất có thể
- Ghi split mapping vào output

**2. `TEST_DATA` array** cho QA Tracker:

```javascript
[
  { group: "TC01", title: "Group name", cases: [
    { id: "1.1", el: "Element description", exp: "Expected result" },
  ]},
]
```

**3. Live Tracker HTML**: `${DESKTOP}/QA_TRACKER_{TICKET}.html`
- Đọc template từ `${CLAUDE_DIR}/skills/qa-test/TRACKER_TEMPLATE.html`
- Replace placeholders: `{{TITLE}}`, `{{TICKET}}`, `{{APP_NAME}}`, `{{STORAGE_KEY}}`, `{{TEST_DATA}}`

**4. Markdown archive**: `${DESKTOP}/TESTCASE_{TICKET}.md`

**5. test-plan.md** với split mapping:
```
Part A: [TC01, TC02, TC03] → 31 cases → create-plan.spec.js, plan-crud.spec.js
Part B: [TC04, TC05, TC06] → 28 cases → sub-list.spec.js, sub-detail.spec.js
Part C: [TC07, TC08, TC09] → 24 cases → widget.spec.js, portal.spec.js
```

### --- CHECKPOINT: User review test cases trước khi chạy ---

---

## Phase 2: Run Tests — 3 Playwright Agents Song Song

### Phase 2a: Verify prerequisites (tuần tự)

1. **Check E2E setup**: `packages/e2e/` exists, `playwright.config.js` present
2. **Check auth**: `.auth/admin.json` exists và chưa hết hạn (< 24h)
3. **Check .spec.js files**: Phase 1 output đã có trong `tests/`
4. **Open tracker**: `open ${DESKTOP}/QA_TRACKER_{TICKET}.html`

Nếu auth expired: thông báo user chạy `node scripts/export-session-from-browser.js`

### Phase 2b: Spawn 3 agents song song

Parent spawn **3 agents cùng lúc** với `run_in_background: true`:

```
Agent A: qa-agent → npx playwright test --grep @partA → return summary
Agent B: qa-agent → npx playwright test --grep @partB → return summary
Agent C: qa-agent → npx playwright test --grep @partC → return summary
```

Mỗi agent chạy:
```bash
cd ${APP_PATH}/packages/e2e && \
TRACKER_FILE=${DESKTOP}/QA_TRACKER_${TICKET}.html \
npx playwright test --grep @partX --reporter=list,./reporters/tracker-reporter.js
```

### Quy tắc:
```
BẮT BUỘC:
✅ Playwright headless → không steal focus
✅ Custom reporter update tracker realtime
✅ Mỗi agent --grep riêng → không conflict
✅ Trace tự lưu khi fail

KHÔNG:
❌ Share browser context
❌ Headed mode
❌ bringToFront()
```

### Error Recovery
- **Auth expired**: thông báo user refresh session
- **Playwright not installed**: `cd packages/e2e && npm install`
- **Test timeout**: tăng timeout trong playwright.config.js
- **Element not found**: dùng debug script inspect UI (xem Playwright Patterns bên dưới)

---

## Phase 3: Report

Sau khi 3 agents hoàn thành:
1. Merge passed/failed/skipped từ 3 agents
2. Đọc `reports/results.json` + tracker state
3. List failed tests với error + trace path

```markdown
## QA Report — {TICKET}: {Feature Name}
**Date**: {today} | **App**: {app name} | **Framework**: Playwright E2E (3 agents)

### Summary
| Passed | Failed | Skipped | Total |
|--------|--------|---------|-------|
| X      | Y      | Z       | N     |

### Failed Tests
| # | Test Name | Error | Trace |
|---|-----------|-------|-------|
...

### Bugs Found
1. **BUG-1**: Description
```

**Post-report:** suggest Jira comment, sub-tasks cho bugs, update daily note, `npx playwright show-report`

---

## Playwright Patterns (Reference)

### Embedded Mode — FrameLocator vs Page

Shopify embedded apps chạy trong iframe. Quy tắc vàng:

| Dùng `page` | Dùng `app` (FrameLocator) |
|---|---|
| `page.waitForTimeout()` | `app.getByLabel('Name').fill()` |
| `page.waitForURL()` | `app.getByRole('button', {name: 'Save'}).click()` |
| `page.waitForResponse()` (API) | `app.locator('table tbody tr')` |
| `page.goto()` | Mọi interaction với nội dung app |
| `page.getByRole('button', {name: /save/i})` | (Save bar nằm ngoài iframe!) |

FrameLocator KHÔNG hỗ trợ:
```javascript
// ❌ KHÔNG dùng trên FrameLocator:
app.evaluate()          // → dùng page.frames().find(f => ...).evaluate()
app.waitForTimeout()    // → dùng page.waitForTimeout()
app.waitForLoadState()  // → dùng app.locator('.Polaris-Page').waitFor()
```

### Helper templates

**embedded.js:**
```javascript
const SHOP_DOMAIN = process.env.SHOP_DOMAIN;
const APP_HANDLE = process.env.SHOPIFY_APP_HANDLE;
const APP_DOMAIN = process.env.APP_DOMAIN;

export function getEmbeddedUrl(path = '') {
  const slug = SHOP_DOMAIN?.replace('.myshopify.com', '');
  return `https://admin.shopify.com/store/${slug}/apps/${APP_HANDLE}/embed${path}`;
}

export async function navigateToApp(page, path = '') {
  await page.goto(getEmbeddedUrl(path), {waitUntil: 'commit', timeout: 30_000}).catch(() => {});
  await page.waitForLoadState('load', {timeout: 30_000}).catch(() => {});
  await page.waitForTimeout(5000);
  return page.frameLocator(`iframe[src*="${APP_DOMAIN}"]`).first();
}

export async function waitForAppLoad(app) {
  await app.locator('.Polaris-Page, .Polaris-Card, .Polaris-LegacyCard').first()
    .waitFor({state: 'visible', timeout: 15_000}).catch(() => {});
}
```

**common.js (key functions):**
```javascript
export async function waitForToast(context, text) {
  const toast = context.locator('.Polaris-Frame-Toast', {hasText: text});
  await toast.waitFor({state: 'visible', timeout: 10_000});
}

export async function waitForPageLoad(context) {
  await context.locator('.Polaris-Spinner')
    .waitFor({state: 'hidden', timeout: 15_000}).catch(() => {});
}

export async function selectTab(context, tabName) {
  await context.getByRole('tab', {name: tabName}).first().click();
  await waitForPageLoad(context);
}
```

**reporters/tracker-reporter.js:**
```javascript
import fs from 'fs';

class TrackerReporter {
  constructor() {
    this.stateFile = process.env.TRACKER_FILE?.replace('.html', '-state.json');
    this.state = {};
    if (this.stateFile && fs.existsSync(this.stateFile)) {
      this.state = JSON.parse(fs.readFileSync(this.stateFile, 'utf8'));
    }
  }

  onTestBegin(test) {
    const id = this._extractId(test.title);
    if (id) { this.state[id] = {status: 'testing', note: ''}; this._save(); }
  }

  onTestEnd(test, result) {
    const id = this._extractId(test.title);
    if (!id) return;
    const status = result.status === 'passed' ? 'done' : result.status === 'failed' ? 'block' : 'pending';
    const note = result.status === 'failed' ? (result.error?.message?.slice(0, 200) || 'Failed') : '';
    this.state[id] = {status, note}; this._save();
  }

  _extractId(title) { return title.match(/(\d+\.\d+)/)?.[1]; }
  _save() { if (this.stateFile) fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2)); }
}
export default TrackerReporter;
```

**playwright.config.js:**
```javascript
import {defineConfig, devices} from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {timeout: 10_000},
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['html', {outputFolder: 'reports/html', open: 'never'}],
    ['json', {outputFile: 'reports/results.json'}],
    ['list'],
    ...(process.env.TRACKER_FILE ? [['./reporters/tracker-reporter.js']] : [])
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    headless: true
  },
  projects: [
    {
      name: 'admin',
      testDir: './tests/admin',
      use: {...devices['Desktop Chrome'], storageState: '.auth/admin.json'},
      dependencies: ['admin-auth']
    },
    {
      name: 'storefront',
      testDir: './tests/storefront',
      use: {...devices['Desktop Chrome']},
    },
    {name: 'admin-auth', testDir: './fixtures', testMatch: /admin\.setup\.js/},
  ]
});
```

### Pitfalls

1. **Save button nằm NGOÀI iframe** → dùng `page.getByRole('button', {name: /save/i})` không phải `app`
2. **Toast render ở cả 2 nơi** → try `app` trước, fallback `page`
3. **Iframe detach khi navigate** → FrameLocator xử lý tự động, Frame sẽ crash
4. **Client-side routing** → navigate trực tiếp bằng URL thay vì click link
5. **Duplicate elements (responsive)** → dùng `.first()`: `app.getByRole('tab', {name: 'Active'}).first()`

### Debug script (khi selector sai):
```javascript
const {chromium} = require('@playwright/test');
(async () => {
  const b = await chromium.launch({headless: false, channel: 'chrome'});
  const c = await b.newContext({storageState: '.auth/admin.json'});
  const p = await c.newPage();
  await p.goto('https://admin.shopify.com/store/STORE/apps/APP/embed/PATH');
  await p.waitForTimeout(10000);
  const f = p.frames().find(f => f.url().includes('APP-DOMAIN'));
  if (f) {
    console.log('TABS:', await f.locator('[role=tab]').evaluateAll(els =>
      els.map(e => ({text: e.textContent}))));
    console.log('BUTTONS:', await f.locator('button').evaluateAll(els =>
      els.filter(e => e.offsetParent).map(e => ({text: e.textContent.trim()}))));
  }
  console.log('Browser open — Ctrl+C to close');
})();
```

---

## Rules

- **KHÔNG skip Phase 1** — luôn đọc PRD + codebase trước khi gen tests
- **Dùng FrameLocator** cho iframe, `page` cho waitFor/screenshot/Save button
- **Mỗi test ≥ 1 expect** — không có expect = vô nghĩa
- **Tags BẮT BUỘC**: @partA/@partB/@partC + @smoke/@regression
- **Case ID trong title**: "1.1 Mô tả @partA @smoke"
- **Headless mặc định** — không steal focus, không bringToFront()
- **Report tiếng Việt** có dấu
- **Log mọi case** — không skip silent
- Feature chưa deploy → `test.skip()`, KHÔNG để fail
- `block` (fail) chỉ khi feature deployed nhưng kết quả sai
