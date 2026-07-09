# Playwright Test Context - Page Object Model (POM) Standards
## Awal UI E2E Test Project

## Overview
This document defines the standards, structure, and rules for generating Playwright tests using the Page Object Model pattern for the Awal UI project. All generated tests MUST follow these guidelines strictly.

## Directory Structure

```
Awal-ui-e2e-test/
├── pages/                         # Page Object classes
│   ├── loginPage.ts              # Login page object
│   ├── homePage.ts               # Home/Dashboard page object
│   ├── modules.ts                # Modules navigation component
│   ├── salesEnqueryPage.ts       # Sales enquiry page object
│   └── [feature]Page.ts          # Feature-specific page objects (camelCase)
├── fixtures/                      # Test fixtures and custom hooks
│   └── baseFixtures.ts           # Custom Playwright fixtures with page objects
├── tests/                         # Test specifications
│   ├── loginTest.spec.ts         # Login feature tests
│   ├── salesEnquiryTest.spec.ts  # Sales enquiry feature tests
│   ├── seed.spec.ts              # Seed/setup test for test data
│   └── [feature]Test.spec.ts     # Feature-specific tests (camelCase with Test suffix)
├── testData/                      # Test data management
│   ├── modules.ts                # Module test data
│   └── salesEnquiryData.ts       # Sales enquiry test data
├── utils/                         # Helper utilities
│   ├── ENV.ts                    # Environment configuration
│   └── [helpers].ts              # Common helper functions
├── playwright-report/             # Generated test reports
├── test-results/                 # Test results and artifacts
├── testcontexts/                 # Documentation and test contexts
│   └── test-context.md           # This file
├── playwright.config.ts          # Playwright configuration
└── package.json                  # Project dependencies
```

## Page Object Model Standards

### 1. Page Object Class Structure

The project uses a direct approach without a separate base class. Each page object is independent and extends Playwright's Page directly.

**Common Pattern Example:**

```typescript
// pages/[pageName]Page.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  private readonly email: Locator;
  private readonly password: Locator;
  private readonly signInButton: Locator;

  constructor(public readonly page: Page) {
    this.email = this.page.getByRole('textbox', { name: 'Email ID' });
    this.password = this.page.getByRole('textbox', { name: 'Password' });
    this.signInButton = this.page.getByRole('button', { name: 'Sign In' });
  }

  /**
   * Navigate to the login page
   */
  async navigateToLoginPage(): Promise<void> {
    await this.page.goto(`${process.env.BASE_URL}`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Perform login with credentials
   * @param emailId - User's email ID
   * @param password - User's password
   */
  async login(emailId: string, password: string): Promise<void> {
    await this.email.fill(emailId);
    await this.password.fill(password);
    await this.signInButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }
}
```

### 2. Page Object Class Rules

#### MUST FOLLOW:
1. **File Naming** - Use camelCase with PascalCase class name: `loginPage.ts`, `homePage.ts`, `salesEnqueryPage.ts`
2. **One class per page** - Each page object represents a single page or major component
3. **Public readonly page property** - Page instance should be `public readonly`
4. **Locators as private properties** - Define all locators as private readonly properties (prefix with private)
5. **Public methods for actions** - All user interactions should be public async methods
6. **Return types** - Always specify return types for methods (e.g., `Promise<void>`, `Promise<string>`)
7. **JSDoc comments** - Document all public methods with purpose and parameters
8. **No test assertions in page objects** - Keep all assertions in test files only
9. **Single Responsibility** - Each method should do one thing
10. **Proper wait states** - Use `page.waitForLoadState('domcontentloaded')` or `'networkidle'` as appropriate

#### Page Object Template:

