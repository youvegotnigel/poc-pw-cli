# Skill: Add Allure Reporting + GitHub Pages CI

Add Allure test reporting and automatic GitHub Pages deployment to an existing
Playwright + TypeScript project. Follow every step in order. Do not skip steps.
Do not add anything extra.

---

## STEP 1 — Install dependencies

```bash
npm install --save-dev allure-playwright allure-commandline
```

---

## STEP 2 — Add Allure reporter to playwright.config.ts

Find the `reporter` field inside `defineConfig`.

- If it is a string, replace it with an array.
- If it is already an array, append `['allure-playwright']` to it.
- Never remove existing reporters.

The final reporter line must include `allure-playwright`, for example:

```typescript
reporter: [['html', { open: 'never' }], ['allure-playwright']],
```

---

## STEP 3 — Add npm script to package.json

Add this entry to the `"scripts"` section. Do not remove existing scripts.

```json
"report": "allure generate allure-results --clean -o allure-report && allure open allure-report"
```

---

## STEP 4 — Update .gitignore

If these lines are not already present, add them:

```
allure-results/
allure-report/
```

---

## STEP 5 — Create the GitHub Actions workflow

Detect the repository's default branch:

```bash
git symbolic-ref refs/remotes/origin/HEAD 2>/dev/null | sed 's|refs/remotes/origin/||'
```

Use that branch name wherever `BRANCH_NAME` appears below.

Create or fully replace `.github/workflows/playwright.yml` with exactly this
content (substituting `BRANCH_NAME` in all four places):

```yaml
name: Playwright Tests
on:
  push:
    branches: [BRANCH_NAME]
  pull_request:
    branches: [BRANCH_NAME]

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npx playwright test
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 14
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: allure-results
          path: allure-results/
          retention-days: 14

  publish-report:
    needs: test
    if: always() && github.ref == 'refs/heads/BRANCH_NAME'
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
      contents: read
    environment:
      name: github-pages
      url: ${{ steps.deploy.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 24
          cache: npm
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          name: allure-results
          path: allure-results/
      - name: Fetch Allure history from gh-pages
        run: |
          git fetch origin gh-pages --depth=1 2>/dev/null || exit 0
          mkdir -p allure-results/history
          git archive FETCH_HEAD history/ 2>/dev/null | tar -x -C allure-results/ 2>/dev/null || true
      - name: Generate Allure report
        run: npx allure generate allure-results --clean -o allure-report
      - uses: actions/configure-pages@v5
      - uses: actions/upload-pages-artifact@v3
        with:
          path: allure-report/
      - name: Deploy to GitHub Pages
        id: deploy
        uses: actions/deploy-pages@v4
      - name: Add report link to job summary
        run: |
          echo "## Allure Report" >> $GITHUB_STEP_SUMMARY
          echo "[Open report](${{ steps.deploy.outputs.page_url }})" >> $GITHUB_STEP_SUMMARY
```

---

## STEP 6 — Verify

Run the following. It must succeed with zero errors.

```bash
npx tsc --noEmit
```

---

## STEP 7 — Commit and push

Stage only these files:

```bash
git add package.json package-lock.json playwright.config.ts .gitignore .github/workflows/playwright.yml
git commit -m "feat: add Allure reporting and GitHub Pages CI deployment"
git push
```

---

## STEP 8 — Tell the user this one manual step is required

> **One-time GitHub Settings change (cannot be automated):**
>
> 1. Go to the GitHub repository → **Settings → Pages**
> 2. Under **Build and deployment → Source**, select **GitHub Actions**
> 3. Click **Save**
>
> After the next push to `BRANCH_NAME`, the Allure report will be live at:
> `https://<github-username>.github.io/<repo-name>/`
>
> The Actions run summary will also show a clickable **[Open report]** link.

> **Note for IDEs:** A YAML linter may warn that `github-pages` is not a valid
> environment name before the first successful deployment. This is a false
> positive — GitHub creates that environment automatically on the first run.
