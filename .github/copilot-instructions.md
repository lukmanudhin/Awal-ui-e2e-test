# Copilot Custom Instructions — Awal UI E2E Test Framework

This is a Playwright + TypeScript E2E framework using the **Page Object Model (POM)**
with fixture-based dependency injection. Always follow the conventions below when
generating, editing, or completing any code in this repo. Do NOT invent a different
structure, even if that is the more "common" Playwright pattern you have seen elsewhere.

## Project layout
- `pages/` — one class per page/feature, e.g. `loginPage.ts` -> `LoginPage`.
- `pages/basePage.ts` — `BasePage` holds locators/helpers shared across pages
  (search, tabs, file upload, date picker, scrolling, etc). Every page class
  extends `BasePage`.
- `fixtures/baseFixtures.ts` — registers every page object as a Playwright fixture.
  Any NEW page class must be added here too (import + type entry + fixture factory).
- `tests/UI/<feature>/<name>.spec.ts` — spec files, grouped by feature folder
  (e.g. `tests/UI/salesEnquiry/...`).
- `tests/API/` — API-only tests.
- `testData/` — typed data factories (e.g. `salesEnquiryData.ts` exports a
  `SalesEnquiryData` type and a `getCreateEnquiryData()` factory function).
- `API/` and `API-payloads/` — API helper classes and payload builders used for
  in-test API validation (UI action -> assert corresponding API response).
- `utils/ENV.ts` — environment values (`ENV.EMAIL_ID`, `ENV.BASE_URL`, etc). Never
  hardcode credentials or base URLs in a spec or page — use `ENV`.

## Page Object rules (`pages/*.ts`)
- Class name is PascalCase, file name is camelCase, e.g. `salesEnqueryPage.ts` ->
  `SalesEnquiryPage`.
- Class extends `BasePage`:
  ```ts
  export class LoginPage extends BasePage {
    private readonly email: Locator;
    constructor(public readonly page: Page) {
      super(page);
      this.email = this.page.getByRole('textbox', { name: 'Email ID' });
    }
  }
  ```
- Prefer `getByRole` / `getByText` locators. Fall back to XPath only when there is
  no accessible role (match the style already used in `basePage.ts`).
- Locators are declared as class fields and initialized in the constructor —
  never inline a `page.locator(...)` call directly inside a method body unless it
  is a genuinely one-off, throwaway locator.
- Dynamic/parameterized locators are typed as arrow-function fields, e.g.:
  ```ts
  public readonly createdSalesEnquiry: (name: string) => Locator;
  this.createdSalesEnquiry = (name: string) => this.page.getByText(`${name}`).first();
  ```
- Public methods are `async`, named as actions (`login`, `createSalesEnquiry`,
  `search`, `clickViewIcon`), and internally `await this.page.waitForLoadState('domcontentloaded')`
  after navigation-triggering actions.
- Page objects may contain their own assertions/API-validation helpers
  (e.g. `validateCreateSalesEnquiryAPI(statusCode, label)`) when the flow needs to
  cross-check a UI action against a backend call — follow the existing pattern in
  `salesEnqueryPage.ts` rather than putting that logic in the spec.
- Do not duplicate helpers that already exist on `BasePage`
  (`search`, `goToTab`, `uploadFile`, `selectDate`, `scrollUntilElementVisible`,
  etc). Reuse them instead of re-implementing.
- Avoid returning raw Locators from methods — expose them as fields instead so
  specs can assert on them directly.
- After adding a new page class, always update `fixtures/baseFixtures.ts`
  (type entry + fixture factory) in the same change — don't leave it disconnected
  from the fixture system.

## Spec file rules (`tests/**/*.spec.ts`)
- Import `test` from the relative path to `fixtures/baseFixtures` (never from
  `@playwright/test`). Import `expect` from `@playwright/test`.
- Place the file inside a feature subfolder under `tests/UI/<feature>/`,
  matching the naming style of existing folders (e.g. `salesEnquiry/`).
- Wrap the whole file in a single `test.describe('<Feature description>', () => {...})`.
- Structure:
  ```ts
  test.describe('<Feature description>', () => {
    let data: <TypedDataInterface>;
    test.setTimeout(100000);

    test.beforeEach('Login', async ({ page, loginPage, homePage, <featurePage> }) => {
      data = get<Feature>Data();
      test.step('Login', async () => {
        await loginPage.launchAwalWebsite();
        await loginPage.login(`${ENV.EMAIL_ID}`, `${ENV.PASSWORD}`);
        await expect(page, "Login failed").toHaveURL(`${ENV.BASE_URL}/home`);
        await homePage.goToMenuAndSubMenu("<Menu>", "<SubMenu>");
      });
    });

    test.afterEach('<Cleanup description>', async ({ <featurePage>, page }) => {
      // teardown / delete created data
      await page.close();
    });

    test('Verify <specific behavior>', async ({ <fixtures needed> }) => {
      // arrange -> act -> assert, using data from testData factory
    });
  });
  ```