```typescript
// pages/examplePage.ts
import { Page, Locator } from '@playwright/test';

export class ExamplePage {
  // Private locators - not exposed directly
  private readonly navigationMenu: Locator;
  private readonly searchButton: Locator;
  private readonly filterOption: (optionName: string) => Locator;

  constructor(public readonly page: Page) {
    // Initialize all locators here
    this.navigationMenu = this.page.getByRole('navigation');
    this.searchButton = this.page.getByRole('button', { name: /search/i });
    this.filterOption = (optionName: string) => 
      this.page.getByRole('option', { name: optionName });
  }

  /**
   * Navigate to the page
   */
  async navigateTo(): Promise<void> {
    await this.page.goto(`${process.env.BASE_URL}/example`);
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Perform a search with given query
   * @param query - Search query string
   */
  async search(query: string): Promise<void> {
    await this.searchButton.click();
    await this.page.keyboard.type(query);
    await this.page.keyboard.press('Enter');
    await this.page.waitForLoadState('domcontentloaded');
  }

  /**
   * Select a filter option
   * @param optionName - Name of the filter option to select
   */
  async selectFilter(optionName: string): Promise<void> {
    const option = this.filterOption(optionName);
    await option.click();
  }

  /**
   * Get text content from an element
   * @returns Text content of the element
   */
  async getMenuText(): Promise<string | null> {
    return await this.navigationMenu.textContent();
  }
}
```

### 3. Locator Strategy Priority

Use locators in this order of preference:

1. **User-facing attributes (BEST)**:
   - `page.getByRole('button', { name: 'Submit' })`
   - `page.getByLabel('Email address')`
   - `page.getByPlaceholder('Enter email')`
   - `page.getByText('Welcome')`

2. **Test IDs (GOOD)**:
   - `page.locator('[data-testid="submit-button"]')`
   - `page.getByTestId('submit-button')`

3. **CSS Selectors (USE SPARINGLY)**:
   - `page.locator('#submit-btn')`
   - `page.locator('.btn-primary')`

4. **XPath (AVOID)**:
   - Only use when absolutely necessary

### 4. Test File Structure

```typescript
// tests/exampleTest.spec.ts
import { expect } from "@playwright/test";
import { test } from "../fixtures/baseFixtures";
import { ExamplePage } from "../pages/examplePage";
import { ENV } from "../utils/ENV";

test.describe('Example Feature', () => {
  let examplePage: ExamplePage;

  test.beforeEach(async ({ page }) => {
    examplePage = new ExamplePage(page);
    await examplePage.navigateTo();
  });

  test('should display page title correctly', async ({ page }) => {
    // Arrange
    const expectedTitle = 'Example Page';

    // Act & Assert
    const pageTitle = await page.title();
    expect(pageTitle).toContain(expectedTitle);
  });

  test('should perform search and display results', async ({ page }) => {
    // Arrange
    const searchQuery = 'test query';

    // Act
    await examplePage.search(searchQuery);

    // Assert
    await expect(page).toHaveURL(/.*search/);
  });
});
```

**Alternatively, using custom fixtures for cleaner code:**

```typescript
// tests/loginTest.spec.ts (using custom fixtures from baseFixtures)
import { expect } from "@playwright/test";
import { test } from "../fixtures/baseFixtures";
import { ENV } from "../utils/ENV";

test('valid login should navigate to dashboard', async ({ loginPage, page, homePage }) => {
  // Act
  await loginPage.goToAwalWebsite();
  await loginPage.login(ENV.EMAIL_ID, ENV.PASSWORD);

  // Assert
  await expect(page).toHaveURL(`${ENV.BASE_URL}/home`);
});

test('navigate to core masters', async ({ homePage, page }) => {
  // Act
  await homePage.goToMenuAndSubMenu("Core Masters", 'Asset Type Master');

  // Assert
  await expect(page).toHaveURL(/.*asset-type/);
});
```

### 5. Test Organization Rules

#### Test File Naming:
- Use `.spec.ts` extension
- Use camelCase with "Test" suffix: `loginTest.spec.ts`, `salesEnquiryTest.spec.ts`
- Group related tests by feature
- Examples: ✅ `loginTest.spec.ts`, ✅ `dashboardTest.spec.ts`, ❌ `login.spec.ts`, ❌ `test-login.spec.ts`

#### Test Structure (AAA Pattern):
```typescript
test('test description', async ({ page, pageObject }) => {
  // Arrange - Set up test data and preconditions
  const testData = 'some-value';
  
  // Act - Perform the action being tested
  await pageObject.performAction(testData);
  
  // Assert - Verify the expected outcome
  await expect(page).toHaveURL(/.*expected-path/);
});
```

