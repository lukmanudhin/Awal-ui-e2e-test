import { Page, Locator, expect } from "@playwright/test";
import { BasePage, step } from "./basePage";
import { VendorRegistrationData } from "../testData/vendorRegistrationData";

export class VendorRegistrationPage extends BasePage {
    private readonly telephoneNumberTxtBx: Locator;
    private readonly mobileNumberTxtBx: Locator;
    private readonly emailAddressTxtBx: Locator;
    private readonly webAddressTxtBx: Locator;
    private readonly facebookLinkTxtBx: Locator;
    private readonly instagramLinkTxtBx: Locator;
    private readonly flatNoTxtBx: Locator;
    private readonly buildingTxtBx: Locator;
    private readonly blockTxtBx: Locator;
    private readonly roadTxtBx: Locator;
    private readonly areaTxtBx: Locator;
    private readonly postBoxNoTxtBx: Locator;
    private readonly contactName1TxtBx: Locator;
    private readonly designation1TxtBx: Locator;
    private readonly phoneNumber1TxtBx: Locator;
    private readonly contactEmail1TxtBx: Locator;
    private readonly contactName2TxtBx: Locator;
    private readonly designation2TxtBx: Locator;
    private readonly phoneNumber2TxtBx: Locator;
    private readonly contactEmail2TxtBx: Locator;

    private readonly legalNameTxtBx: Locator;
    private readonly licenseNumberTxtBx: Locator;
    private readonly yearEstablishedTxtBx: Locator;
    private readonly fullTimeEmployeesTxtBx: Locator;
    private readonly partTimeEmployeesTxtBx: Locator;
    private readonly vatNumberTxtBx: Locator;
    private readonly crNumberTxtBx: Locator;
    private readonly descriptionTxtBx: Locator;

    private readonly goodsDescriptionTxtBx: Locator;

    private readonly bankNameTxtBx: Locator;
    private readonly branchAddressTxtBx: Locator;
    private readonly accountNameTxtBx: Locator;
    private readonly bankAccountNumberTxtBx: Locator;
    private readonly faxNumberTxtBx: Locator;
    private readonly creditLimitAmountTxtBx: Locator;
    private readonly ibanTxtBx: Locator;
    private readonly swiftCodeTxtBx: Locator;
    private readonly routingBankDetailsTxtBx: Locator;

    private readonly evaluationForm: Locator;
    private readonly assessmentRadio: Locator;
    private readonly recommendationTxtBx: Locator;

    private readonly nextButton: Locator;
    private readonly submitButton: Locator;
    private readonly agreementChkBx: Locator;
    private readonly companyNameTxtBx: Locator;

    // Dynamic locators
    private readonly totalSalesTxtBx: (index: number) => Locator;
    private readonly totalExportSalesTxtBx: (index: number) => Locator;

