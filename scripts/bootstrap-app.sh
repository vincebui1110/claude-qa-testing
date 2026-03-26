#!/bin/bash
# Bootstrap E2E for a Shopify app
# Usage: ./scripts/bootstrap-app.sh <app-code> [shopify-app-dir]
#
# Example: ./scripts/bootstrap-app.sh cb "/Users/avada/Documents/Shopify app"

set -e

APP_CODE="$1"
SHOPIFY_DIR="${2:-/Users/avada/Documents/Shopify app}"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/templates/e2e-scaffold"

# App mapping
declare -A APP_REPO=(
  [ol]="order-limit"
  [cb]="cookie-bar"
  [ac]="accessibility"
  [av]="age-verification"
  [sff]="sea-fraud-filter"
)

declare -A APP_HANDLE=(
  [ol]="avada-order-limit-staging"
  [cb]="avada-cookie-bar-staging"
  [ac]="ag-accessibility-staging-1"
  [av]="avada-verification-staging-1"
  [sff]=""
)

if [ -z "$APP_CODE" ] || [ -z "${APP_REPO[$APP_CODE]}" ]; then
  echo "Usage: $0 <app-code>"
  echo "Available: ol, cb, ac, av, sff"
  exit 1
fi

REPO="${APP_REPO[$APP_CODE]}"
TARGET="$SHOPIFY_DIR/$REPO/packages/e2e"
HANDLE="${APP_HANDLE[$APP_CODE]}"

echo "=== Bootstrap E2E for $REPO ==="
echo "Target: $TARGET"

# Check if already exists
if [ -d "$TARGET" ]; then
  echo "⚠️  packages/e2e/ already exists. Syncing shared files only."
  # Only sync shared files
  cp "$TEMPLATE_DIR/helpers/embedded.js" "$TARGET/helpers/"
  cp "$TEMPLATE_DIR/helpers/common.js" "$TARGET/helpers/"
  cp "$TEMPLATE_DIR/helpers/tracker.js" "$TARGET/helpers/"
  cp "$TEMPLATE_DIR/reporters/tracker-reporter.js" "$TARGET/reporters/"
  cp "$TEMPLATE_DIR/fixtures/admin.setup.js" "$TARGET/fixtures/"
  cp "$TEMPLATE_DIR/fixtures/customer.setup.js" "$TARGET/fixtures/"
  cp -r "$TEMPLATE_DIR/scripts/" "$TARGET/scripts/"
  echo "✅ Shared files synced"
  exit 0
fi

# Create directory structure
echo "Creating directory structure..."
mkdir -p "$TARGET"/{.auth,helpers,fixtures,reporters,scripts,data,tests/{admin,storefront,e2e-flows},reports}

# Copy shared files
echo "Copying shared templates..."
cp "$TEMPLATE_DIR/playwright.config.js" "$TARGET/"
cp "$TEMPLATE_DIR/package.json" "$TARGET/"
cp "$TEMPLATE_DIR/.env.example" "$TARGET/"
cp "$TEMPLATE_DIR/.gitignore" "$TARGET/"
cp "$TEMPLATE_DIR/helpers/"*.js "$TARGET/helpers/"
cp "$TEMPLATE_DIR/fixtures/"*.js "$TARGET/fixtures/"
cp "$TEMPLATE_DIR/reporters/"*.js "$TARGET/reporters/"
cp "$TEMPLATE_DIR/scripts/"*.js "$TARGET/scripts/"

# Copy app-specific nav.js
NAV_FILE="$SCRIPT_DIR/templates/nav/nav-$REPO.js"
if [ -f "$NAV_FILE" ]; then
  cp "$NAV_FILE" "$TARGET/helpers/nav.js"
  echo "Copied app-specific nav.js"
else
  # Create skeleton nav.js
  cat > "$TARGET/helpers/nav.js" << 'NAVEOF'
import {navigateToApp} from './embedded.js';

export const nav = {
  goTo: {
    home: page => navigateToApp(page, '/'),
    // TODO: Add app-specific routes here
    // Example: settings: page => navigateToApp(page, '/settings'),
  }
};
NAVEOF
  echo "Created skeleton nav.js — update with app-specific routes"
fi

# Copy app-specific .env
ENV_FILE="$SCRIPT_DIR/templates/env/.env.$APP_CODE"
if [ -f "$ENV_FILE" ]; then
  cp "$ENV_FILE" "$TARGET/.env.test"
  echo "Copied app-specific .env.test"
else
  # Create from template
  sed "s/your-app-handle-staging/$HANDLE/" "$TEMPLATE_DIR/.env.example" > "$TARGET/.env.test"
  echo "Created .env.test from template — update APP_DOMAIN"
fi

# Create empty auth files
echo '{"cookies":[],"origins":[]}' > "$TARGET/.auth/admin.json"
echo '{"cookies":[],"origins":[]}' > "$TARGET/.auth/customer.json"

# Create smoke test
cat > "$TARGET/tests/admin/smoke.spec.js" << 'SMOKEEOF'
/**
 * Smoke Test — Verify app loads in Shopify Admin
 */
import {test, expect} from '@playwright/test';
import {navigateToApp, waitForAppLoad} from '../../helpers/embedded.js';

test.describe('Smoke Test @smoke @partA', () => {
  test('App loads in Shopify Admin', async ({page}) => {
    const app = await navigateToApp(page, '/');
    await waitForAppLoad(app);

    const pageContent = app.locator('.Polaris-Page, .Polaris-Card, .Polaris-Box').first();
    await expect(pageContent).toBeVisible({timeout: 20_000});
  });
});
SMOKEEOF

# Install dependencies
echo "Installing dependencies..."
cd "$TARGET" && npm install 2>/dev/null
npx playwright install chromium 2>/dev/null

echo ""
echo "=== ✅ E2E setup complete for $REPO ==="
echo ""
echo "Next steps:"
echo "  1. Update .env.test with correct APP_DOMAIN"
echo "  2. Update helpers/nav.js with app routes"
echo "  3. Export session: node scripts/export-session-from-browser.js"
echo "  4. Run smoke test: npx playwright test tests/admin/smoke.spec.js"