#### Test Naming Convention:
- Use descriptive names that explain what is being tested
- Use present tense
- Include the expected outcome
- Examples:
  - ✅ `should login successfully with valid credentials`
  - ✅ `should navigate to dashboard after login`
  - ✅ `should display error for invalid email format`
  - ❌ `test login` (too vague)
  - ❌ `login test` (incorrect format)
  - ❌ `user can login` (not starting with should)

### 6. Fixtures and Custom Hooks

Custom fixtures extend Playwright's test with page objects for easy access in tests.

```typescript
// fixtures/baseFixtures.ts
import { test as base } from "@playwright/test";
import { LoginPage } from "../pages/loginPage";
import { HomePage } from "../pages/homePage";
import { Modules } from "../pages/modules";
import { SalesEnquiryPage } from "../pages/salesEnqueryPage";

type baseFixtures = {
  loginPage: LoginPage;
  homePage: HomePage;
  modules: Modules;
  salesEnquiryPage: SalesEnquiryPage;
};

export const test = base.extend<baseFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  homePage: async ({ page }, use) => {
    await use(new HomePage(page));
  },
  modules: async ({ page }, use) => {
    await use(new Modules(page));
  },
  salesEnquiryPage: async ({ page }, use) => {
    await use(new SalesEnquiryPage(page));
  },
});

export const expect = test.expect;
```

**Usage in tests:**

```typescript
import { test, expect } from "../fixtures/baseFixtures";

test('use multiple page objects', async ({ loginPage, homePage, page }) => {
  await loginPage.goToAwalWebsite();
  await loginPage.login('user@example.com', 'password');
  await homePage.goToMenuAndSubMenu("Core Masters", 'Asset Type Master');
});
```

#### Adding New Page Objects to Fixtures:
1. Create the new page object class in `pages/[name]Page.ts`
2. Import it in `baseFixtures.ts`
3. Add type definition to `baseFixtures` type
4. Create fixture extension using `base.extend()`
5. Export for use in tests

### 7. Best Practices

#### DO:
- ✅ Use meaningful variable and method names (`login()`, `navigateToHomePage()`)
- ✅ Keep methods small and focused (single responsibility)
- ✅ Use async/await for all Playwright operations
- ✅ Add TypeScript types for all parameters and returns
- ✅ Group related locators and methods together
- ✅ Use `page.waitForLoadState('domcontentloaded')` or `'networkidle'` after navigation
- ✅ Handle dynamic content with appropriate waits
- ✅ Use soft assertions for multiple checks: `await expect.soft()`
- ✅ Use `getByRole()` as the first choice for locators (most user-friendly)
- ✅ Make locators private (prefix with `private readonly`)
- ✅ Document public methods with JSDoc comments
- ✅ Use environment variables from `ENV` class for configuration
- ✅ Organize tests with `test.describe()` blocks by feature

#### DON'T:
- ❌ Don't put assertions in page objects (keep in test files only)
- ❌ Don't use hard-coded waits (`page.waitForTimeout()` or `setTimeout()`)
- ❌ Don't repeat selectors across files (encapsulate in page objects)
- ❌ Don't expose Locator objects directly (use private properties and methods)
- ❌ Don't mix test data with page logic (keep data in `testData/` folder)
- ❌ Don't use overly complex CSS selectors or XPath
- ❌ Don't ignore page load states
- ❌ Don't create page objects that depend on other page objects
- ❌ Don't use `.only` or `.skip` in committed code
- ❌ Don't make page object methods with multiple responsibilities

### 8. Component Pattern (for reusable UI components)

Components are utility classes for reusable navigation or interaction patterns used across multiple pages.

**Example: Modules Navigation Component**

```typescript
// pages/modules.ts
import { Page, Locator } from '@playwright/test';

export class Modules {
  private readonly module: (name: string) => Locator;
  private readonly subModule: (name: string) => Locator;
  private readonly nestedSubModule: (name: string) => Locator;

  constructor(public readonly page: Page) {
    this.module = (name: string) => this.page.getByText(`${name}`);
    this.subModule = (name: string) => this.page.locator('#root').getByText(`${name}`);
    this.nestedSubModule = (name: string) => 
      this.page.locator('div').filter({ hasText: new RegExp(`•?${name}$`) }).nth(1);
  }

  /**
   * Navigate to a module and its submodule
   * @param module - Module name
   * @param subModule - SubModule name
   * @param nestedSubModule - Optional nested sub-module name
   */
  async goToModuleAndSubModule(
    module: string, 
    subModule: string, 
    nestedSubModule?: string
  ): Promise<void> {
    await this.module(module).click();
    await this.subModule(subModule).click();
    if (nestedSubModule) {
      await this.nestedSubModule(nestedSubModule).click();
    }
  }
}
```

