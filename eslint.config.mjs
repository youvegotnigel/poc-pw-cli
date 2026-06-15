import tseslint from 'typescript-eslint';
import playwright from 'eslint-plugin-playwright';

export default tseslint.config(...tseslint.configs.recommended, {
  files: ['**/*.ts'],
  plugins: { playwright },
  rules: {
    ...playwright.configs['flat/recommended'].rules,
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/no-non-null-assertion': 'error',
    'playwright/no-wait-for-timeout': 'error',
    'playwright/prefer-web-first-assertions': 'error',
  },
});
