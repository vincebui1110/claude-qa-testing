---
name: qa-test
description: "QA Test Agent - Automated Shopify app testing. Generate test cases from PRD/codebase, run tests in Chrome debug via Puppeteer, update live tracker. USE WHEN test feature, QA feature, run test, chay test, test ticket, chay test tinh nang, test task."
argument-hint: "[ticket-key(s) OR feature-name(s)] [app-code]"
---

## Customization

**Before executing, check for user customizations at:**
`~/.claude/skills/qa-test/PREFERENCES.md`

# QA Test Skill — Automated Shopify App Testing

Generate test cases from PRD + codebase, run automated tests via Puppeteer (background, no focus steal), update live HTML tracker.

## Configuration

**Read `~/.claude/ENV.md` for paths.** Variables below reference ENV.md:

- **Working Directory**: `${SHOPIFY_APP_DIR}`
- **Chrome Debug Port**: `${CHROME_DEBUG_PORT}` (default: 9222)
- **Chrome Debug Profile**: `${CHROME_DEBUG_PROFILE}`
- **Chrome Path**: `${CHROME_PATH}`
- **Store**: `${STORE_URL}`
- **Store Password**: `${STORE_PASSWORD}`
- **Puppeteer Env**: `NODE_PATH=${NODE_PATH}`
- **Tracker Template**: `${CLAUDE_DIR}/skills/qa-test/TRACKER_TEMPLATE.html`
- **Output Dir**: `${DESKTOP}`

### App Codebase Mapping

| App (aliases) | Code Path | Staging App |
|---------------|-----------|-------------|
| order limit, ol | `${SHOPIFY_APP_DIR}/order-limit/` | — |
| cookie bar, cb | `${SHOPIFY_APP_DIR}/cookie-bar/` | — |
| accessibility, ac | `${SHOPIFY_APP_DIR}/accessibility/` | ag-accessibility-staging-1 |
| age verification, av | `${SHOPIFY_APP_DIR}/age-verification/` | — |
| sea fraud filter, sff | `${SHOPIFY_APP_DIR}/sea-fraud-filter/` | — |

## Workflow Routing

| Sub-workflow | Trigger | Description |
|-------------|---------|-------------|
| **Generate** | "generate test", "tao testcase" | Phase 1 only |
| **Run** | "test [ticket]", "run test", "QA [ticket]", "test task [X]" | Full flow |
| **Resume** | "tiep tuc test", "resume test" | Continue from existing tracker |

## Parallel Verify (3-Split)

Test cases split into 3 parts, 3 agents verify in parallel.

### Rules
1. Split by **complete groups** — never split 1 group across agents
2. Split **evenly** by case count
3. Each agent gets own storefront tab (read-only)
4. Tracker shared — QA.update() is thread-safe via CDP serialize

## Phase 1: Generate Test Cases

1. Read PRD + codebase for the feature
2. Generate TEST_DATA array: `[{ group, title, cases: [{ id, el, exp }] }]`
3. Split into 3 parts, output split mapping
4. Create tracker HTML from TRACKER_TEMPLATE.html (replace {{TICKET}}, {{TITLE}}, {{TEST_DATA}}, {{STORAGE_KEY}})
5. Create markdown archive

## Phase 2a: Browser Setup (Sequential)

CRITICAL: NEVER call page.bringToFront() — user is working elsewhere.

1. Start Chrome debug if not running
2. Open tracker tab + admin tab + 3 storefront tabs
3. Auto-fill store password on each storefront tab
4. Setup app state (toggle features, run scanner)
5. Wait for widget inject (10s)
6. Output tab WebSocket URLs for 3 agents

## Phase 2b: Parallel Verify (3 Agents)

Spawn 3 agents with run_in_background: true. Each agent:
1. Connect to assigned storefront tab
2. For each case: read DOM element → compare expected → update tracker
3. READ-ONLY — no navigate, no click, no reload
4. Cases needing interaction → set 'pending'

## Phase 3: Report

1. Export tracker state: QA.exportState() + QA.getSummary() + QA.getFailures()
2. Summarize done/block/pending counts
3. List failed cases with details
4. Identify bugs found
5. Report in Vietnamese (co dau)

## Rules

- NEVER bringToFront()
- NEVER skip Phase 1 — always read PRD + codebase first
- Store password — auto-fill from ENV.md
- Puppeteer timeout: 15s/action, 30s/page load
- Report in Vietnamese (co dau)
- Log every case — no silent skips
- Feature not deployed → 'pending', not 'block'
- 'block' = feature deployed but wrong result
