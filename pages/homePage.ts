import { Page, Locator } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class HomePage extends BasePage {
    private readonly menu: (name: string) => Locator;
    private readonly subMenu: (name: string) => Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.menu = (name: string) => this.page.locator(`//div[text()='${name}']//ancestor::button`);
        this.subMenu = (name: string) => this.page.locator(`//div[text()='${name}']//ancestor::button`);
    }
    @step()
    async goToMenuAndSubMenu(menu: string, subMenu: string) {
        await this.page.waitForLoadState('domcontentloaded');
        await this.menu(menu).click();
        await this.subMenu(subMenu).click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}