    constructor(public readonly page: Page) {
        super(page);
        this.telephoneNumberTxtBx = this.page.getByRole('textbox', { name: 'Telephone Number*' });
        this.mobileNumberTxtBx = this.page.getByRole('textbox', { name: 'Mobile Number*' });
        this.emailAddressTxtBx = this.page.getByRole('textbox', { name: 'Email Address*' });
        this.webAddressTxtBx = this.page.getByRole('textbox', { name: 'Web Address' });
        this.facebookLinkTxtBx = this.page.getByRole('textbox', { name: 'Facebook Link' });
        this.instagramLinkTxtBx = this.page.getByRole('textbox', { name: 'Instagram Link' });
        this.flatNoTxtBx = this.page.getByRole('textbox', { name: 'Flat No' });
        this.buildingTxtBx = this.page.getByRole('textbox', { name: 'Building' });
        this.blockTxtBx = this.page.getByRole('textbox', { name: 'Block' });
        this.roadTxtBx = this.page.getByRole('textbox', { name: 'Road' });
        this.areaTxtBx = this.page.getByRole('textbox', { name: 'Area' });
        this.postBoxNoTxtBx = this.page.getByRole('textbox', { name: 'PostBox No*' });
        this.contactName1TxtBx = this.page.getByRole('textbox', { name: 'Contact Name 1*' });
        this.designation1TxtBx = this.page.getByRole('textbox', { name: 'Designation 1' });
        this.phoneNumber1TxtBx = this.page.getByRole('textbox', { name: 'Phone Number 1*' });
        this.contactEmail1TxtBx = this.page.getByRole('textbox', { name: 'Email Address 1' });
        this.contactName2TxtBx = this.page.getByRole('textbox', { name: 'Contact Name 2*' });
        this.designation2TxtBx = this.page.getByRole('textbox', { name: 'Designation 2' });
        this.phoneNumber2TxtBx = this.page.getByRole('textbox', { name: 'Phone Number 2*' });
        this.contactEmail2TxtBx = this.page.getByRole('textbox', { name: 'Email Address 2' });

        this.legalNameTxtBx = this.page.getByRole('textbox', { name: 'Name of Company (Legal Name)' });
        this.licenseNumberTxtBx = this.page.getByRole('textbox', { name: 'License No. (Registered State)' });
        this.yearEstablishedTxtBx = this.page.getByRole('textbox', { name: 'Year Established' });
        this.fullTimeEmployeesTxtBx = this.page.getByRole('textbox', { name: 'Number of Full-time Employees' });
        this.partTimeEmployeesTxtBx = this.page.getByRole('textbox', { name: 'Number of Part-time Employees' });
        this.vatNumberTxtBx = this.page.getByRole('textbox', { name: 'VAT Number' });
        this.crNumberTxtBx = this.page.getByRole('textbox', { name: 'CR Number' });
        this.descriptionTxtBx = this.page.getByRole('textbox', { name: 'Description' });

        this.goodsDescriptionTxtBx = this.page.getByRole('textbox', { name: 'Enter description' });

        this.bankNameTxtBx = this.page.getByRole('textbox', { name: 'Bank Name*' });
        this.branchAddressTxtBx = this.page.getByRole('textbox', { name: 'Branch Address' });
        this.accountNameTxtBx = this.page.getByRole('textbox', { name: 'Account Name*' });
        this.bankAccountNumberTxtBx = this.page.getByRole('textbox', { name: 'Bank Account Number*', exact: true });
        this.faxNumberTxtBx = this.page.getByRole('textbox', { name: 'Fax Number' });
        this.creditLimitAmountTxtBx = this.page.getByRole('textbox', { name: 'Credit Limit Amount*' });
        this.ibanTxtBx = this.page.getByRole('textbox', { name: 'International Bank Account' });
        this.swiftCodeTxtBx = this.page.getByRole('textbox', { name: 'Swift/Bank Identifier Code*' });
        this.routingBankDetailsTxtBx = this.page.getByRole('textbox', { name: 'Routing Bank Details(if' });

        this.evaluationForm = this.page.locator('#evaluation-form');
        this.assessmentRadio = this.page.locator('.w-4.h-4.rounded-full');
        this.recommendationTxtBx = this.page.getByRole('textbox', { name: 'Recommendation' });

        this.nextButton = this.page.getByRole('button', { name: 'Next' });
        this.submitButton = this.page.getByRole('button', { name: 'Submit' });
        this.agreementChkBx = this.page.getByRole('checkbox');
        this.companyNameTxtBx = this.page.getByRole('textbox', { name: 'Name of Company*' });

        // Dynamic locators initialization
        this.totalSalesTxtBx = (index: number) => this.page.locator(`[id="experience.totalSales.${index}.value"]`);
        this.totalExportSalesTxtBx = (index: number) => this.page.locator(`[id="experience.totalExportSales.${index}.value"]`);
    }

    @step()
    async enterGeneralInformation(vendorData: VendorRegistrationData) {
        await expect(this.companyNameTxtBx).toHaveValue(vendorData.companyName);
        await this.selectDate(new Date().getDate());
        await this.agreementChkBx.first().check();
        await this.telephoneNumberTxtBx.fill(vendorData.telephoneNumber);
        await this.mobileNumberTxtBx.fill(vendorData.mobileNumber);
        await this.emailAddressTxtBx.fill(vendorData.emailAddress);
        await this.webAddressTxtBx.fill(vendorData.webAddress);
        await this.facebookLinkTxtBx.fill(vendorData.facebookLink);
        await this.instagramLinkTxtBx.fill(vendorData.instagramLink);
        await this.flatNoTxtBx.fill(vendorData.flatNo);
        await this.buildingTxtBx.fill(vendorData.building);
        await this.blockTxtBx.fill(vendorData.block);
        await this.roadTxtBx.fill(vendorData.road);
        await this.selectOptionFromDropdown('Country*', vendorData.country);
        await this.selectOptionFromDropdown('State*', vendorData.state);
        await this.selectOptionFromDropdown('City*', vendorData.city);
        await this.areaTxtBx.fill(vendorData.area);
        await this.postBoxNoTxtBx.fill(vendorData.postBoxNo);
        await this.contactName1TxtBx.fill(vendorData.contactName1);
        await this.designation1TxtBx.fill(vendorData.designation1);
        await this.phoneNumber1TxtBx.fill(vendorData.phoneNumber1);
        await this.contactEmail1TxtBx.fill(vendorData.contactEmail1);
        await this.contactName2TxtBx.fill(vendorData.contactName2);
        await this.designation2TxtBx.fill(vendorData.designation2);
        await this.phoneNumber2TxtBx.fill(vendorData.phoneNumber2);
        await this.contactEmail2TxtBx.fill(vendorData.contactEmail2);
        await this.saveVendorStep();
    }

