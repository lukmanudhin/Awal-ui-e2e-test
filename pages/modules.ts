import { Page, Locator } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class Modules extends BasePage {
  private readonly salesEnquiryModule: Locator;

  // Dynamic locators
  private readonly module: (name: string) => Locator;
  private readonly subModule: (name: string) => Locator;
  private readonly nestedSubModule: (name: string) => Locator;
  constructor(public readonly page: Page) {
    super(page);
    this.salesEnquiryModule = this.page.getByText('Sales', { exact: true });

    // Dynamic locators initialization
    // this.module = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
    // this.subModule = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
    // this.nestedSubModule = (name: string) => this.page.locator('div').filter({ hasText: new RegExp(`•?${name}$`) }).nth(1);

    this.module = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
    this.subModule = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
    this.nestedSubModule = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
  }
  // async goToModuleAndSubModule(module: string, subModule: string, nestedSubModule?: string) {
  //   await this.module(module).click();
  //   await this.subModule(subModule).click();
  //   if (nestedSubModule) {
  //     await this.nestedSubModule(nestedSubModule).click();
  //   }
  // }

  // async goToSalesEnquiry() {
  //   await this.salesEnquiryModule.click();
  //   await this.page.locator('#root').getByText('Sales Enquiry').click();
  // }

  @step()
  async goToModule({ module, subModule, nestedSubModule }: { module?: string, subModule?: string, nestedSubModule?: string } = {}) {
    if (module) {
      await this.module(module).click();
    }
    if (subModule) {
      await this.subModule(subModule).click();
    }
    if (nestedSubModule) {
      await this.nestedSubModule(nestedSubModule).click();
    }
  }
}