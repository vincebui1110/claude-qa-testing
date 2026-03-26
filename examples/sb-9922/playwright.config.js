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
      testDir: './tests',
      use: {...devices['Desktop Chrome'], storageState: '.auth/admin.json'},
      dependencies: ['admin-auth']
    },
    {
      name: 'admin-auth',
      testDir: './fixtures',
      testMatch: /admin\.setup\.js/
    }
  ]
});
