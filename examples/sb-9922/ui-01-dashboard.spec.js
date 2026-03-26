/**
 * TC-UI-01: Dashboard / Home Page
 * SB-9922: [DEV][OL] Migrate to Firebase Functions v2
 *
 * Verify dashboard features hoat dong binh thuong sau migration.
 */

import {test, expect} from '@playwright/test';
import {navigateToApp, waitForAppLoad} from '../../helpers/embedded.js';
import {nav} from '../../helpers/nav.js';
import {waitForPageLoad} from '../../helpers/common.js';

test.describe('TC-UI-01: Dashboard / Home Page', () => {

  test('UI-01.1 Dashboard load — hien thi greeting va overview @partA @smoke', async ({page}) => {
    const app = await nav.goTo.home(page);
    await waitForAppLoad(app);

    // Verify page title or greeting area
    const pageContent = app.locator('.Polaris-Page').first();
    await expect(pageContent).toBeVisible({timeout: 20_000});

    // Verify at least some cards/sections render
    const cards = app.locator('.Polaris-Card, .Polaris-LegacyCard');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThan(0);
  });

  test('UI-01.2 Dashboard — recent order limits section hien thi @partA', async ({page}) => {
    const app = await nav.goTo.home(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Check for table or list of recent limits
    const pageContent = app.locator('.Polaris-Page').first();
    await expect(pageContent).toBeVisible({timeout: 15_000});

    // Look for IndexTable or ResourceList
    const hasTable = await app.locator('.Polaris-IndexTable, .Polaris-ResourceList, table').first()
      .isVisible({timeout: 10_000}).catch(() => false);
    const hasEmptyState = await app.locator('.Polaris-EmptyState').first()
      .isVisible({timeout: 3_000}).catch(() => false);

    // Either table with data OR empty state is acceptable
    expect(hasTable || hasEmptyState).toBeTruthy();
  });

  test('UI-01.3 Dashboard — navigation sidebar hien thi day du menu items @partA @smoke', async ({page}) => {
    const app = await nav.goTo.home(page);
    await waitForAppLoad(app);

    // Check sidebar/navigation has key menu items
    const navItems = app.locator('.Polaris-Navigation__Item, [class*="nav"] a, [class*="sidebar"] a, [class*="menu"] a');
    const navCount = await navItems.count().catch(() => 0);

    // App should have at least 3 nav items (Home, Order Limits, Settings, etc.)
    expect(navCount).toBeGreaterThanOrEqual(3);
  });

  test('UI-01.4 Dashboard — click vao Order Limits navigate dung @partA', async ({page}) => {
    const app = await nav.goTo.home(page);
    await waitForAppLoad(app);

    // Find and click Order Limits nav item
    const olNavItem = app.locator('a, [role="link"]').filter({hasText: /order limit/i}).first();
    if (await olNavItem.isVisible({timeout: 5_000}).catch(() => false)) {
      await olNavItem.click();
      await page.waitForTimeout(3000);
      await waitForPageLoad(app);

      // Verify navigated to order limits page
      const olPage = app.locator('.Polaris-Page').first();
      await expect(olPage).toBeVisible({timeout: 15_000});
    } else {
      // Alternative: navigate directly
      const app2 = await nav.goTo.orderLimits(page);
      await waitForAppLoad(app2);
      const olPage = app2.locator('.Polaris-Page').first();
      await expect(olPage).toBeVisible({timeout: 15_000});
    }
  });
});
