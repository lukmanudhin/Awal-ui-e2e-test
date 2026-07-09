import { Page, Locator } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class PutAwayPage extends BasePage {
    public readonly qcStatus: Locator;
    private readonly startButton: Locator;
    constructor(public readonly page: Page) {
        super(page);
        this.qcStatus = this.page.locator('//td[@data-app-table-col="4"]//span').first();
        this.startButton = this.page.getByRole('button', { name: 'Start' });
    }
    @step()
    async clickStart() {
        await this.startButton.click();
    }
}