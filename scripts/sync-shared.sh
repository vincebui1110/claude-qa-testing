#!/bin/bash
# Sync shared helpers from templates to all 5 apps
# Usage: ./scripts/sync-shared.sh [shopify-app-dir]

SHOPIFY_DIR="${1:-/Users/avada/Documents/Shopify app}"
SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TEMPLATE_DIR="$SCRIPT_DIR/templates/e2e-scaffold"

APPS=("order-limit" "cookie-bar" "accessibility" "age-verification" "sea-fraud-filter")

echo "=== Sync shared E2E files ==="

for APP in "${APPS[@]}"; do
  TARGET="$SHOPIFY_DIR/$APP/packages/e2e"
  if [ -d "$TARGET" ]; then
    echo "Syncing $APP..."
    cp "$TEMPLATE_DIR/helpers/embedded.js" "$TARGET/helpers/" 2>/dev/null
    cp "$TEMPLATE_DIR/helpers/common.js" "$TARGET/helpers/" 2>/dev/null
    cp "$TEMPLATE_DIR/helpers/tracker.js" "$TARGET/helpers/" 2>/dev/null
    cp "$TEMPLATE_DIR/reporters/tracker-reporter.js" "$TARGET/reporters/" 2>/dev/null
    cp "$TEMPLATE_DIR/fixtures/admin.setup.js" "$TARGET/fixtures/" 2>/dev/null
    cp "$TEMPLATE_DIR/fixtures/customer.setup.js" "$TARGET/fixtures/" 2>/dev/null
    cp -r "$TEMPLATE_DIR/scripts/" "$TARGET/scripts/" 2>/dev/null
    echo "  ✅ $APP synced"
  else
    echo "  ⊘ $APP — no packages/e2e/ (run bootstrap-app.sh first)"
  fi
done

echo "Done."
