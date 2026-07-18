# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Playwright + TypeScript E2E test suite for the "Awal" web application, covering the Sales and
Procurement modules (sales enquiries, quotations, PPJO, cost estimation, credit control, sales
returns, material indent/PR/GRN, manufacturing, trading, pipeline, etc). Built as a Page Object
Model (POM) framework with fixture-based dependency injection.

**`.github/copilot-instructions.md` is the authoritative, detailed style guide for this repo** —
page object conventions, spec structure, and (critically) the API-response-validation pattern are
all defined there in depth. Read it before writing or editing page objects/specs; this file only
summarizes the parts needed to navigate and run things. `testcontexts/test-context.md` is an older
draft of similar guidance and is out of date in places (e.g. it says page objects don't extend a
base class — they do, via `BasePage`); prefer `copilot-instructions.md` and the actual code when
they disagree.

## Commands

Environment is selected via `ENV` (defaults to `qa`), loading `.env.<ENV>` (e.g. `.env.qa`,
providing `BASE_URL`, `EMAIL_ID`, `PASSWORD`, `BASE_URL_API`). Never hardcode these values in
tests/pages — read them from `utils/ENV.ts`.

```bash
# Run the full suite (headless), then generate + open Allure report
npm test

# Headed run
npm run test:headed

# Interactive UI mode / debug mode
npm run test:ui
npm run test:debug

# Run a single spec file directly with Playwright (bypasses the allure npm scripts)
npx playwright test tests/UI/sales/createSalesEnquiry.spec.ts

# Run a single test by title
npx playwright test tests/UI/sales/createSalesEnquiry.spec.ts -g "Verify new sales enquiry is created successfully"

# Feature-scoped suites (sales module also runs its paired API test)
npm run test:sales
npm run test:procurement

# Generate/view the Allure report from existing results
npm run report

# Clean generated report/result directories
npm run clean
```

There is no lint/typecheck npm script; `tsc` types are enforced implicitly by Playwright's runner
and editor tooling.

CI (`.gitlab-ci.yml` and `.github/workflows/pipeline.yml`) runs `npx playwright test` against the
`mcr.microsoft.com/playwright` image and publishes the Allure/Playwright HTML reports as artifacts.

## Architecture

**Page Object Model with fixture injection**, single browser project (`chromium` only —
firefox/webkit/mobile are commented out in `playwright.config.ts`).

- `pages/basePage.ts` — `BasePage` class holding locators/helpers shared by *every* page (search
  with polling, tab navigation, date-picker handling, file upload, scroll-into-view, dropdown
  select, edit/view icon clicks). Every page object extends `BasePage`. Also defines the `@step()`
  method decorator (wraps a method body in `test.step(...)` using the class/method name) — used on
  most page-object action methods for readable trace/report output.
- `pages/*.ts` — one class per feature/page (`SalesEnquiryPage`, `PPJOPage`, `CostEstimationPage`,
  `CreditControlPage`, `ProcurementPage`, etc). Locators are class fields set in the constructor
  (static or, for parameterized locators, as `(arg: string) => Locator` arrow fields) — methods
  never build a fresh `page.locator(...)` inline except for genuine one-offs. Prefer
  `getByRole`/`getByText`; fall back to XPath only when there's no accessible role.
- `fixtures/baseFixtures.ts` — registers every page object (and every `API/*.ts` client) as a named
  Playwright fixture on a `test` extended from `@playwright/test`. **Any new page class must be
  added here** (import, type entry in `baseFixtures`, and a fixture factory `async ({ page }, use)
  => use(new XPage(page))`). Specs must import `test`/`expect` from this file, never directly from
  `@playwright/test`.
- `API/*.ts` + `API-payloads/*.ts` — `APIRequestContext`-based clients (e.g. `SalesEnquiryAPI`,
  `StockViewAPI`) with typed payload builders, used both for pure API tests (`tests/API/`) and for
  UI-action-triggers-API validation inside page objects.
- `testData/*.ts` — typed data factories (e.g. `salesEnquiryData.ts` exports a data interface plus
  a `getCreateEnquiryData()` factory using `@faker-js/faker` / `utils/randomDataGenerator.ts`).
  Specs never inline literal test data — they call a factory.
- `tests/UI/<feature>/*.spec.ts` and `tests/API/*.spec.ts` — spec files grouped by feature folder
  (`sales/`, `procurements/`). Each file is a single `test.describe`, with a `beforeEach` that logs
  in via `loginPage`/`homePage` and navigates to the feature module, and typically an `afterEach`
  that deletes/cleans up whatever the test created.

### The API-validation pattern (important, and easy to get wrong)

Any page-object method that performs a state-changing UI action (create/update/delete/submit/
approve/reject/send/upload) must have a paired `validate<Action><Feature>API(statusCode, ...)`
method on the *same page object* that:
1. Calls `this.page.waitForResponse(...)` **before** clicking the triggering element (never click
   first — that risks missing the response in the race).
2. Asserts `response.status()` against the expected code with a descriptive `expect(..., "message")`.
3. `console.log`s the verified status code.
4. Does **not** assert the success toast/message itself — that assertion belongs in the spec, right
   after the `validate...API()` call.

Specs never call `page.waitForResponse` directly — always go through the page object's
`validate...API` method. See `.github/copilot-instructions.md` for the conditional-trigger,
`Promise.race` multi-endpoint, and shared-private-helper variants of this pattern, plus concrete
examples (`salesEnqueryPage.ts`, `ppjoPage.ts`, `costEstimationPage.ts`, `productsPage.ts`).

### Other conventions worth knowing

- Every `expect()` includes a descriptive failure message as the second argument.
- `test.setTimeout(100000)` is set per-describe in most feature spec files (flows involve multiple
  navigations/uploads).
- `console.log` is used deliberately after key successful steps (not stripped as debug noise).
- Reporting is Allure (`allure-results` → `allure-report`), configured via the `allure-playwright`
  reporter in `playwright.config.ts` alongside the `line` reporter.
- `.agents/mcp_config.json` and `.github/agents/*.agent.md` define Playwright MCP-based
  test-generator/planner/healer agents (for GitHub Copilot's agent mode) — if generating a spec
  from a Playwright MCP recording/codegen output, refactor the raw actions into page-object
  methods + a `validate...API` method + a spec, per the pattern above; never leave raw
  `page.click()`/`page.fill()` calls in a spec file.