**Usage in tests:**

```typescript
test('navigate through modules', async ({ modules, page }) => {
  await modules.goToModuleAndSubModule('Sales', 'Dashboards', 'Manager Dashboard');
  await expect(page).toHaveURL(/.*manager-dashboard/);
});
```

#### Creating New Component/Utility Classes:
1. Create file in `pages/[utility]Name.ts`
2. Add to `baseFixtures.ts` if it needs to be reused across tests
3. Import and use in tests via fixture or directly in page objects
4. Keep components focused on a single responsibility

### 9. Test Data Management

Test data is managed in the `testData/` folder and imported into tests as needed.

**Example: Organizing test data by feature**

```typescript
// testData/salesEnquiryData.ts
export const SalesEnquiryTestData = {
  VALID_ENQUIRY: {
    customerName: 'John Doe',
    email: 'john@example.com',
    phone: '+1-555-0123',
    product: 'Product A',
    quantity: 10,
  },
  INVALID_ENQUIRY: {
    customerName: '',
    email: 'invalid-email',
    phone: '123',
  },
};
```

```typescript
// testData/modules.ts
export const ModuleTestData = {
  CORE_MASTERS: {
    name: 'Core Masters',
    submodules: ['Asset Type Master', 'Category Master', 'Vendor Master'],
  },
  SALES: {
    name: 'Sales',
    submodules: ['Dashboards', 'Orders', 'Invoices'],
  },
};
```

```typescript
// utils/ENV.ts
import dotenv from 'dotenv';
dotenv.config({
  path: `./.env.${process.env.NODE_ENV?.toLowerCase() || 'qa'}`,
  debug: true,
  override: true,
});

export class ENV {
  public static BASE_URL = process.env.BASE_URL;
  public static EMAIL_ID = process.env.EMAIL_ID;
  public static PASSWORD = process.env.PASSWORD;
  // Add other environment variables as needed
}
```

**Usage in tests:**

```typescript
import { test } from "../fixtures/baseFixtures";
import { SalesEnquiryTestData } from "../testData/salesEnquiryData";
import { ENV } from "../utils/ENV";

test('submit valid sales enquiry', async ({ page, salesEnquiryPage }) => {
  const testData = SalesEnquiryTestData.VALID_ENQUIRY;
  
  await salesEnquiryPage.fillEnquiryForm(testData);
  await expect(page).toHaveURL(/.*success/);
});
```

### 10. Error Handling and Logging

Use Playwright's built-in error handling and logging features for better debugging.

```typescript
// Page object with error handling
async login(emailId: string, password: string): Promise<void> {
  try {
    await this.email.fill(emailId);
    await this.password.fill(password);
    await this.signInButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  } catch (error) {
    console.error(`Login failed for user ${emailId}:`, error.message);
    // Take screenshot on error
    await this.page.screenshot({ path: `screenshots/login-error-${Date.now()}.png` });
    throw new Error(`Login failed: ${error.message}`);
  }
}
```

**Playwright configuration for error handling:**

```typescript
// playwright.config.ts
export default defineConfig({
  timeout: 30000,
  expect: {
    timeout: 30000,
  },
  use: {
    trace: 'on-first-retry',        // Collect trace on retry
    screenshot: 'only-on-failure',  // Screenshot on failure
    video: 'retain-on-failure',     // Video recording on failure
  },
  // ... other config
});
```

**Use console logging for debugging:**

```typescript
test('test with logging', async ({ page, loginPage }) => {
  console.log('Starting login test...');
  await loginPage.goToAwalWebsite();
  console.log('Navigated to website');
  await loginPage.login('test@example.com', 'password');
  console.log('Login completed');
  await expect(page).toHaveURL(/.*home/);
});
```

## Code Generation Rules

When generating new tests or page objects for this project, ALWAYS follow these rules:

### Creating a New Page Object:

1. **Create page object file** in `pages/[FeatureName]Page.ts`
   - Use PascalCase for class name
   - Use camelCase for file name

