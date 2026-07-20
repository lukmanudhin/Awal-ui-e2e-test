import { Page, Locator, expect } from '@playwright/test';
import { BasePage, step } from './basePage';
import { PipelineData } from '../testData/pipelineData';
import { SalesEnquiryData } from '../testData/salesEnquiryData';

export class PipelinePage extends BasePage {
  private readonly createPipelineButton: Locator;
  private readonly valueField: Locator;
  private readonly notesTextbox: Locator;
  private readonly addToPipelineButton: Locator;
  private readonly addButton: Locator;
  private readonly saveAndCloseButton: Locator;
  private readonly meetingDescriptionTextbox: Locator;
  private readonly subjectTextbox: Locator;
  private readonly emailRemarksTextbox: Locator;
  private readonly fileRemarksTextbox: Locator;
  private readonly notesField: Locator;
  private readonly saveButton: Locator;
  private readonly timePickerPlaceholder: (index: number) => Locator;
  private readonly timeOption: (name: string) => Locator;
  private readonly attachedDocument: (fileName: string) => Locator;

  constructor(public readonly page: Page) {
    super(page);
    this.createPipelineButton = this.page.getByRole('button', { name: 'Pipeline Create Pipeline' });
    this.valueField = this.page.locator('#value');
    this.notesTextbox = this.page.getByRole('textbox', { name: 'Notes' });
    this.notesField = this.page.locator('#notes');
    this.addToPipelineButton = this.page.getByRole('button', { name: 'Add to Pipeline' });
    this.addButton = this.page.getByRole('button', { name: 'add' });
    this.saveAndCloseButton = this.page.getByRole('button', { name: 'Save & Close' });
    this.meetingDescriptionTextbox = this.page.getByRole('textbox', { name: 'Description' });
    this.subjectTextbox = this.page.getByRole('textbox', { name: 'Subject*' });
    this.emailRemarksTextbox = this.page.locator('#remarks');
    this.fileRemarksTextbox = this.page.getByRole('textbox', { name: 'Remarks' });
    this.saveButton = this.page.getByRole('button', { name: 'Save' });
    this.timePickerPlaceholder = (index: number) => this.page.getByRole('button', { name: 'Choose time' }).nth(index);
    this.timeOption = (name: string) => this.page.locator(`//li[@aria-label="${name}"]`);
    this.attachedDocument = (fileName: string) => this.page.getByText(fileName, { exact: true }).first();
  }

  @step()
  async clickCreatePipeline() {
    await this.createPipelineButton.click();
    await this.page.waitForLoadState('domcontentloaded');
  }

  @step()
  async selectSalesEnquiry(enquiry: string) {
    await this.selectOptionFromDropdown('Sales Enquiry', enquiry);
  }

  @step()
  async addPipeline(pipeline: PipelineData) {
    await this.valueField.fill(pipeline.value);
    await this.selectDate(new Date().getDate() + 5)
    const fileName = 'Test_Document.pdf';
    await this.uploadFile('test_Documents', fileName);
    await expect(this.attachedDocument(fileName), `${fileName} is not visible in View Attached Documents`).toBeVisible();
    await this.notesTextbox.fill(pipeline.note);
  }

