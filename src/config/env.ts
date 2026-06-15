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
  const baseURL = process.env.BASE_URL ?? 'http://localhost:3000';
  const user = process.env.APP_USER ?? 'demo@shop.test';
  const password = process.env.APP_PASSWORD ?? 'Passw0rd!';
  return { baseURL, user, password };
}
