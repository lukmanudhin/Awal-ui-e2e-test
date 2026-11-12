# Awal UI E2E & API Test Framework

An End-to-End (E2E) and API automated testing framework for the **Awal** web application built using **Playwright**, **TypeScript**, and **Allure Reporting**.

This repository implements a modular **Page Object Model (POM)** structure with fixture-based dependency injection, typed test data factories, and robust API response validation patterns.

---

## 🛠️ Tech Stack & Prerequisites

* **Framework:** [Playwright](https://playwright.dev/) (`@playwright/test`)
* **Language:** TypeScript
* **Reporting:** [Allure Report](https://allurereport.org/) (`allure-playwright`, `allure-commandline`)
* **Data Generation:** [@faker-js/faker](https://fakerjs.dev/)
* **Environment Management:** `dotenv`, `cross-env`
* **Node.js:** v18+ recommended

---

## 📁 Project Architecture & Structure

```
├── API/                   # API clients (e.g., SalesEnquiryAPI, StockViewAPI) using APIRequestContext
├── API-payloads/          # Strongly typed request payload builders for API testing
├── env/                   # Environment configuration files (.env.qa, .env.stage)
├── fixtures/              # Playwright test fixtures (baseFixtures.ts) injecting page objects & API clients
├── pages/                 # Page Object Model classes extending BasePage (SalesEnquiryPage, PPJOPage, etc.)
│   └── basePage.ts        # BasePage class with reusable UI interactions, locators, and @step decorators
├── testData/              # Data factory functions and TypeScript interfaces for test inputs
├── test_Documents/        # Sample file uploads (PDF, images, spreadsheets) used in E2E tests
├── tests/                 # Test suites
│   ├── API/               # Pure API spec files
│   └── UI/                # UI spec files grouped by feature (sales, procurements, etc.)
├── utils/                 # Utility helpers (ENV.ts, randomDataGenerator.ts, apiLogger.ts)
├── playwright.config.ts   # Playwright configuration (timeouts, reporters, browser settings)
└── package.json           # Dependencies and test execution scripts
```

---

## ⚙️ Environment Configuration

Environment configurations are stored under the `env/` directory:
- `env/.env.qa` (Default)
- `env/.env.stage`

Key environment variables:
- `BASE_URL`: Web application URL
- `BASE_URL_API`: Backend API endpoint URL
- `EMAIL_ID`: Login user credential
- `PASSWORD`: Login user password

Environment variables are loaded dynamically based on the `ENV` environment variable (defaults to `qa`) and accessed in tests/pages via `utils/ENV.ts`.

---

## 🚀 Running Tests

### Standard Test Execution

```bash
# Run the complete test suite (headless, default QA environment) + generate & open Allure report
npm test

# Run tests in headed browser mode
npm run test:headed

# Open Playwright Interactive UI Mode
npm run test:ui

# Run Playwright in Debug Mode
npm run test:debug
```

### Running Specific Tests or Features

```bash
# Run a single spec file directly
npx playwright test tests/UI/sales/createSalesEnquiry.spec.ts

# Run a single test by title match
npx playwright test tests/UI/sales/createSalesEnquiry.spec.ts -g "Verify new sales enquiry is created successfully"

# Run Sales feature tests (UI + API)
npm run test:sales

# Run Procurement feature tests
npm run test:procurement
```

### Environment-Specific Execution

You can target specific environments (`qa` or `stage`) using npm scripts:

```bash
# QA Environment
npm run test:qa                  # All tests on QA
npm run test:qa:headed           # Headed tests on QA
npm run test:qa:sales            # Sales module on QA
npm run test:qa:procurement       # Procurement module on QA

# Stage Environment
npm run test:stage               # All tests on Stage
npm run test:stage:headed        # Headed tests on Stage
npm run test:stage:sales         # Sales module on Stage
npm run test:stage:procurement    # Procurement module on Stage
```

---

## 📊 Test Reporting

Allure is integrated as the primary test reporter.

```bash
# Generate and open Allure report from allure-results
npm run report

# Generate a single-file static Allure HTML report
npm run report:single

# Clean output directories (allure-results, allure-report, playwright-report)
npm run clean
```

---

## 📐 Framework Conventions & Best Practices

### 1. Page Object Model & BasePage
- All page objects extend `BasePage` (`pages/basePage.ts`).
- Shared UI interactions (dropdown selection, date pickers, file uploads, tab navigation, search polling) live on `BasePage`.
- Locators are declared as class fields in constructors using `getByRole` or `getByText` whenever possible.
- Parameterized locators are defined as arrow functions returning Locators (e.g. `this.createdItem = (name: string) => this.page.getByText(name)`).

### 2. Fixture-Based Dependency Injection
- Specs import `test` from `fixtures/baseFixtures.ts` (not directly from `@playwright/test`).
- All page objects and API clients are registered as custom Playwright fixtures, eliminating manual instantiation in spec files.

### 3. API Response Validation Pattern
Every UI action that triggers a backend network request is paired with a `validate<Action><Feature>API` method on the page object:
- Registers `page.waitForResponse(...)` **before** triggering the UI action to prevent race conditions.
- Asserts the expected HTTP status code with descriptive failure messages.
- UI success messages/toasts are asserted in the spec file immediately following the API validation method call.

### 4. Typed Data Factories
- Test data is generated dynamically using factories in `testData/` (using `@faker-js/faker`).
- Literal test data is not hardcoded directly inside spec files.

---

## 🤝 CI/CD Integration

The test suite runs automatically in CI/CD pipelines (e.g., GitHub Actions / GitLab CI) against Playwright Docker images (`mcr.microsoft.com/playwright`), producing HTML and Allure artifacts for each run.
