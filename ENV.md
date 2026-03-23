# Environment Configuration

Tất cả skills/workflows đọc file này để lấy paths + config thay vì hardcode.
Khi chuyển máy mới, chỉ cần sửa file này.

## Paths

- **HOME**: `/Users/avada`
- **SHOPIFY_APP_DIR**: `/Users/avada/Documents/Shopify app`
- **DESKTOP**: `/Users/avada/Desktop`
- **CLAUDE_DIR**: `/Users/avada/.claude`
- **VAULT_DIR**: `/Users/avada/Documents/Shopify app/vault`

## App Codebases

- **OL**: `${SHOPIFY_APP_DIR}/order-limit`
- **CB**: `${SHOPIFY_APP_DIR}/cookie-bar`
- **AC**: `${SHOPIFY_APP_DIR}/accessibility`
- **AV**: `${SHOPIFY_APP_DIR}/age-verification`
- **SFF**: `${SHOPIFY_APP_DIR}/sea-fraud-filter`

## Browser Testing

- **CHROME_PATH**: `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`
- **CHROME_DEBUG_PORT**: `9222`
- **CHROME_DEBUG_PROFILE**: `${HOME}/.chrome-debug-profile`
- **NODE_PATH**: `/opt/homebrew/lib/node_modules`
- **STORE_URL**: `claude-9967.myshopify.com`
- **STORE_PASSWORD**: `1`

## Credentials

- **SECRETS_FILE**: `${SHOPIFY_APP_DIR}/.env.secrets`
- KHÔNG đọc/hiển thị nội dung credentials trong chat

## Platform Notes

- macOS ARM (Apple Silicon): `NODE_PATH=/opt/homebrew/lib/node_modules`
- macOS Intel: `NODE_PATH=/usr/local/lib/node_modules`
- Linux: `NODE_PATH=/usr/lib/node_modules` hoặc check `npm root -g`
- Windows: `CHROME_PATH=C:\Program Files\Google\Chrome\Application\chrome.exe`, `NODE_PATH` từ `npm root -g`
