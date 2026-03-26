# Testing Workflow — Hybrid Playwright + Claude Code

## Trigger
User nói: "test [ticket]", "QA [ticket]", "chạy test", "run test", "chạy test tính năng [X]", "test task [X]"

## Input Required
- `ticket_key` (e.g. SB-8523) HOẶC `feature_name` (bắt buộc)
- `app_code`: OL / CB / AC / AV / SFF (hỏi nếu chưa rõ)
- Có thể nhận **nhiều ticket/feature cùng lúc** — xem Multi-session bên dưới

## Flow Overview

```
Step 0:  Pre-flight Check — verify app trên store, handle đúng, staging accessible
         ↓
Phase 1: Read PRD + Codebase → Generate .spec.js + Tracker → Chia 3 parts
         ↓ CHECKPOINT: User review
Phase 2a: Verify prerequisites (auth, E2E setup)
Phase 2b: Spawn 3 agents → npx playwright test --grep @partA/B/C (song song)
         ↓ Nếu admin tests fail do auth → fallback Puppeteer CDP
Phase 3: Merge results → QA Report
```

---

## Step 0: Pre-flight Check (BẮT BUỘC)

**Chạy TRƯỚC KHI làm bất cứ điều gì khác.**

1. **Xác định app handle trên store** — Đọc `reference_store_apps_inventory.md` trong memory hoặc query store:
   ```
   Store handles (claude-9967):
   - OL: avada-order-limit-staging
   - CB: avada-cookie-bar-staging
   - AC: ag-accessibility-staging-1
   - AV: avada-verification-staging-1
   ```
   **QUAN TRỌNG**: Handle staging KHÁC handle production (có suffix `-staging`/`-staging-1`).

2. **Verify app accessible** — Dùng Puppeteer CDP kết nối Chrome debug port 9222:
   ```javascript
   // Navigate to app URL, verify iframe loads (không redirect về login/404)
   page.goto(`https://admin.shopify.com/store/${SHOP_SLUG}/apps/${APP_HANDLE}`)
   // Check: page có iframe chứa app content không?
   ```

3. **Xác định iframe URL pattern** — Lấy iframe `src` thực tế trên staging (có thể khác production domain).

4. **Truyền kết quả cho Step 1** — QA Agent phải dùng đúng:
   - `APP_HANDLE` (staging handle, không phải production)
   - `APP_DOMAIN` (iframe src domain thực tế)

**Nếu app không accessible** → DỪNG, báo user: "App {code} chưa cài trên store {store} hoặc session hết hạn."

---

## Step 1: Generate .spec.js + Tracker — QA Agent

**Agent**: `qa-agent`
**Skill**: `/qa-test`
**Input**: ticket_key, app_code, PRD path (nếu biết)

**QA Agent thực hiện:**
1. Đọc PRD + codebase tính năng tương ứng
2. Check existing E2E setup (`packages/e2e/`) — nếu chưa có, đọc `~/Downloads/AI-AGENT-GUIDE.md` để setup lần đầu
4. Generate `.spec.js` files từ acceptance criteria + code logic + edge cases:
   - Dùng FrameLocator cho iframe interactions
   - Dùng `nav.goTo.*()` cho navigation
   - Dùng `waitForToast()`, `waitForPageLoad()` từ common.js
   - Tags: `@partA/@partB/@partC` + `@smoke/@regression` + `@admin/@storefront`
   - Case ID trong title: `"1.1 Mô tả @partA @smoke"`
5. **Chia test cases thành 3 parts** (split by module, KHÔNG xen kẽ):
   - **Part A**: Nhóm 1 (e.g. CRUD, Form)
   - **Part B**: Nhóm 2 (e.g. List, Filter, Bulk)
   - **Part C**: Nhóm 3 (e.g. Storefront, E2E flows, Edge cases)
6. Generate QA Tracker HTML + test-plan.md + markdown archive

**Nguyên tắc chia:**
- Chia **đều số cases** nhất có thể
- Mỗi phần chứa **complete modules** (không tách 1 module ra 2 agents)
- Ghi rõ split mapping trong output

**Output cho parent:**
- File paths: .spec.js files, tracker HTML, test-plan.md
- Split mapping: Part A/B/C → spec files + case counts
- E2E path: `${APP_PATH}/packages/e2e/`

### --- CHECKPOINT: User review test cases trước khi chạy ---

## Step 2a: Verify Prerequisites (Tuần tự)

**Agent**: `qa-agent` (1 agent duy nhất)
**Chạy trước khi spawn 3 agents**

1. **Check E2E folder**: `packages/e2e/` exists, `playwright.config.js` present
2. **Check Playwright installed**: `npx playwright --version`
3. **Check auth session**: `.auth/admin.json` exists và < 24h tuổi
4. **Check .spec.js files**: Phase 1 output đã có trong `tests/`
5. **Mở tracker cho user**: `open ${DESKTOP}/QA_TRACKER_{TICKET}.html`

**Nếu auth expired hoặc chưa có:**
```
Thông báo user: "Auth session hết hạn. Chạy lệnh sau rồi retry:
cd packages/e2e && node scripts/export-session-from-browser.js"
```

**Output cho parent**: Confirm ready hoặc blockers list

## Step 2b: Run Tests — 3 Playwright Agents Song Song

Spawn **3 QA Agents song song**, mỗi agent `run_in_background: true`:

```
Agent A: qa-agent → cd packages/e2e → npx playwright test --grep @partA → return summary
Agent B: qa-agent → cd packages/e2e → npx playwright test --grep @partB → return summary
Agent C: qa-agent → cd packages/e2e → npx playwright test --grep @partC → return summary
```

**Mỗi agent chạy:**
```bash
cd ${APP_PATH}/packages/e2e && \
TRACKER_FILE=${DESKTOP}/QA_TRACKER_${TICKET}.html \
npx playwright test \
  --grep @partX \
  --reporter=list,./reporters/tracker-reporter.js