- Test data must come from a typed factory function in `testData/`
  (e.g. `getCreateEnquiryData()` returning a typed interface) — never inline raw
  literal test data inside the spec body.
- Every `expect()` call includes a descriptive failure message as the second
  argument, e.g. `expect(x, "X did not match").toHaveText(...)`.
- Use `console.log` after key success steps (matches existing style), not for
  debugging noise.
- Only pull in the fixtures a test/hook actually needs as destructured params —
  don't request every page object fixture.
- Do not put raw Playwright actions (`page.click`, `page.fill`, `page.locator`)
  directly in a spec — those belong in the page object. A spec should read as a
  sequence of page-object method calls and assertions.

## API response validation rules

Every page object method that performs a **state-changing UI action** (an action
that triggers a backend call) must be paired with a corresponding
`validate<Action><Feature>API(...)` method that waits for the network response
and asserts its status code. This is a first-class pattern in this codebase —
not optional cleanup.

### When it's required
Add a `validate...API()` method for any action that falls into one of these
categories (with real examples already in the codebase):

| Action type            | Examples                                                            |
|-------------------------|----------------------------------------------------------------------------------------------|
| **Create**               | `validateCreateSalesEnquiryAPI`, `validateAddBOQAPI`, `validateAddBOM_API`, `validatePPJOAPI`, `validateCreateSummaryAPI` |
| **Update / Edit**        | `validateEditBOQAPI`, `validateLabourAndCostingAPI`, `validateConsumablesAPI`                |
| **Delete**               | `validateDeleteSalesEnquiryAPI`, `validateDeleteBOQAPI`                                      |
| **Submit / Submit for approval** | `validateSubmitCheckListAPI`, Submit Quotation for approval (`ppjoPage.ts`), Submit to Sales (`requestApprovalPage.ts`) |
| **Approve**              | Approve sales order / Approve sales order check list (`salesOrderManagerPage.ts`), Approve Cost Estimation (`requestApprovalPage.ts`), `validateQuotationApprovalAPI` |
| **Reject**               | Reject sales order / Reject sales order check list (`salesOrderManagerPage.ts`), Reject Cost Estimation (`requestApprovalPage.ts`), Manager Rejection (`quotationManagerPage.ts`) |
| **View / fetch on navigation** | `validateViewSalesEnquiryAPI`, View Cost Estimation (`requestApprovalPage.ts`), `validateViewAdvanceInvoiceAPI` |
| **File upload / acknowledgement** | `validateAcknowledgementAPI`                                                          |
| **Send / dispatch actions** | Send to customer, Send advance invoice, Send sales order for approval               |

Rule of thumb: **if the UI action results in a network call whose success/failure
matters to the test outcome, it needs a `validate...API` method.** Purely
cosmetic UI actions (opening a dropdown, expanding a row, toggling a filter with
no backend call) do not need one.

### Naming convention
`validate<Action><Feature>API(statusCode: number, ...extraArgs)` — PascalCase
feature/action name, always ends in `API`, lives on the page object that owns
the triggering UI element (never in the spec file).

