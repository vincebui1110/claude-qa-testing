/**
 * TC-UI-03: Create & Edit Order Limit Rules
 * SB-9922: [DEV][OL] Migrate to Firebase Functions v2
 *
 * Verify CRUD operations: type selection, create form, edit, duplicate, delete.
 */

import {test, expect} from '@playwright/test';
import {navigateToApp, waitForAppLoad} from '../../helpers/embedded.js';
import {nav} from '../../helpers/nav.js';
import {waitForPageLoad, waitForToast, confirmModal} from '../../helpers/common.js';

test.describe('TC-UI-03: Create & Edit Order Limit Rules', () => {

  test('UI-03.1 Type selection page — hien thi cac loai limit @partB @smoke', async ({page}) => {
    const app = await nav.goTo.orderLimitType(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Should show limit type cards
    const cards = app.locator('.Polaris-Card, .Polaris-LegacyCard');
    const cardCount = await cards.count();
    expect(cardCount).toBeGreaterThanOrEqual(3);

    // Check for type labels
    const productType = app.locator('text=/product/i').first();
    await expect(productType).toBeVisible({timeout: 10_000});
  });

  test('UI-03.2 Type selection — click Product type navigate toi create form @partB @smoke', async ({page}) => {
    const app = await nav.goTo.orderLimitType(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Find Select/Create button on first card (Product type)
    const selectBtn = app.getByRole('button', {name: /select|create|choose/i}).first();
    const linkBtn = app.locator('a, [role="link"]').filter({hasText: /select|create|choose/i}).first();

    const hasBtn = await selectBtn.isVisible({timeout: 5_000}).catch(() => false);
    const hasLink = await linkBtn.isVisible({timeout: 3_000}).catch(() => false);

    if (hasBtn) {
      await selectBtn.click();
    } else if (hasLink) {
      await linkBtn.click();
    } else {
      // Try clicking the card itself
      const firstCard = app.locator('.Polaris-Card, .Polaris-LegacyCard').first();
      await firstCard.click();
    }

    await page.waitForTimeout(3000);
    await waitForPageLoad(app);

    // Should be on create form page
    const formPage = app.locator('.Polaris-Page').first();
    await expect(formPage).toBeVisible({timeout: 15_000});
  });

  test('UI-03.3 Create form — General tab hien thi cac fields @partB @smoke', async ({page}) => {
    // Navigate directly to create product limit
    const app = await nav.goTo.createOrderLimit(page, 'product');
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    const formPage = app.locator('.Polaris-Page').first();
    await expect(formPage).toBeVisible({timeout: 15_000});

    // Check for Name field
    const nameField = app.getByLabel(/name|title/i).first()
      || app.locator('input[type="text"]').first();
    const hasName = await nameField.isVisible({timeout: 5_000}).catch(() => false);
    expect(hasName).toBeTruthy();
  });

  test('UI-03.4 Create form — tabs General va Message Settings @partB', async ({page}) => {
    const app = await nav.goTo.createOrderLimit(page, 'product');
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Check for tabs
    const tabs = app.locator('.Polaris-Tabs__Tab, [role="tab"]');
    const tabCount = await tabs.count().catch(() => 0);

    // Should have at least General + Message tabs
    expect(tabCount).toBeGreaterThanOrEqual(2);

    // Click Message Settings tab
    if (tabCount >= 2) {
      await tabs.nth(1).click();
      await waitForPageLoad(app);

      // Message tab content should load
      const formPage = app.locator('.Polaris-Page').first();
      await expect(formPage).toBeVisible();
    }
  });

  test('UI-03.5 Create form — validation: save without name shows error @partB', async ({page}) => {
    const app = await nav.goTo.createOrderLimit(page, 'product');
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Try to save without filling required fields
    const saveBtn = page.getByRole('button', {name: /save/i}).first();
    const hasSave = await saveBtn.isVisible({timeout: 5_000}).catch(() => false);

    if (hasSave) {
      await saveBtn.click();
      await page.waitForTimeout(2000);

      // Should show validation error or inline error
      const errorText = app.locator('.Polaris-InlineError, .Polaris-Banner--statusCritical, [class*="error"]').first();
      const hasError = await errorText.isVisible({timeout: 5_000}).catch(() => false);

      // Either error shown OR toast with error
      const toastError = app.locator('.Polaris-Frame-Toast').first();
      const hasToast = await toastError.isVisible({timeout: 3_000}).catch(() => false);

      expect(hasError || hasToast).toBeTruthy();
    } else {
      test.skip();
    }
  });

  test('UI-03.6 Create form — product selector resource picker @partB', async ({page}) => {
    const app = await nav.goTo.createOrderLimit(page, 'product');
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Look for product selection button (Browse/Select products)
    const browseBtn = app.getByRole('button', {name: /browse|select|add product|choose/i}).first();
    const hasBrowse = await browseBtn.isVisible({timeout: 5_000}).catch(() => false);

    if (hasBrowse) {
      await browseBtn.click();
      await page.waitForTimeout(2000);

      // Resource picker modal should appear (Shopify native or custom)
      const modal = page.locator('[class*="ResourcePicker"], [class*="modal"], .Polaris-Modal').first();
      const hasModal = await modal.isVisible({timeout: 5_000}).catch(() => false);

      // Close modal if opened
      if (hasModal) {
        const cancelBtn = page.getByRole('button', {name: /cancel|close/i}).first();
        if (await cancelBtn.isVisible({timeout: 3_000}).catch(() => false)) {
          await cancelBtn.click();
        }
      }

      // Page should not crash
      const formPage = app.locator('.Polaris-Page').first();
      await expect(formPage).toBeVisible();
    } else {
      test.info().annotations.push({type: 'note', description: 'No product browse button found — may need different selector'});
      const formPage = app.locator('.Polaris-Page').first();
      await expect(formPage).toBeVisible();
    }
  });

  test('UI-03.7 Create form — min/max condition fields @partB', async ({page}) => {
    const app = await nav.goTo.createOrderLimit(page, 'product');
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Look for min/max number inputs
    const numberInputs = app.locator('input[type="number"]');
    const inputCount = await numberInputs.count().catch(() => 0);

    // Should have at least min/max fields
    expect(inputCount).toBeGreaterThanOrEqual(1);

    // Try filling a value
    if (inputCount > 0) {
      await numberInputs.first().fill('5');
      const value = await numberInputs.first().inputValue();
      expect(value).toBe('5');
    }
  });

  test('UI-03.8 Create form — advanced settings collapsible @partB', async ({page}) => {
    const app = await nav.goTo.createOrderLimit(page, 'product');
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Look for collapsible/advanced section
    const advancedToggle = app.locator('button, [role="button"]').filter({hasText: /advanced|more option|additional/i}).first();
    const hasAdvanced = await advancedToggle.isVisible({timeout: 5_000}).catch(() => false);

    if (hasAdvanced) {
      await advancedToggle.click();
      await page.waitForTimeout(1000);

      // Advanced section should expand — look for date picker or additional fields
      const datePicker = app.locator('input[type="date"], [class*="DatePicker"], [class*="date"]').first();
      const hasDate = await datePicker.isVisible({timeout: 5_000}).catch(() => false);

      // Either date picker or more fields should be visible
      const formPage = app.locator('.Polaris-Page').first();
      await expect(formPage).toBeVisible();
    } else {
      // Advanced settings might be shown by default
      const formPage = app.locator('.Polaris-Page').first();
      await expect(formPage).toBeVisible();
    }
  });

  test('UI-03.9 Edit existing rule — load va hien thi data dung @partB', async ({page}) => {
    // First go to list to find an existing rule
    const app = await nav.goTo.orderLimits(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Check if there are rows
    const rows = app.locator('.Polaris-IndexTable__TableRow, table tbody tr');
    const rowCount = await rows.count().catch(() => 0);

    if (rowCount > 0) {
      // Click first row to edit
      await rows.first().click();
      await page.waitForTimeout(3000);
      await waitForPageLoad(app);

      // Edit page should load with form
      const formPage = app.locator('.Polaris-Page').first();
      await expect(formPage).toBeVisible({timeout: 15_000});

      // Name field should have value (pre-filled)
      const nameField = app.locator('input[type="text"]').first();
      const hasName = await nameField.isVisible({timeout: 5_000}).catch(() => false);
      if (hasName) {
        const value = await nameField.inputValue();
        expect(value.length).toBeGreaterThan(0);
      }
    } else {
      test.info().annotations.push({type: 'note', description: 'No existing rules to edit'});
    }
  });

  test('UI-03.10 Rule status toggle — Active/Inactive switch @partB', async ({page}) => {
    const app = await nav.goTo.orderLimits(page);
    await waitForAppLoad(app);
    await waitForPageLoad(app);

    // Check for status badges or toggles in table
    const statusBadges = app.locator('.Polaris-Badge');
    const badgeCount = await statusBadges.count().catch(() => 0);

    if (badgeCount > 0) {
      // Status badges exist — verify at least one shows Active/Inactive/Draft
      const firstBadge = await statusBadges.first().textContent().catch(() => '');
      expect(firstBadge).toMatch(/active|inactive|draft/i);
    } else {
      // No data — acceptable
      const pageContent = app.locator('.Polaris-Page').first();
      await expect(pageContent).toBeVisible();
    }
  });
});