    @step()
    async enterCompanyInformation(vendorData: VendorRegistrationData) {
        await this.legalNameTxtBx.fill(vendorData.legalName);
        await this.licenseNumberTxtBx.fill(vendorData.licenseNumber);
        await this.selectDate(new Date().getDate());
        await this.yearEstablishedTxtBx.fill(vendorData.yearEstablished);
        await this.selectOptionFromDropdown('Type of Business', vendorData.typeOfBusiness);
        await this.selectOptionFromDropdown('Nature of Business', vendorData.natureOfBusiness);
        await this.fullTimeEmployeesTxtBx.fill(vendorData.fullTimeEmployees);
        await this.partTimeEmployeesTxtBx.fill(vendorData.partTimeEmployees);
        await this.selectOptionFromDropdown('Working Languages', vendorData.workingLanguage);
        await this.vatNumberTxtBx.fill(vendorData.vatNumber);
        await this.crNumberTxtBx.fill(vendorData.crNumber);
        await this.selectOptionFromDropdown('Quality Assurance', vendorData.qualityAssurance);
        await this.descriptionTxtBx.fill(vendorData.companyDescription);
        await this.uploadFile('test_Documents', 'Test_Document.pdf');
        await this.saveVendorStep();
    }

    @step()
    async enterGoodsAndServices(vendorData: VendorRegistrationData) {
        await this.goodsDescriptionTxtBx.fill(vendorData.goodsDescription);
        for (const [index, sales] of vendorData.totalSales.entries()) {
            await this.totalSalesTxtBx(index).fill(sales);
        }
        for (const [index, exportSales] of vendorData.totalExportSales.entries()) {
            await this.totalExportSalesTxtBx(index).fill(exportSales);
        }
        await this.selectOptionFromDropdown('Select Country', vendorData.goodsCountry);
        await this.saveVendorStep();
    }

    @step()
    async enterBankInformation(vendorData: VendorRegistrationData) {
        await this.bankNameTxtBx.fill(vendorData.bankName);
        await this.branchAddressTxtBx.fill(vendorData.branchAddress);
        await this.accountNameTxtBx.fill(vendorData.accountName);
        await this.bankAccountNumberTxtBx.fill(vendorData.bankAccountNumber);
        await this.selectOptionFromDropdown('Account Currency', vendorData.accountCurrency);
        await this.telephoneNumberTxtBx.fill(vendorData.bankTelephoneNumber);
        await this.faxNumberTxtBx.fill(vendorData.faxNumber);
        await this.creditLimitAmountTxtBx.fill(vendorData.creditLimitAmount);
        await this.selectOptionFromDropdown('Payment Terms', vendorData.paymentTerms);
        await this.uploadFile('test_Documents', 'Test_Document.pdf');
        await this.ibanTxtBx.fill(vendorData.ibanNumber);
        await this.swiftCodeTxtBx.fill(vendorData.swiftCode);
        await this.routingBankDetailsTxtBx.fill(vendorData.routingBankDetails);
        await this.saveVendorStep();
    }

    @step()
    async enterEvaluation(vendorData: VendorRegistrationData) {
        await this.agreementChkBx.first().check();
        const [evaluationFileChooser] = await Promise.all([
            this.page.waitForEvent('filechooser'),
            this.evaluationForm.getByRole('button', { name: 'Upload' }).click(),
        ]);
        await evaluationFileChooser.setFiles('test_Documents/Test_Document.pdf');

        await this.assessmentRadio.first().click();
        await this.recommendationTxtBx.fill(vendorData.recommendation);
        await this.selectOptionFromDropdown('Mode of Discussion*', vendorData.modeOfDiscussion);
        await this.uploadFile('test_Documents', 'Test_Document.pdf', 1);
        await this.selectOptionFromDropdown('Name*', vendorData.evaluatorName);
        await this.selectDate(new Date().getDate());
        await this.submitButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }

    @step()
    private async saveVendorStep() {
        await this.nextButton.click();
        await this.page.waitForLoadState('domcontentloaded');
    }
}
