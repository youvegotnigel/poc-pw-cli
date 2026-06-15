/**
 * Typed environment resolution. No secrets are committed; values come from the
 * environment (CI secrets, local .env that is gitignored).
 */
export interface AppEnv {
  baseURL: string;
  user: string;
  password: string;
}

export function resolveEnv(): AppEnv {
  const baseURL = process.env.BASE_URL ?? 'https://www.saucedemo.com';
  const user = process.env.APP_USER ?? 'standard_user';
  const password = process.env.APP_PASSWORD ?? 'secret_sauce';
  return { baseURL, user, password };
}
