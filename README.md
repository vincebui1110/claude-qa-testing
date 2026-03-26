# Claude QA Testing — Unified E2E for Shopify Apps

Automated E2E testing for 5 Shopify embedded apps, combining Claude Code AI orchestration with Playwright + Puppeteer CDP.

## Architecture

```
claude-qa-testing (this repo)          Per-app packages/e2e/
├── templates/e2e-scaffold/    ──→     ├── helpers/ (shared)
├── templates/nav/             ──→     ├── helpers/nav.js (app-specific)
├── templates/ci/              ──→     ├── .gitlab-ci.yml (test stage)
├── templates/env/             ──→     ├── .env.test
├── scripts/bootstrap-app.sh   ──→     └── Full E2E setup
└── claude-code/               ──→     ~/.claude/ (skill/workflow/agent)
```

### Testing Layers

| Layer | Directory | Auth | What |
|-------|-----------|------|------|
| **Admin** | tests/admin/ | admin.json + FrameLocator | Merchant UI trong iframe |
| **Storefront** | tests/storefront/ | customer.json (optional) | Customer-facing pages |
| **E2E Flows** | tests/e2e-flows/ | admin.json | Cross-boundary workflows |

### Execution Modes

| Mode | How | When |
|------|-----|------|
| **Claude Code** | `/qa-test SB-1234` | AI generates + runs tests from PRD |
| **Manual** | `npx playwright test` | Developer runs directly |
| **CI/CD** | GitLab pipeline | Auto on push to master |
| **Puppeteer CDP** | Fallback | When Playwright auth fails |

## Quick Start

```bash
# Bootstrap E2E for a new app
./scripts/bootstrap-app.sh cb

# Or sync shared files to existing app
./scripts/sync-shared.sh
```

See [docs/SETUP.md](docs/SETUP.md) for full setup guide.

## 5 Apps Supported

| Code | App | Status |
|------|-----|--------|
| ol | Order Limit | ✅ Full setup + tests |
| cb | Cookie Bar | 📋 Template ready |
| ac | Accessibility | 📋 Template ready |
| av | Age Verification | 📋 Template ready |
| sff | SEA Fraud Filter | 📋 Template ready |

## Repo Structure

```
├── app-configs.json                   # Registry: 5 apps handles, domains
├── templates/
│   ├── e2e-scaffold/                  # Shared E2E files (copy to app)
│   │   ├── playwright.config.js       # Multi-project config
│   │   ├── helpers/                   # embedded.js, common.js, tracker.js
│   │   ├── fixtures/                  # admin.setup.js, customer.setup.js
│   │   ├── reporters/                 # tracker-reporter.js
│   │   └── scripts/                   # validate/export/convert session
│   ├── nav/                           # Per-app route helpers
│   ├── ci/e2e-stage.yml               # GitLab CI template
│   └── env/                           # Per-app .env templates
├── claude-code/                       # Claude Code integration
│   ├── skills/qa-test/                # /qa-test skill + tracker template
│   ├── workflows/testing.md           # Testing workflow
│   └── agents/qa-agent.md             # QA agent definition
├── scripts/
│   ├── bootstrap-app.sh               # Setup E2E for new app
│   └── sync-shared.sh                 # Sync shared files to all apps
├── docs/                              # SETUP, SESSION, CI-CD, PITFALLS
└── examples/sb-9922/                  # Working example (OL migration)
```

## Key Technical Notes

- **Playwright headless can't auth Shopify** → Puppeteer CDP fallback (port 9222)
- **"Leave page?" dialog** → `page.on('dialog', d => d.accept())`
- **Save button outside iframe** → use `page` not `app` (FrameLocator)
- **Session expires ~24h** → validate-session.js checks age
- **Polaris v13** → check both `.Polaris-Card` and `.Polaris-Box`

See [docs/PITFALLS.md](docs/PITFALLS.md) for complete list.

## Documentation

- [Setup Guide](docs/SETUP.md)
- [Session Management](docs/SESSION-MANAGEMENT.md)
- [CI/CD Integration](docs/CI-CD.md)
- [Known Issues](docs/PITFALLS.md)