  @step()
  async validateAddToPipelineAPI(statusCode: number) {
    const responsePromise = this.page.waitForResponse('**/pipeline/convertToPipeline');
    await this.addToPipelineButton.click();
    const response = await responsePromise;
    expect(response.status(), `Pipeline API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    console.log('Verified Add to Pipeline API with status code:', response.status());
  }

  @step()
  async addNoteAndValidateAPI(note: string, statusCode: number) {
    await this.notesField.fill(note);
    const responsePromise = this.page.waitForResponse('**/pipeline/upsertPipelineNotes');
    await this.addButton.click();
    const response = await responsePromise;
    expect(response.status(), `Pipeline notes API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    console.log('Verified Pipeline notes API with status code:', response.status());
  }

  private async selectTime(timePickerCount: number, hour: string, minutes: string, meridium: string) {
    await this.page.waitForTimeout(250);
    await this.timePickerPlaceholder(timePickerCount).click();
    await this.page.waitForTimeout(250);
    await this.timeOption(`${hour} hours`).click();
    await this.page.waitForTimeout(250);
    await this.timeOption(`${minutes} minutes`).click();
    await this.page.waitForTimeout(250);
    await this.timeOption(`${meridium}`).click();
    await this.saveAndCloseButton.click();
  }

  @step()
  async addMeetingAndValidateAPI(description: string, statusCode: number) {
    await this.selectDate(new Date().getDate() + 5);
    await this.selectTime(0, '2', '10', 'AM');
    await this.selectTime(1, '3', '15', 'PM');
    await this.page.waitForTimeout(500);
    await this.meetingDescriptionTextbox.fill(description);
    await expect(this.meetingDescriptionTextbox, 'Meeting description did not match').toHaveValue(description);
    const responsePromise = this.page.waitForResponse('**/pipeline/upsertPipelineMeeting');
    await this.saveButton.click();
    const response = await responsePromise;
    expect(response.status(), `Pipeline meeting API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    console.log('Verified Pipeline meeting API with status code:', response.status());
  }

  @step()
  async createEmailAndValidateAPI(email: PipelineData, statusCode: number) {
    await this.subjectTextbox.fill(email.emailSubject);
    await expect(this.subjectTextbox, 'Email subject did not match').toHaveValue(email.emailSubject);
    await this.emailRemarksTextbox.fill(email.emailRemarks);
    await this.uploadFile('test_Documents', email.fileName);
    await expect(this.attachedDocument(email.fileName), `${email.fileName} is not visible in View Attached Documents`).toBeVisible();
    const responsePromise = this.page.waitForResponse('**/pipeline/upsertPipelineEmail');
    await this.saveButton.click();
    const response = await responsePromise;
    expect(response.status(), `Pipeline email API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    console.log('Verified Pipeline email API with status code:', response.status());
  }

  @step()
  async uploadFileAndValidateAPI(remarks: string, statusCode: number) {
    const fileName = 'Test_Document.pdf';
    await this.uploadFile('test_Documents', fileName);
    await expect(this.attachedDocument(fileName), `${fileName} is not visible in View Attached Documents`).toBeVisible();
    await this.fileRemarksTextbox.fill(remarks);
    await expect(this.fileRemarksTextbox, 'File remarks did not match').toHaveValue(remarks);

    const responsePromise = this.page.waitForResponse('**/pipeline/upsertPipelineFiles');
    await this.saveButton.click();
    const response = await responsePromise;
    expect(response.status(), `Pipeline file upload API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
    console.log('Verified Pipeline file upload API with status code:', response.status());
    await expect(this.page.getByText(fileName), 'Uploaded file was not visible').toBeVisible();
    await expect(this.page.getByText(remarks), 'Uploaded file remarks were not visible').toBeVisible();
  }

  @step()
  async validatePipelineTable(pipelineData: PipelineData) {
    await expect(this.page.locator('(//tr)[2]'), `Material table does not contain file name: ${pipelineData.fileName}`).toContainText(pipelineData.fileName);
    const materialTable = await this.page.locator('(//tr)[2]').innerText();
    expect(materialTable, "Material table does not contain file remarks").toContain(pipelineData.fileRemarks);
  }

  async validateSalesEnquiryDetails(data: SalesEnquiryData) {
    await expect(this.page.locator('//div[@class="grid grid-cols-2 pt-4 "]').or(this.page.locator('//div[@class="d-flex flex-column w-full bg-white gap-2 p-4"]')), `Details do not contain customer name: ${data.customerName}`).toContainText(data.customerName);
    const details = await this.page.locator('//div[@class="grid grid-cols-2 pt-4 "]').or(this.page.locator('//div[@class="d-flex flex-column w-full bg-white gap-2 p-4"]')).innerText();
    expect(details, "Details do not contain mobile number 1").toContain(data.mobileNumber1);
    expect(details, "Details do not contain country").toContain(data.country);
    expect(details, "Details do not contain state").toContain(data.state);
    expect(details, "Details do not contain city").toContain(data.city);
    expect(details, "Details do not contain project name").toContain(data.projectName);
  }

  async validateCreatedTaskVisible() {
    await expect(this.page.locator('//div[@style="--Paper-shadow: none;"]'), 'Created Task not Visible').toBeVisible();
  }
}