```

**Mỗi agent return:**
- Passed / Failed / Skipped counts
- List failed tests: test name + error message
- Trace file paths cho failed tests

**Quy tắc:**
```
BẮT BUỘC:
✅ Playwright headless → không steal focus
✅ Custom reporter update tracker realtime
✅ Mỗi agent chạy --grep riêng → không conflict
✅ Trace tự lưu khi fail (trace: 'retain-on-failure')

KHÔNG:
❌ Share browser context giữa agents
❌ Chạy headed mode
❌ bringToFront()
```

### Fallback: Puppeteer CDP

Nếu Playwright admin tests fail do auth (Shopify redirect về login page):
1. Chuyển sang Puppeteer CDP kết nối Chrome debug port 9222 (đã login sẵn)
2. Re-run các admin tests failed bằng script `.cjs` (CommonJS, không ESM)
3. Storefront tests vẫn dùng Playwright headless (không cần admin auth)

### --- Chạy liên tục, parent đợi cả 3 agents hoàn thành ---

## Step 3: Merge + Report — QA Agent

**Agent**: `qa-agent` (1 agent)
**Input**: results từ 3 agents + tracker state

1. Merge passed/failed/skipped từ 3 agents
2. Đọc `reports/results.json` nếu có (Playwright JSON reporter)
3. Đọc tracker state: `QA_TRACKER_{TICKET}-state.json`
4. Tổng hợp report
5. List failed tests với error + trace path
6. Identify bugs found

**Output cho parent**: QA report summary (Vietnamese, có dấu)

```markdown
## QA Report — {TICKET}: {Feature Name}
**Date**: {today}
**App**: {app name}
**Framework**: Playwright E2E (3 parallel agents)

### Summary
| Status | Count |
|--------|-------|
| Passed | X |
| Failed | Y |
| Skipped | Z |
| Total | N |

### Failed Tests
| # | Test Name | Error | Trace |
|---|-----------|-------|-------|
...

### Bugs Found
1. **BUG-1**: Description
...
```

**Post-report suggestions:**
- Tạo Jira comment trên ticket với kết quả
- Tạo sub-tasks cho bugs found
- Update daily note
- Xem chi tiết: `npx playwright show-report reports/html`
- Debug failed: `npx playwright show-trace test-results/xxx/trace.zip`

---

## Multi-session

Khi user gửi nhiều ticket/feature:
```
"test SB-1234, SB-5678"
"test cookie policy page và terms conditions"
```

Xử lý tuần tự — Phase 1→2→3 cho ticket A, rồi Phase 1→2→3 cho ticket B.
Mỗi ticket có tracker HTML riêng.

---

## Notes

- **AI-AGENT-GUIDE**: `~/Downloads/AI-AGENT-GUIDE.md` — chỉ đọc khi setup E2E lần đầu cho app mới
- **Tracker template**: `~/.claude/skills/qa-test/TRACKER_TEMPLATE.html`
- **Tracker state**: JSON file cạnh tracker HTML, update bởi custom reporter
- **Playwright report**: `packages/e2e/reports/html/` — mở bằng `npx playwright show-report`
- **Trace**: `packages/e2e/test-results/` — replay bằng `npx playwright show-trace`
- **Auth**: `.auth/admin.json` — hết hạn 24-48h, refresh bằng scripts/export-session-from-browser.js
