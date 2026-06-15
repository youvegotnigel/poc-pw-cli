import { test as setup } from '@playwright/test';
import { mkdir } from 'fs/promises';
import { resolveEnv } from '../src/config/env';

const env = resolveEnv();

setup('authenticate', async ({ page }) => {
  await mkdir('auth', { recursive: true });
  await page.goto(env.baseURL);
  await page.locator('[data-test="username"]').fill(env.user);
  await page.locator('[data-test="password"]').fill(env.password);
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL('**/inventory.html');
  await page.context().storageState({ path: 'auth/storageState.json' });
});
