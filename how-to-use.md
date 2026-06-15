# How to Use Playwright CLI in a Large-Scale Automation Framework

> A practical guide to `@playwright/cli` (the `playwright-cli` command) — what it is,
> how it works, how it slots into this repo's authoring loop, and why we reach for it
> instead of the Playwright MCP server.
>
> Verified against **`@playwright/cli` v0.1.14** (latest as of 2026-06-15).

---

## 1. What it is (and what it is *not*)

There are **three** Playwright tools that get casually called "the Playwright CLI". Keep them straight:

| Tool | Package | Command | Purpose |
|------|---------|---------|---------|
| **Playwright Test** (the test runner) | `@playwright/test` | `npx playwright test` | Runs your `*.spec.ts` files in CI and locally |
| **Playwright CLI** ← *this guide* | `@playwright/cli` | `playwright-cli ...` | **Agent-driven live browser controller**, token-efficient, emits TS code |
| **Playwright MCP** | `@playwright/mcp` | `npx @playwright/mcp` | Model Context Protocol *server* giving MCP clients browser control |

`playwright-cli` is **not** a test runner. It is an interactive remote control for a real
browser, designed so a coding agent (Claude Code, Copilot, etc.) can *explore* a live app
one command at a time and get back paste-ready Playwright TypeScript.

Install / verify:

```bash
npx --no-install playwright-cli --version      # check a local install
npm install -g @playwright/cli@latest          # or install globally
```

---

## 2. The core mental model: snapshot → ref → act

This is the single idea that makes everything else obvious.

You **do not** write CSS selectors up front. Instead:

1. **Snapshot** — the CLI returns the page as an *accessibility tree*. Every interactive
   element gets a short, stable ref like `e14`.
2. **Act on a ref** — `click e14`, `fill e3 "..."`, etc.
3. The CLI returns a **fresh snapshot automatically** after every action, so you see the
   result and pick the next ref.

A snapshot looks like this (trimmed from the real run below):

```yaml
- navigation "Main" [ref=e4]:
  - link "Docs" [ref=e12]
  - link "CLI"  [ref=e14]          # ← we clicked this
  - button "Search (Meta+k)" [ref=e26]
- heading "Playwright enables reliable web automation..." [level=1] [ref=e35]
- link "Get started" [ref=e42]
```

Because you target by **role + accessible name**, the locators the tool generates are the
resilient, user-facing kind this repo mandates (`getByRole`, `getByTestId`) — never brittle
CSS/XPath. See [AGENTS.md](AGENTS.md) §5.

---

## 3. Walkthrough — exactly what we ran (live demo)

This is the real session that produced this guide, step by step.

### Step 1 — Open and navigate

```bash
playwright-cli open https://playwright.dev
```
Output (note it already emits TypeScript):
```js
await page.goto('https://playwright.dev');
```
Plus a saved snapshot file under `.playwright-cli/`.

### Step 2 — Read the snapshot

The snapshot listed every element with a ref. We could see the nav links
(`e12` Docs, `e14` CLI, `e15` API), the search button (`e26`), and the hero
"Get started" link (`e42`) — without writing a single selector.

### Step 3 — Act on a ref (the payoff)

```bash
playwright-cli click e14
```
Output:
```js
await page.getByRole('link', { name: 'CLI', exact: true }).click();
```
We clicked a *ref*, and the CLI handed back a clean, **role-based locator** — exactly what
you'd paste into a page object. It then re-snapshotted the new page
(`/agent-cli/introduction`) automatically.

### Step 4 — Extract data with `--raw`

```bash
playwright-cli --raw eval "JSON.stringify({title: document.title, h1: document.querySelector('h1')?.textContent})"
```
Output (value only — pipeable into `jq`, files, etc.):
```json
{"title":"Introduction | Playwright","h1":"Playwright CLI"}
```

### Step 5 — Clean up

```bash
playwright-cli close
```

### Housekeeping we did afterwards

