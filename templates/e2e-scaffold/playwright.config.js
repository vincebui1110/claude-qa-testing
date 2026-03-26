/**
 * Playwright Config — Multi-project (admin, storefront, e2e-flows)
 * Shared template for all Shopify apps
 */
import {defineConfig, devices} from '@playwright/test';
import dotenv from 'dotenv';
dotenv.config({path: '.env.test'});

export default defineConfig({
  testDir: './tests',
  timeout: 60_000,
  expect: {timeout: 10_000},
  fullyParallel: false,
  workers: 1,
  reporter: [
    ['html', {outputFolder: 'reports/html', open: 'never'}],
    ['json', {outputFile: 'reports/results.json'}],
    ['list'],
    ...(process.env.TRACKER_FILE ? [['./reporters/tracker-reporter.js']] : [])
  ],
  use: {
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    trace: 'retain-on-failure',
    actionTimeout: 15_000,
    headless: true
  },
  projects: [
    {
      name: 'admin',
      testDir: './tests/admin',
      use: {...devices['Desktop Chrome'], storageState: '.auth/admin.json'},
      dependencies: ['admin-auth']
    },
    {
      name: 'storefront',
      testDir: './tests/storefront',
      use: {...devices['Desktop Chrome']},
      dependencies: ['customer-auth']
    },
    {
      name: 'e2e-flows',
      testDir: './tests/e2e-flows',
      timeout: 180_000,
      use: {...devices['Desktop Chrome'], storageState: '.auth/admin.json'},
      dependencies: ['admin-auth']
    },
    {name: 'admin-auth', testDir: './fixtures', testMatch: /admin\.setup\.js/},
    {name: 'customer-auth', testDir: './fixtures', testMatch: /customer\.setup\.js/}
  ]
});
