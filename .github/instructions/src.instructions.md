---
applyTo: "src/**/*.ts"
---

Rules for framework code (page objects, fixtures, config):

- Page objects extend `BasePage`; locators are `private readonly` fields;
  methods are single-purpose, take typed parameters (union types like
  `SortOption`, not bare strings), and never contain `expect()`.
- Setup repeated across specs belongs in a fixture
  (`src/fixtures/test-fixtures.ts`), not in another page-object method.
- Strict TypeScript: no `any`, no non-null `!` to silence the compiler. Prefer
  `unknown` for external data and narrow it.
- No secrets in `src/config/`; environment values resolve through
  `resolveEnv()` in `src/config/env.ts`.
- After editing any TypeScript file, run `npx eslint --fix <file>`; before
  declaring work done, run `npm run typecheck`.