The runs create a `.playwright-cli/` folder of snapshot artifacts. We added it to
[.gitignore](.gitignore) so those never get committed.

---

## 4. Command reference (grouped)

> Add `--raw` to any command to strip status/snapshot/code and return only the value.
> Add `--json` to wrap the whole reply as JSON. Use `-s=<name>` for named parallel sessions.

**Lifecycle**
```bash
playwright-cli open [url] [--browser=chrome|firefox|webkit|msedge] [--persistent]
playwright-cli attach --cdp=msedge          # drive an already-running browser
playwright-cli close            # close-all / kill-all for everything
playwright-cli list             # list active sessions
```

**Navigate**
```bash
playwright-cli goto <url>
playwright-cli go-back | go-forward | reload
```

**Inspect**
```bash
playwright-cli snapshot [--filename=x.yaml] [--depth=4] [--boxes] [selector|ref]
playwright-cli eval "document.title"
playwright-cli eval "el => el.getAttribute('data-testid')" e5
playwright-cli generate-locator e5 --raw    # get the locator without acting
```

**Interact**
```bash
playwright-cli click e3        # dblclick, hover
playwright-cli fill e5 "text" --submit
playwright-cli type "text" ; playwright-cli press Enter
playwright-cli select e9 "value" ; playwright-cli check e12 ; playwright-cli uncheck e12
playwright-cli drag e2 e8 ; playwright-cli upload ./file.pdf
```

**Auth / storage (the big win for frameworks)**
```bash
playwright-cli state-save auth.json     # capture cookies + localStorage once
playwright-cli state-load auth.json     # reuse the logged-in session
playwright-cli cookie-set session_id abc123 --httpOnly --secure
playwright-cli localstorage-set theme dark
```

**Network mocking**
```bash
playwright-cli route "**/*.jpg" --status=404
playwright-cli route "https://api.example.com/**" --body='{"mock": true}'
```

**DevTools / debugging artifacts**
```bash
playwright-cli console [warning] ; playwright-cli requests ; playwright-cli request 5
playwright-cli tracing-start ... tracing-stop
playwright-cli screenshot --filename=p.png ; playwright-cli pdf --filename=p.pdf
playwright-cli video-start demo.webm ... video-stop
```

---

## 5. Using it in a large-scale automation framework

`playwright-cli` is the **explore-the-live-app half** of this repo's
planner → generator → healer loop ([AGENTS.md](AGENTS.md) §8). It is not where tests *live* —
it is where verified *locators and flows* come from. The workflow at scale:

### a. Capture stable selectors before writing locators
Per [CLAUDE.md](CLAUDE.md): *never invent a selector you haven't verified against a snapshot.*
So the loop for every new interaction is:
```bash
playwright-cli open https://app.example.com/checkout
playwright-cli snapshot                 # find the ref for the element you need
playwright-cli generate-locator e17 --raw   # -> getByRole('button', { name: 'Pay now' })
```
Paste that locator into the **page object** — never into the spec ([AGENTS.md](AGENTS.md) §5).

### b. Feed the planner → generator → healer loop
- **Planner** drives `playwright-cli` to explore a feature and writes a Markdown plan to `specs/`.
- **Generator** turns the plan + captured locators into spec files and page objects.
- **Healer** uses `playwright-cli attach` to inspect a *paused* failing test and repair locators/waits.

### c. Reuse auth state instead of logging in per test
Capture the logged-in session once and hand it to the auth fixture's `storageState`:
```bash
playwright-cli open https://app.example.com/login
# ...drive the login...
playwright-cli state-save auth/storageState.json
```
This mirrors the repo's tribal knowledge (the `ASP.NET_SessionId` cookie is persisted via
`storageState`; do not re-login per test).

### d. Debug failing tests live
```bash
PLAYWRIGHT_HTML_OPEN=never npx playwright test --debug=cli   # prints a session name, e.g. tw-abcdef
playwright-cli attach tw-abcdef                              # step through the paused page
```
Every action you perform while attached prints the equivalent TS, so a healed locator can be
copied straight back into the test.

