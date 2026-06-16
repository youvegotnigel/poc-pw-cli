import { defineConfig, devices } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { resolveEnv } from './src/config/env';

const env = resolveEnv();

function getPwVersion(): string {
  try {
    return (JSON.parse(readFileSync('node_modules/@playwright/test/package.json', 'utf8')) as { version: string })
      .version;
  } catch {
    return 'unknown';
  }
}

function browserVersion(ua: string | undefined, re: RegExp): string {
  return ua?.match(re)?.[1] ?? 'unknown';
}

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    [
      'allure-playwright',
      {
        environmentInfo: {
          'Base URL': env.baseURL,
          'Node.js': process.version,
          Platform: process.platform,
          Playwright: getPwVersion(),
          Chromium: browserVersion(devices['Desktop Chrome'].userAgent, /Chrome\/([\d.]+)/),
          Firefox: browserVersion(devices['Desktop Firefox'].userAgent, /Firefox\/([\d.]+)/),
          WebKit: browserVersion(devices['Desktop Safari'].userAgent, /Version\/([\d.]+)/),
          ...(process.env.GITHUB_REF_NAME ? { Branch: process.env.GITHUB_REF_NAME } : {}),
          ...(process.env.GITHUB_SHA ? { Commit: process.env.GITHUB_SHA.slice(0, 8) } : {}),
        },
      },
    ],
  ],
  use: {
    baseURL: env.baseURL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    { name: 'setup', testMatch: /auth\.setup\.ts/ },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], storageState: 'auth/storageState.json' },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'], storageState: 'auth/storageState.json' },
      dependencies: ['setup'],
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'], storageState: 'auth/storageState.json' },
      dependencies: ['setup'],
    },
  ],
});
