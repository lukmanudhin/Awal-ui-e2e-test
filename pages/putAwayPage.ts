import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";

export class PutAwayPage extends BasePage {
    public readonly qcStatus: Locator;
    private readonly startButton: Locator;
    private readonly putAwayButton: Locator;
    private readonly cancelButton: Locator;
    private readonly saveAsDraftButton: Locator;
    private readonly submitButton: Locator;
    private readonly conversionUnitTxtBx: Locator;
    private readonly putAwayQtyTxtBx: Locator;
    private readonly rowDropdown: Locator;
    private readonly rackDropdown: Locator;
    private readonly shelfDropdown: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.qcStatus = this.page.locator('//td[@data-app-table-col="4"]//span').first();
        this.startButton = this.page.getByRole('button', { name: 'Start' });
        this.putAwayButton = this.page.getByRole('button', { name: 'Put Away' });
        this.cancelButton = this.page.getByRole('button', { name: 'Cancel' });
        this.saveAsDraftButton = this.page.getByRole('button', { name: 'Save as Draft' });
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        this.conversionUnitTxtBx = this.page.getByRole('textbox', { name: 'Conversion Unit' });
        this.putAwayQtyTxtBx = this.page.locator('//input[@id="putAwayQty-1"]');
        this.rowDropdown = this.page.locator('#row-1');
        this.rackDropdown = this.page.locator('#rack-1');
        this.shelfDropdown = this.page.locator('#shelf-1');
    }

    @step()
    async clickStart() {
        await this.startButton.click();
    }

    @step()
    async clickPutAway() {
        await this.putAwayButton.click();
    }

    @step()
    async enterPutAwayDetails(warehouse: string, conversionUnit: string, row: string, rack: string, shelf: string, putAwayQty: string) {
        await this.selectOptionFromDropdown('Warehouse*', warehouse);
        await this.selectDate(new Date().getDate());
        await this.selectDate(new Date().getDate() + 3, 1);
        await this.selectDate(new Date().getDate() + 6, 2);
        await this.conversionUnitTxtBx.fill(conversionUnit);
        await this.selectRowRackShelf(this.rowDropdown, row);
        await this.selectRowRackShelf(this.rackDropdown, rack);
        await this.selectRowRackShelf(this.shelfDropdown, shelf);
        await this.putAwayQtyTxtBx.fill(putAwayQty);
    }

    private async selectRowRackShelf(dropdown: Locator, value: string) {
        await dropdown.click();
        await this.page.getByRole('option', { name: value, exact: true }).click();
    }

    @step()
    async submitPutAwayAndValidateAPI(statusCode: number) {
        const responsePromise = this.page.waitForResponse('**/grnqc/createPutAway');
        await this.submitButton.click();
        const response = await responsePromise;
        expect(response.status(), `Submit Put Away API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
        console.log('Verified Submit Put Away API with status code:', response.status());
    }
}