### e. Mock the network to make flaky externalities deterministic
Use `route` to force error states or stub third-party APIs that you can't control in CI,
instead of bumping retries (which [AGENTS.md](AGENTS.md) §5 forbids).

### f. Scriptable, CI-friendly
Because output pipes (`--raw`, `--json`), the CLI composes with `jq`, `diff`, npm scripts,
and CI steps — e.g. snapshot-diffing before/after a deploy:
```bash
playwright-cli --raw snapshot > before.yml
playwright-cli click e5
playwright-cli --raw snapshot > after.yml
diff before.yml after.yml
```

---

## 6. Why we prefer the CLI over the Playwright MCP server

Both the CLI and the MCP server expose the *same* accessibility-snapshot model of the page.
The difference is the **delivery mechanism**, and in a large codebase that difference is
decisive:

| Concern | Playwright **CLI** (skill-based) | Playwright **MCP** (server) |
|---------|----------------------------------|------------------------------|
| **Context / token cost** | A skill loads a short `SKILL.md` and only the command help you need. Minimal, on-demand context. | Every MCP tool schema is loaded into the model's context up front, on *every* request. |
| **Fit with a big codebase** | Purpose-built for agents already juggling a large repo — keeps browser tooling out of the way. | Tool definitions compete for the same context window the codebase needs. |
| **Composability** | Plain stdout → pipes into `jq`, `diff`, files, npm scripts, CI. | Structured tool calls; no shell piping. |
| **Generated code** | Every action prints paste-ready Playwright TS. | Returns structured results, not spec-ready code. |
| **Infrastructure** | Stateless commands against a CLI-managed browser session. No server to run. | Requires a running MCP server + a client connection. |
| **Portability** | Works in any terminal — CI, scripts, Copilot, Codex, Cursor, Claude Code. | Only usable from MCP-capable clients. |

**The headline reason:** the CLI is *token-efficient*. Playwright's own framing is that the
CLI is "token-efficient browser automation for coding agents... skill-based workflows without
large context overhead," whereas MCP is the "drop-in server... through standard tool calls."
When an agent is simultaneously reasoning over a large automation framework **and** driving a
browser, paying the full MCP tool-schema tax on every turn is wasteful. The CLI keeps the
browser surface small and loads detail only when a specific task needs it.

**When MCP is still the better choice:** non-coding-agent MCP clients (Claude Desktop, IDE
chat panels) that have no shell to call a CLI from, or when you want browser control exposed
uniformly to many MCP clients without installing a binary. For *this* repo — a coding-agent
authoring loop over a real TypeScript framework — the CLI wins.

---

## 7. Gotchas

- **Windows `&` in URLs:** `cmd.exe`/PowerShell treat `&` as a separator. Escape as `^&` in
  `cmd`, or prefix with `--%` in PowerShell:
  ```powershell
  playwright-cli --% goto "https://example.com/?a=1&b=2"
  ```
- **Snapshot artifacts:** runs write `.playwright-cli/*.yml`. Now git-ignored — don't commit them.
- **Refs are per-snapshot:** a ref like `e14` is valid for the *current* page state. After a
  navigation or major DOM change, re-snapshot to get fresh refs.
- **It's not the test runner:** use `npx playwright test` to actually run specs in CI. The CLI
  authors and debugs; the runner executes.

---

## 8. TL;DR

`playwright-cli` (v0.1.14) is an interactive, snapshot-driven browser remote control. You read
**refs** from an accessibility snapshot, **act** on them, and the tool hands back **resilient
`getByRole` locators as TypeScript**. In a large framework it's the verified-locator source for
the planner → generator → healer loop, plus a live debugger for failing tests. We prefer it
over MCP because it's token-efficient and shell-composable — it stays out of the way while the
agent reasons about a big codebase.
