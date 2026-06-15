import { chromium } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { resolveEnv } from '../config/env';

export default async function globalSetup(): Promise<void> {
  const env = resolveEnv();
  await mkdir('auth', { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(env.baseURL);
  await page.locator('[data-test="username"]').fill(env.user);
  await page.locator('[data-test="password"]').fill(env.password);
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL('**/inventory.html');
  await page.context().storageState({ path: 'auth/storageState.json' });
  await browser.close();
}
