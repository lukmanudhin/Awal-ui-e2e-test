# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: UI/sales/creditControlTest.spec.ts >> Credit Control Test E2E Flow >> Verify new sales enquiry is created successfully
- Location: tests/UI/sales/creditControlTest.spec.ts:36:9

# Error details

```
TimeoutError: locator.click: Timeout 15000ms exceeded.
Call log:
  - waiting for locator('//span[text()="Accounts Receivable"]').first()
    - locator resolved to <span class=" truncate text-sm">Accounts Receivable</span>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
  - element was detached from the DOM, retrying

```

# Test source

```ts
  1  | import { Page, Locator } from "@playwright/test";
  2  | import { BasePage, step } from "./basePage";
  3  | 
  4  | export class Modules extends BasePage {
  5  |   private readonly salesEnquiryModule: Locator;
  6  | 
  7  |   // Dynamic locators
  8  |   private readonly module: (name: string) => Locator;
  9  |   private readonly subModule: (name: string) => Locator;
  10 |   private readonly nestedSubModule: (name: string) => Locator;
  11 |   constructor(public readonly page: Page) {
  12 |     super(page);
  13 |     this.salesEnquiryModule = this.page.getByText('Sales', { exact: true });
  14 | 
  15 |     // Dynamic locators initialization
  16 |     // this.module = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
  17 |     // this.subModule = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
  18 |     // this.nestedSubModule = (name: string) => this.page.locator('div').filter({ hasText: new RegExp(`•?${name}$`) }).nth(1);
  19 | 
  20 |     this.module = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
  21 |     this.subModule = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
  22 |     this.nestedSubModule = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
  23 |   }
  24 |   // async goToModuleAndSubModule(module: string, subModule: string, nestedSubModule?: string) {
  25 |   //   await this.module(module).click();
  26 |   //   await this.subModule(subModule).click();
  27 |   //   if (nestedSubModule) {
  28 |   //     await this.nestedSubModule(nestedSubModule).click();
  29 |   //   }
  30 |   // }
  31 | 
  32 |   // async goToSalesEnquiry() {
  33 |   //   await this.salesEnquiryModule.click();
  34 |   //   await this.page.locator('#root').getByText('Sales Enquiry').click();
  35 |   // }
  36 | 
  37 |   @step()
  38 |   async goToModule({ module, subModule, nestedSubModule }: { module?: string, subModule?: string, nestedSubModule?: string } = {}) {
  39 |     if (module) {
  40 |       await this.module(module).click();
  41 |     }
  42 |     if (subModule) {
> 43 |       await this.subModule(subModule).click();
     |                                       ^ TimeoutError: locator.click: Timeout 15000ms exceeded.
  44 |     }
  45 |     if (nestedSubModule) {
  46 |       await this.nestedSubModule(nestedSubModule).click();
  47 |     }
  48 |   }
  49 | }
```