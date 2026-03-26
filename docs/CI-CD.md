# CI/CD Integration — GitLab

## Setup

1. Copy `templates/ci/e2e-stage.yml` jobs into your app's `.gitlab-ci.yml`
2. Add `test` to your `stages:` list
3. Set CI/CD variables in GitLab project settings

## Required CI Variables

| Variable | Value | Masked |
|----------|-------|--------|
| E2E_SHOP_DOMAIN | claude-9967.myshopify.com | No |
| E2E_APP_HANDLE | your-app-handle-staging | No |
| E2E_APP_DOMAIN | your-app.web.app | No |
| E2E_STORE_PASSWORD | 1 | Yes |
| E2E_ADMIN_AUTH_JSON | (contents of .auth/admin.json) | Yes |

## Pipeline Behavior

- **Auto trigger**: Push to master or MR to master
- **Manual trigger**: Any branch via "Play" button
- **Timeout**: 15 minutes
- **allow_failure**: true (initially — remove when tests stable)
- **Artifacts**: HTML reports + test results (30 days)

## Docker Image

Uses `mcr.microsoft.com/playwright:v1.50.0-noble` — official Playwright image with Chromium pre-installed.
