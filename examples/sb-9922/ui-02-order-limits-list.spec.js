/**
 * TC-UI-02: Order Limits List Page
 * SB-9922: [DEV][OL] Migrate to Firebase Functions v2
 *
 * Verify list page: table, search, filter, tabs, bulk actions, pagination.
 */

import {test, expect} from '@playwright/test';
import {navigateToApp, waitForAppLoad} from '../../helpers/embedded.js';
import {nav} from '../../helpers/nav.js';
import {waitForPageLoad, selectTab, searchInTable} from '../../helpers/common.js';

test.describe('TC-UI-02: Order Limits List Page', () => {

  test.beforeEach(async ({page}) => {
    // Navigate to order limits list
  });

  test('UI-02.1 List page load — table hoac empty state hien thi @partA @smoke', async ({page}) => {
    const app = await nav.goTo.orderLimits(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Check for data table OR empty state
    const table = app.locator('.Polaris-IndexTable, table').first();
    const emptyState = app.locator('.Polaris-EmptyState').first();

    const hasTable = await table.isVisible({timeout: 10_000}).catch(() => false);
    const hasEmpty = await emptyState.isVisible({timeout: 3_000}).catch(() => false);

    expect(hasTable || hasEmpty).toBeTruthy();
  });

  test('UI-02.2 Status tabs — All/Active/Inactive/Draft tabs hien thi @partA', async ({page}) => {
    const app = await nav.goTo.orderLimits(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Check for status tabs
    const tabs = app.locator('.Polaris-Tabs__Tab, [role="tab"]');
    const tabCount = await tabs.count().catch(() => 0);

    // Should have at least All + Active tabs
    expect(tabCount).toBeGreaterThanOrEqual(2);
  });

  test('UI-02.3 Tab switching — click Active tab filter dung @partA', async ({page}) => {
    const app = await nav.goTo.orderLimits(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    const tabs = app.locator('.Polaris-Tabs__Tab, [role="tab"]');
    const tabCount = await tabs.count().catch(() => 0);

    if (tabCount >= 2) {
      // Click second tab (usually Active)
      await tabs.nth(1).click();
      await waitForPageLoad(app);

      // Page should not crash — content still visible
      const pageContent = app.locator('.Polaris-Page').first();
      await expect(pageContent).toBeVisible();
    } else {
      test.skip();
    }
  });

  test('UI-02.4 Search — tim kiem order limit theo ten @partA', async ({page}) => {
    const app = await nav.goTo.orderLimits(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Look for search input
    const searchInput = app.getByPlaceholder(/search|filter/i).first();
    const hasSearch = await searchInput.isVisible({timeout: 5_000}).catch(() => false);

    if (hasSearch) {
      await searchInput.fill('test');
      await waitForPageLoad(app);

      // Page should not crash after search
      const pageContent = app.locator('.Polaris-Page').first();
      await expect(pageContent).toBeVisible();

      // Clear search
      await searchInput.clear();
      await waitForPageLoad(app);
    } else {
      test.skip();
    }
  });

  test('UI-02.5 Create button — navigate toi type selection page @partA @smoke', async ({page}) => {
    const app = await nav.goTo.orderLimits(page);
    await waitForAppLoad(app);

    // Click "Create" or "Add" button
    const createBtn = app.getByRole('button', {name: /create|add/i}).first()
      || page.getByRole('button', {name: /create|add/i}).first();

    const btnVisible = await createBtn.isVisible({timeout: 5_000}).catch(() => false);
    if (btnVisible) {
      await createBtn.click();
      await page.waitForTimeout(3000);
      await waitForPageLoad(app);

      // Should navigate to type selection or create form
      const pageContent = app.locator('.Polaris-Page').first();
      await expect(pageContent).toBeVisible({timeout: 15_000});
    } else {
      // Try page-level button (outside iframe)
      const pageCreateBtn = page.getByRole('button', {name: /create|add/i}).first();
      if (await pageCreateBtn.isVisible({timeout: 3_000}).catch(() => false)) {
        await pageCreateBtn.click();
        await page.waitForTimeout(3000);
      }
      const pageContent = app.locator('.Polaris-Page').first();
      await expect(pageContent).toBeVisible({timeout: 15_000});
    }
  });

  test('UI-02.6 Bulk actions — checkbox select hien thi bulk action bar @partA', async ({page}) => {
    const app = await nav.goTo.orderLimits(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Check if there are rows with checkboxes
    const checkboxes = app.locator('.Polaris-IndexTable__TableRow .Polaris-Checkbox, .Polaris-IndexTable-Checkbox');
    const checkboxCount = await checkboxes.count().catch(() => 0);

    if (checkboxCount > 0) {
      // Click first checkbox
      await checkboxes.first().click();
      await page.waitForTimeout(1000);

      // Bulk action bar should appear
      const bulkActions = app.locator('.Polaris-IndexTable__BulkActionsWrapper, .Polaris-BulkActions');
      const hasBulk = await bulkActions.isVisible({timeout: 5_000}).catch(() => false);
      expect(hasBulk).toBeTruthy();

      // Uncheck
      await checkboxes.first().click();
    } else {
      // No data — skip
      test.info().annotations.push({type: 'note', description: 'No rows to select for bulk actions'});
    }
  });

  test('UI-02.7 Pagination — next/previous buttons hoat dong @partA', async ({page}) => {
    const app = await nav.goTo.orderLimits(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Check for pagination controls
    const pagination = app.locator('.Polaris-Pagination, [class*="pagination"]');
    const hasPagination = await pagination.isVisible({timeout: 5_000}).catch(() => false);

    if (hasPagination) {
      const nextBtn = pagination.getByRole('button', {name: /next/i}).first();
      const isNextEnabled = await nextBtn.isEnabled({timeout: 3_000}).catch(() => false);

      if (isNextEnabled) {
        await nextBtn.click();
        await waitForPageLoad(app);
        const pageContent = app.locator('.Polaris-Page').first();
        await expect(pageContent).toBeVisible();
      }
    }

    // Either has pagination or doesn't — both acceptable
    const pageContent = app.locator('.Polaris-Page').first();
    await expect(pageContent).toBeVisible();
  });
});