2. **Define locators as private properties**
   - Use `private readonly` for all locators
   - Use descriptive names
   - Group related locators together

3. **Add public action methods**
   - Name methods descriptively (`login()`, `submitForm()`)
   - Add JSDoc comments with parameter descriptions
   - Specify return types
   - Include appropriate waits

4. **Add to fixtures** (if reusable across tests)
   - Import in `fixtures/baseFixtures.ts`
   - Add to type definition
   - Create fixture extension

### Creating a New Test File:

1. **Create test file** in `tests/[FeatureName]Test.spec.ts`
   - Use camelCase with "Test" suffix
   - Use `.spec.ts` extension

2. **Import required dependencies**
   ```typescript
   import { expect } from "@playwright/test";
   import { test } from "../fixtures/baseFixtures";
   import { ENV } from "../utils/ENV";
   // Import any needed page objects
   ```

3. **Structure tests with describe blocks**
   ```typescript
   test.describe('Feature Name', () => {
     test('should do something', async ({ page, pageObject }) => {
       // Arrange
       // Act
       // Assert
     });
   });
   ```

4. **Follow AAA pattern**
   - Arrange: Set up test data and preconditions
   - Act: Perform the action being tested
   - Assert: Verify expected outcomes

### Creating Test Data:

1. **Create file** in `testData/[featureName]Data.ts`
2. **Export named objects** with test scenarios
3. **Use descriptive keys** (VALID_DATA, INVALID_DATA, etc.)
4. **Import and use** in tests

## Project Structure Summary

```
pages/              → Page Objects (PascalCase class names, camelCase filenames)
fixtures/           → Custom test fixtures and hooks
tests/              → Test specifications (camelCase with Test suffix)
testData/           → Test data and mock data
utils/              → Utilities (ENV configuration, helpers)
playwright-report/  → Generated HTML reports
test-results/       → Test artifacts and screenshots
testcontexts/       → Documentation
```

## Playwright Configuration

**Current Configuration** (`playwright.config.ts`):
- Test timeout: 30 seconds
- Expect timeout: 30 seconds
- Test directory: `./tests`
- Parallel execution: Enabled by default
- Reporting: HTML report
- Artifacts: Screenshots on failure, videos on failure, traces on retry
- Environment: Load from `.env.[ENV]` file (default: `.env.qa`)

## Running Tests

```bash
# Run all tests
npx playwright test

# Run specific test file
npx playwright test tests/loginTest.spec.ts

# Run tests in headed mode (see browser)
npx playwright test --headed

# Run tests for specific browser
npx playwright test --project=chromium

# Generate and open report
npx playwright show-report

# Run in debug mode
npx playwright test --debug
```

---

## Awal Project-Specific Standards

### Environment Configuration

The project uses environment-based configuration with dotenv:

**Environment Variables** (`.env.qa`, `.env.staging`, etc.):
```
BASE_URL=https://qa-awal.colanapps.in
EMAIL_ID=testuser@example.com
PASSWORD=password123
```

**Accessing in tests:**
```typescript
import { ENV } from "../utils/ENV";

// Use like this:
await loginPage.login(ENV.EMAIL_ID, ENV.PASSWORD);
await page.goto(ENV.BASE_URL);
```

### Awal-Specific Page Navigation

The Awal application uses a hierarchical menu structure for navigation:

```typescript
// Navigation pattern for Awal
await homePage.goToMenuAndSubMenu("Core Masters", "Asset Type Master");
await modules.goToModuleAndSubModule("Sales", "Dashboards", "Manager Dashboard");
```

### Common Page Objects in Project

- **LoginPage** - Handles authentication and login flows
- **HomePage** - Main dashboard and menu navigation
- **Modules** - Module and sub-module navigation helper
- **SalesEnquiryPage** - Sales enquiry feature operations

### Test Naming Convention for Awal

Tests should follow the pattern of feature + specific action:
- ✅ `should login successfully with valid credentials`
- ✅ `should navigate to asset type master from core masters`
- ✅ `should submit sales enquiry form`
- ✅ `should display error for invalid enquiry data`

---

**Remember**: The goal is maintainable, readable, and scalable test automation. Always prioritize code quality and proper structure over quick solutions.

Last Updated: April 2026
Playwright Version: ^1.59.1