### Standard pattern (single endpoint)
Default shape unless one of the variants below applies:
```ts
async validate<Action><Feature>API(statusCode: number) {
    const responsePromise = this.page.waitForResponse('**/<api-path-segment>');
    await this.<triggeringElement>.click();
    const response = await responsePromise;
    expect(response.status(), `<Feature> API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    console.log('Verified <Feature> API with status code:', response.status());
}
```
Rules baked into this pattern:
1. **Register `waitForResponse` BEFORE clicking** — never click first and then
   await the response, or the response can be missed in a race.
2. Use a glob URL pattern (`**/segment`) matching the actual endpoint path, not
   a full URL.
3. Always assert with a descriptive `expect(..., "<message>")` — mandatory, per
   the spec-file `expect` rules above.
4. Always `console.log` the verified status code after the assertion.

### Variant: conditional trigger element
When the same action can be triggered by one of two different buttons
depending on UI state, branch inside the method but keep the
`waitForResponse` registration and assertion identical — see
`ppjoPage.validatePPJOAPI`:
```ts
async validate<Action>API(statusCode: number, requestType: string) {
    const responsePromise = this.page.waitForResponse('**/<api-path-segment>');
    if (await this.<conditionalButtonA>.isVisible()) {
        await this.<conditionalButtonA>.click();
    } else {
        await this.<conditionalButtonB>.click();
    }
    await this.page.waitForLoadState('domcontentloaded');
    const response = await responsePromise;
    expect(response.status(), `${requestType} API failed with status code. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    console.log(`${requestType} API Verified with status code:`, response.status());
}
```
Pass a `requestType`/label string as a parameter so the same method can be
reused across call sites with different log/assertion labels — don't duplicate
the method per call site.

### Variant: multiple possible endpoints (race)
When the same UI action can hit one of several different endpoints depending
on form state, use `Promise.race` — see
`costEstimationPage.validateCreateCostDistributionAPI`:
```ts
async validate<Action>API(statusCode: number) {
    const responsePromise = Promise.race([
        this.page.waitForResponse('**/<endpoint-a>'),
        this.page.waitForResponse('**/<endpoint-b>'),
    ]);
    await this.<triggeringElement>.click();
    const response = await responsePromise;
    expect(response.status(), `<Feature> API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    console.log('Verified <Feature> API with status code:', response.status());
}
```

### Variant: shared private helper for near-identical validations
When several product/entity types submit to different endpoints but share the
exact same click → wait → assert logic, extract a `private async` helper and
expose one thin public method per variant — see `productsPage.ts`
(`validateProductAPIAndPopup` + `validateCreateSignageAPI`,
`validateCreateAtmProductAPI`, etc.). Keep the helper scoped to the API
assertion only — do **not** bake the success-popup assertion into it (see
"Success message assertions belong in the spec" below):
```ts
private async validate<Category>API(endpoint: string, statusCode: number, apiName: string) {
    const responsePromise = this.page.waitForResponse(`**/<basePath>/${endpoint}`);
    if (await this.saveButton.isVisible()) {
        await this.saveButton.click();
    } else {
        await this.page.getByRole('button', { name: 'Submit' }).click();
    }
    const response = await responsePromise;
    expect(response.status(), `${apiName} API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    console.log(`Verified ${apiName} API with status code:`, response.status());
}

async validateCreate<Variant>API(statusCode: number) {
    await this.validate<Category>API('<endpoint>', statusCode, '<Variant label>');
}
```
Use this variant instead of copy-pasting the full block when you have 3+
near-identical validations differing only by endpoint path / label.

### Success message assertions belong in the spec, not the page-object validation method
`validate...API` methods assert the network status code only. Any success
toast/popup message check (`successMessage`, `successMessage1`,
`successMessage('...')` from `BasePage`) is asserted separately in the spec
file, right after the `validate...API` call — this is the dominant pattern in
the codebase, e.g. `createSalesEnquiry.spec.ts`:
```ts
await salesEnquiryPage.validateCreateSalesEnquiryAPI(201, "Create Enquiry");
await expect(productsPage.successMessage('Sales enquiry upserted successfully'), "Sales enquiry success message does not match").toHaveText('Sales enquiry upserted successfully');
```
Do not fold the popup assertion into the page-object method, even when
extracting a shared private helper (see variant above) — this keeps the
`validate...API` method reusable for scenarios where the same action doesn't
show a popup (e.g. re-runs, negative tests) without needing a nullable
`successMessage` parameter.

### Calling these from specs
- Call the `validate...API` method **immediately after** the action that
  triggers it, in the same test step — not batched at the end of the test.
- Always pass the expected status code explicitly per test scenario (e.g. `201`
  for create, `200` for update/delete/view) — don't hardcode the status inside
  the page object.
- Never assert API status codes directly in spec files with raw
  `page.waitForResponse` calls — always go through the page object's
  `validate...API` method, so the endpoint path and assertion message stay
  defined in one place.
- Assert the corresponding success/error message in the spec immediately after
  the `validate...API` call, per the rule above.

### Pure API tests (`API/*.ts`)
For request-level tests that don't go through the UI (see
`API/salesEnquiryAPI.ts`), the same principle applies via `APIRequestContext`:
```ts
const response = await this.request.post('<endpoint>', { data: payload });
expect(response.status(), `Failed to <action> through API, status code: ${response.status()}`).toBe(<expectedCode>);
```
Every request method in `API/*.ts` must assert its status code with a
descriptive message before returning the response.

## General
- TypeScript, 2-space indent, single quotes for locator strings, double quotes
  for narrative/user-facing strings — match the file you are editing if it differs.
- Never introduce a new test runner pattern (e.g. `test.only`, arbitrary
  `page.waitForTimeout` chains) unless the existing file already does so for a
  documented reason.
- When generating a new flow from a Playwright MCP recording or `codegen`
  output, ALWAYS refactor the raw recorded actions into: (1) a page object
  method using the locator/method conventions above, (2) a matching
  `validate...API` method per the rules above, and (3) a spec file using the
  structure above. Never leave raw `page.click()` / `page.fill()` calls
  directly inside a spec file.