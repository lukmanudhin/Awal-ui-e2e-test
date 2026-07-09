import { Page, Locator, expect, test } from "@playwright/test";
import * as path from "path";

export function step(stepName?: string) {
    return function decorator(target: Function, context: ClassMethodDecoratorContext) {
        return function replacementMethod(this: any, ...args: any) {
            const name = stepName || `${this.constructor.name}.${context.name as string}`
            return test.step(name, async () => {
                return await target.call(this, ...args);
            })
        }
    }
}

export class BasePage {
    public readonly searchBox: Locator;
    protected readonly enquiryIdCell: Locator;
    public readonly eyeIcon: Locator;
    public readonly quotationStatus: Locator;
    public readonly successMessage1: Locator;
    protected readonly uploadButton: Locator;
    protected readonly browseFileButton: Locator;
    private readonly calenderButton: Locator;
    private readonly nextMonthIcon: Locator;
    protected readonly rejectButton: Locator;

    // Dynamic locators
    public successMessage: (name: string) => Locator;
    private readonly dateLocator: (date: string) => Locator;
    private readonly modules: (name: string) => Locator;
    private readonly subModules: (name: string) => Locator;
    private readonly nestedSubModules: (name: string) => Locator;
    private readonly tab: (name: string) => Locator;
    public readonly createdSalesEnquiry: (name: string) => Locator;
    private readonly dropDownField: (name: string) => Locator;
    private readonly dropDownMenu: (name: string) => Locator;
    constructor(public readonly page: Page) {
        this.searchBox = this.page.getByRole('textbox', { name: 'Search' });
        this.enquiryIdCell = this.page.locator('//tr/td[2]/div').first();
        this.eyeIcon = this.page.locator('//img[contains(@src, "eye")]').first();
        this.quotationStatus = this.page.locator('//span[@class=" text-xs py-[2px] px-[8px]"]').first();
        this.successMessage1 = this.page.locator('//div[contains(@class,"toast")]//p').last();
        this.uploadButton = this.page.getByRole('button', { name: 'Upload' });
        this.browseFileButton = this.page.getByRole('button', { name: 'Browse files' });
        this.calenderButton = this.page.getByRole('button', { name: 'Choose date' });
        this.nextMonthIcon = this.page.getByRole('button', { name: 'Next month' });
        this.rejectButton = this.page.getByRole('button', { name: 'Reject' });

        // Dynamic locators initialization
        this.successMessage = (name: string): Locator => this.page.getByRole('paragraph').filter({ hasText: name });
        this.modules = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
        this.subModules = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
        this.nestedSubModules = (name: string) => this.page.locator(`//span[text()="${name}"]`).first();
        this.createdSalesEnquiry = (name: string) => this.page.getByText(`${name}`).first();
        this.dateLocator = (date: string) => this.page.locator(`//div[@class="css-8uic9k" and text()="${date}"]`).first();
        this.tab = (name: string) => this.page.getByRole('tab', { name: `${name}` });
        this.dropDownField = (name: string) => this.page.getByRole('combobox', { name: `${name}` });
        this.dropDownMenu = (name: string) => this.page.getByRole('option', { name: `${name}` });
    }

    async title() {
        return await this.page.title();
    }

