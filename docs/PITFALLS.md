# Known Issues & Solutions

## Shopify Embedded App Testing

| # | Issue | Solution |
|---|-------|----------|
| 1 | **Save button outside iframe** | Use `page.getByRole('button', {name: /save/i})` not `app` |
| 2 | **"Leave page?" dialog** blocks navigation | `page.on('dialog', d => d.accept())` |
| 3 | **Frame detached** on route change | Use FrameLocator (auto-retry) not Frame |
| 4 | **Duplicate elements** (responsive) | Use `.first()` on all selectors |
| 5 | **Toast renders in 2 locations** | Try `app` first, fallback to `page` |
| 6 | **Playwright can't auth Shopify** | Use Puppeteer CDP fallback |
| 7 | **`page.waitForTimeout()` deprecated** | Use `sleep()` or `setTimeout` |
| 8 | **Polaris v13 Card → Box** | Check both `.Polaris-Card` and `.Polaris-Box` |
| 9 | **Client-side routing fails** | Navigate via URL, not click |
| 10 | **Iframe src differs staging/prod** | Always discover via pre-flight check |

## Puppeteer CDP Specifics

| Issue | Solution |
|-------|----------|
| `waitForTimeout` not a function | Use `await new Promise(r => setTimeout(r, ms))` |
| Frame access | `page.frames().find(f => f.url().includes(APP_DOMAIN))` |
| NODE_PATH required (macOS ARM) | `NODE_PATH=/opt/homebrew/lib/node_modules` |
| Node is not clickable | Use `page.evaluate()` + `page.goto()` instead of click |

## CI/CD

| Issue | Solution |
|-------|----------|
| Session expired in CI | Refresh `E2E_ADMIN_AUTH_JSON` CI variable |
| Chromium not found | `npx playwright install chromium --with-deps` |
| Timeout in CI | Increase `timeout` in playwright.config.js |
