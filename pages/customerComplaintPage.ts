import { Page, Locator } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { CustomerComplaintData } from "../testData/customerComplaintData";

export class CustomerComplaintPage extends BasePage {
    private readonly quantityAffectedTxtBx: Locator;
    private readonly productDescriptionTxtBx: Locator;
    private readonly radioBtn: (name: string) => Locator;
    private readonly detailOfComplaintsTxtBx: Locator;
    private readonly proposedActionTxtBx: Locator;
    private readonly submitForApprovalButton: Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.quantityAffectedTxtBx = this.page.getByRole('textbox', { name: 'Quantity Affected*' });
        this.productDescriptionTxtBx = this.page.getByRole('textbox', { name: 'Product Description*' });
        this.radioBtn = (name: string) => this.page.locator(`//label[text()="${name}"]//preceding-sibling::div`)
        this.detailOfComplaintsTxtBx = this.page.locator('#detailOfComplaint');
        this.proposedActionTxtBx = this.page.locator('#proposedCorrectiveAction');
        this.submitForApprovalButton = this.page.getByRole('button', { name: 'Save and Submit for approval' });
    }
    @step()
    async submitComplaintRegistrationForm(data: CustomerComplaintData) {
        await this.selectDate(data.date);
        await this.selectDate(data.date+1, 1);
        await this.selectOptionFromDropdown('Customer*', data.customer);
        await this.selectOptionFromDropdown('Delivery / Invoice No.*', data.invoiceNo);
        await this.quantityAffectedTxtBx.fill(data.quantityAffected);
        await this.productDescriptionTxtBx.fill(data.productDescription);
        await this.selectOptionFromDropdown('Previous History of the', data.customerOnComplaints);
        await this.radioBtn(data.proof).click();
        await this.uploadFile('test_Documents', data.fileName);
        await this.radioBtn(data.proof).click();
        await this.uploadFile('test_Documents', data.fileName, 1);
        await this.detailOfComplaintsTxtBx.fill('Test');
        await this.proposedActionTxtBx.fill('Test');
        await this.selectOptionFromDropdown('For Further Investigation By*', 'IT Support');
        await this.selectOptionFromDropdown('Assigned To*', 'Janaki');
        await this.selectOptionFromDropdown('Investigated / Proposed By', 'Praveeen Kumar');
        await this.selectOptionFromDropdown('Approved By*', 'Vignesh M MERN');
        await this.selectDate(data.date+2, 2);
        await this.submitForApprovalButton.click();
    }
}