    async goBack() {
        await this.page.goBack();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async goForward() {
        await this.page.goForward();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async refresh() {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async url() {
        return this.page.url();
    }

    async uncheckAllCheckbox() {
        const equipmentChkbx = await this.page.getByRole('checkbox').all();
        for (const checkbox of equipmentChkbx) {
            if (await checkbox.isChecked()) {
                await checkbox.uncheck({ force: true });
            }
        }
    }

    // async goToSubModule(subModule: string) {
    //     await this.subModules(subModule).click();
    //     await this.page.waitForLoadState('domcontentloaded');
    // }

    async search(name: string) {
        await this.page.waitForTimeout(500);
        await this.searchBox.fill(name);
        await this.page.waitForFunction(
            () => document.querySelectorAll('tr').length <= 2
        );
        // await expect.poll(
        //     async () => await this.page.locator('//tr').count(),
        //     {
        //         message: `Search result count mismatch. Received ${await this.page.locator('//tr').count() - 1} Results`,
        //         timeout: 10000,
        //         intervals: [500, 1000, 1500, 2000],
        //     }
        // ).toBeLessThanOrEqual(2);

        await expect.poll(
            async () => {
                const count = await this.page.locator('//tr').count();
                if (count > 2) {
                    await this.searchBox.clear();
                    await this.searchBox.fill(name);
                }
                return count;
            },
            {
                message: `Search result count mismatch. Received ${await this.page.locator('//tr').count() - 1} Results`,
                timeout: 10000,
                intervals: [500, 1000, 1500, 2000],
            }
        ).toBeLessThanOrEqual(2);

        // expect(await this.page.locator('//tr').count(), `Search result count mismatch. Received ${await this.page.locator('//tr').count() - 1} Results`).toBeLessThanOrEqual(2);
        await expect(this.createdSalesEnquiry(name), `Sales enquiry is not visible for customer: ${name}`).toBeVisible();
        const enquiryId = await this.enquiryIdCell.textContent();
        return enquiryId || "";
    }

    async goToTab(tabName: string) {
        await this.tab(tabName).click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async clickViewIcon() {
        await this.page.waitForTimeout(500);
        await this.eyeIcon.click({ force: true });
        await this.page.waitForLoadState('domcontentloaded');
    }

    // async goToNestedSubModule(nestedSubModule: string) {
    //     await this.nestedSubModules(nestedSubModule).click();
    //     await this.page.waitForLoadState('domcontentloaded');
    // }

    async uploadFile(folderName: string, fileName: string, uploadBtnCount?: number) {
        // const fileName = 'Test_Document.pdf';
        const filePath = path.join(process.cwd(), folderName, fileName);

        const uploadTrigger = uploadBtnCount
        ? this.uploadButton.nth(uploadBtnCount).or(this.browseFileButton)
        : this.uploadButton.first().or(this.browseFileButton);

        const [fileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            uploadTrigger.click(),
        ]);

        await fileChooser.setFiles(filePath);
    }

    // async selectDate(date: number) {
    //     await this.calenderButton.click();
    //     if (!(await this.dateLocator(`${date}`).isVisible())) {
    //         await this.nextMonthIcon.click();
    //     }
    //     await this.dateLocator(`${date}`).click();
    // }

    async selectDate(targetDayNumber: number, calenderBtnCount?: number) {
        const targetDate = new Date();
        targetDate.setDate(targetDayNumber);

        await this.calenderButton.nth(calenderBtnCount || 0).click();
        await this.page.waitForTimeout(500);

        while (true) {
            const headerText = await this.page.locator('//div[@class="MuiPickersFadeTransitionGroup-root css-1h73gvd"]').innerText();
            const currentDate = new Date(headerText);

            if (
                currentDate.getMonth() === targetDate.getMonth() &&
                currentDate.getFullYear() === targetDate.getFullYear()
            ) {
                break;
            }
            await this.nextMonthIcon.click();
        }
        await this.dateLocator(`${targetDate.getDate()}`).click();
    }

    async scrollUntilElementVisibleAndClick(element: Locator) {
        await this.page.locator('//tr').first().click();
        const MAX_SCROLLS = 10;
        const SCROLL_DELAY_MS = 300;

        for (let i = 0; i < MAX_SCROLLS; i++) {
            if (await element.isVisible()) break;
            await this.page.keyboard.press('ArrowRight');
            await this.page.waitForTimeout(SCROLL_DELAY_MS);
        }
        await element.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async scrollUntilElementVisible(element: Locator) {
        await this.page.locator('//tr').first().click();
        const MAX_SCROLLS = 10;
        const SCROLL_DELAY_MS = 300;

        for (let i = 0; i < MAX_SCROLLS; i++) {
            if (await element.isVisible()) break;
            await this.page.keyboard.press('ArrowRight');
            await this.page.waitForTimeout(SCROLL_DELAY_MS);
        }
    }

    async selectOptionFromDropdown(dropdownName: string, value: string) {
        await this.dropDownField(dropdownName).clear();
        await this.dropDownField(dropdownName).fill(value);
        await this.dropDownMenu(value).click();
    }
}
