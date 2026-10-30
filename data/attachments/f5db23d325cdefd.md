# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: UI/sales/salesEnquiryInternal.spec.ts >> Verify E2E flow of Sales Enquiry (Request Internal) >> Create enquiry and save Acrylic product details
- Location: tests/UI/sales/salesEnquiryInternal.spec.ts:78:9

# Error details

```
Error: Flat / Villa value mismatch while creating sales enquiry

expect(locator).toHaveValue(expected) failed

Locator:  getByRole('textbox', { name: 'Flat / Villa' }).or(getByRole('textbox', { name: 'Flat/Villa' }))
Expected: "North"
Received: ""
Timeout:  15000ms

Call log:
  - Flat / Villa value mismatch while creating sales enquiry with timeout 15000ms
  - waiting for getByRole('textbox', { name: 'Flat / Villa' }).or(getByRole('textbox', { name: 'Flat/Villa' }))
    13 × locator resolved to <input min="0" value="" step="any" type="text" id="defaultFlatVilla" data-cy="defaultFlatVilla" placeholder="Enter Flat/Villa" class="MuiInputBase-input css-a8ub5r"/>
       - unexpected value ""

```

# Test source

```ts
  157 |     async clickEnquiryButton() {
  158 |         await expect(this.enquiryBtn, "Create Enquiry button is not visible").toBeVisible();
  159 |         await this.enquiryBtn.click();
  160 |         await this.page.waitForLoadState('domcontentloaded');
  161 |         await this.page.waitForTimeout(1000);
  162 |     }
  163 |     @step()
  164 |     async createSalesEnquiry(data: SalesEnquiryData) {
  165 |         await this.enterAddress(data);
  166 | 
  167 |         // Project details
  168 |         await this.projectNameTextBox.fill(data.projectName);
  169 |         await expect(this.projectNameTextBox, "Project Name value mismatch while creating sales enquiry").toHaveValue(data.projectName);
  170 | 
  171 |         // Radio buttons - assert checked state
  172 |         await this.projectModeRadio(data.projectMode).click();
  173 |         await expect(this.projectModeRadio(data.projectMode), `Project Mode option was not selected: ${data.projectMode}`).toBeChecked();
  174 | 
  175 |         await this.signageTypeRadio(data.signageType).click();
  176 |         await expect(this.signageTypeRadio(data.signageType), `Signage Type option was not selected: ${data.signageType}`).toBeChecked();
  177 | 
  178 |         await this.timePurposeRadio(data.timePurpose).click();
  179 |         await expect(this.timePurposeRadio(data.timePurpose), `Time Purpose option was not selected: ${data.timePurpose}`).toBeChecked();
  180 | 
  181 |         // Options - assert selected/checked
  182 |         await this.designSuppliedByOption(data.designSuppliedBy).click();
  183 |         await expect(this.designSuppliedByOption(data.designSuppliedBy), `Design Supplied By option was not selected: ${data.designSuppliedBy}`).toBeChecked();
  184 | 
  185 |         await this.materialSuppliedByOption(data.materialSuppliedBy).click();
  186 |         await expect(this.materialSuppliedByOption(data.materialSuppliedBy), `Material Supplied By option was not selected: ${data.materialSuppliedBy}`).toBeChecked();
  187 | 
  188 |         // Specification fields
  189 |         await this.dimensionTextBox.fill(data.dimension);
  190 |         await expect(this.dimensionTextBox, "Size dimension value mismatch while creating sales enquiry").toHaveValue(data.dimension);
  191 | 
  192 |         await this.materialTextBox.fill(data.materialThickness);
  193 |         await expect(this.materialTextBox, "Material Thickness value mismatch while creating sales enquiry").toHaveValue(data.materialThickness);
  194 | 
  195 |         await this.colorTextBox.fill(data.color);
  196 |         await expect(this.colorTextBox, "Color / Finish value mismatch while creating sales enquiry").toHaveValue(data.color);
  197 | 
  198 |         await this.projectRequirementTypeRadio(data.projectRequirementType).click();
  199 |         await expect(this.projectRequirementTypeRadio(data.projectRequirementType), `Project Requirement Type option was not selected: ${data.projectRequirementType}`).toBeChecked();
  200 | 
  201 |         await this.wallTextBox.fill(data.wall);
  202 |         await expect(this.wallTextBox, "Wall finishing details value mismatch while creating sales enquiry").toHaveValue(data.wall);
  203 | 
  204 |         // Equipment
  205 |         await this.requiredEquipments.click();
  206 |         await this.equipmentOption(data.equipment).click();
  207 | 
  208 |         await this.equipmentProvidedByTxtbx.fill(data.equipmentProvidedBy);
  209 |         await expect(this.equipmentProvidedByTxtbx, "Equipment Provided By value mismatch while creating sales enquiry").toHaveValue(data.equipmentProvidedBy);
  210 | 
  211 |         await this.permission(data.permission).check();
  212 |         await expect(this.permission(data.permission), `Permission option was not selected: ${data.permission}`).toBeChecked();
  213 | 
  214 |         await this.powerSupplyTxtBx.fill(data.powerSupply);
  215 |         await expect(this.powerSupplyTxtBx, "Power Supply value mismatch while creating sales enquiry").toHaveValue(data.powerSupply);
  216 | 
  217 |         // Product dropdown
  218 |         await this.productDropdown.click();
  219 |         for (const productName of data.product) {
  220 |             await this.productOption(productName).click();
  221 |         }
  222 | 
  223 |         // Calendar - delivery date
  224 |         // await this.calenderBtn.click();
  225 |         // await this.dateOption(`${data.date}`).click();
  226 |         await this.selectDate(data.date);
  227 | 
  228 |         // Payment terms
  229 |         await this.payTermsDropdown.fill(data.paymentTerms);
  230 |         await this.payTermsOption(data.paymentTerms).click();
  231 | 
  232 |         // Currency
  233 |         // await this.currencyDropdown.clear();
  234 |         // await this.currencyDropdown.click();
  235 |         // await expect(this.currencyOption(data.currency), `Currency option is not visible: ${data.currency}`).toBeVisible();
  236 |         // await this.currencyOption(data.currency).click();
  237 |         await this.selectOptionFromDropdown('Currency', data.currency)
  238 | 
  239 |         // Supply type
  240 |         await this.supplyTypeDropdown.clear();
  241 |         await this.supplyTypeDropdown.pressSequentially(data.supplyType);
  242 |         await expect(this.supplyTypeOption(data.supplyType), `Supply Type option is not visible: ${data.supplyType}`).toBeVisible();
  243 |         await this.supplyTypeOption(data.supplyType).click();
  244 | 
  245 |         // Calendar - pricing date
  246 |         // await this.pricingDateCalenderBtn.click();
  247 |         // await expect(this.dateOption(`${data.date}`), `Pricing date option is not visible: ${data.date}`).toBeVisible();
  248 |         // await this.dateOption(`${data.date}`).click();
  249 |         await this.selectDate(data.date, 1);
  250 | 
  251 |         // Final submit
  252 |         await expect(this.enquiryButton('Create Enquiry'), "Create Enquiry button is not visible").toBeVisible();
  253 |     }
  254 | 
  255 |     async enterAddress(data: SalesEnquiryData) {
  256 |         await this.flatOrVillaTextBox.fill(data.flatOrVilla);
> 257 |         await expect(this.flatOrVillaTextBox, "Flat / Villa value mismatch while creating sales enquiry").toHaveValue(data.flatOrVilla);
      |                                                                                                           ^ Error: Flat / Villa value mismatch while creating sales enquiry
  258 | 
  259 |         await this.buildingTextBox.fill(data.building);
  260 |         await expect(this.buildingTextBox, "Building value mismatch while creating sales enquiry").toHaveValue(data.building);
  261 | 
  262 |         await this.blockTextBox.fill(data.block);
  263 |         await expect(this.blockTextBox, "Block value mismatch while creating sales enquiry").toHaveValue(data.block);
  264 | 
  265 |         await this.roadTextBox.fill(data.road);
  266 |         await expect(this.roadTextBox, "Road value mismatch while creating sales enquiry").toHaveValue(data.road);
  267 | 
  268 |         await this.areaTextBox.fill(data.area);
  269 |         await expect(this.areaTextBox, "Area value mismatch while creating sales enquiry").toHaveValue(data.area);
  270 | 
  271 |         // Contact details
  272 |         await this.telephoneNumber1TextBox.fill(data.telephoneNumber1);
  273 |         await expect(this.telephoneNumber1TextBox, "Telephone Number 1 value mismatch while creating sales enquiry").toHaveValue(data.telephoneNumber1);
  274 | 
  275 |         await this.mobileNumber1TextBox.fill(data.mobileNumber1);
  276 |         await expect(this.mobileNumber1TextBox, "Mobile Number 1 value mismatch while creating sales enquiry").toHaveValue(data.mobileNumber1);
  277 | 
  278 |         await this.faxTextBox.fill(data.fax);
  279 |         await expect(this.faxTextBox, "Fax value mismatch while creating sales enquiry").toHaveValue(data.fax);
  280 | 
  281 |         await this.telephoneNumber2TextBox.fill(data.telephoneNumber2);
  282 |         await expect(this.telephoneNumber2TextBox, "Telephone Number 2 value mismatch while creating sales enquiry").toHaveValue(data.telephoneNumber2);
  283 | 
  284 |         await this.mobileNumber2TextBox.fill(data.mobileNumber2);
  285 |         await expect(this.mobileNumber2TextBox, "Mobile Number 2 value mismatch while creating sales enquiry").toHaveValue(data.mobileNumber2);
  286 | 
  287 |         await this.email1.fill(data.email1);
  288 |         await expect(this.email1, "Email 1 value mismatch while creating sales enquiry").toHaveValue(data.email1);
  289 | 
  290 |         await this.email2.fill(data.email2);
  291 |         await expect(this.email2, "Email 2 value mismatch while creating sales enquiry").toHaveValue(data.email2);
  292 | 
  293 |         await this.websiteTextBox.fill(data.website);
  294 |         await expect(this.websiteTextBox, "Website value mismatch while creating sales enquiry").toHaveValue(data.website);
  295 | 
  296 |         await this.pOBoxTextBox.fill(data.poBox);
  297 |         await expect(this.pOBoxTextBox, "P.O. Box value mismatch while creating sales enquiry").toHaveValue(data.poBox);
  298 | 
  299 |         // Country dropdown
  300 |         await this.countryDropdown.pressSequentially(data.country);
  301 |         await this.countryOption(data.country).click();
  302 | 
  303 |         // State dropdown
  304 |         await this.stateDropdown.pressSequentially(data.state);
  305 |         await this.stateOption(data.state).click();
  306 | 
  307 |         // City dropdown
  308 |         await this.cityDropdown.pressSequentially(data.city);
  309 |         await this.cityOption(data.city).click();
  310 |     }
  311 |     @step()
  312 |     async validateCreateSalesEnquiryAPI(statusCode: number, enquiryType: string) {
  313 |         const responsePromise = this.page.waitForResponse('**/salesEnquiry/upsertSalesEnquiry');
  314 |         await this.enquiryButton(enquiryType).click();
  315 |         const response = await responsePromise;
  316 |         const responseBody = await response.json();
  317 |         const extId = responseBody.result.extId;
  318 |         expect(response.status(), `Sales enquiry upsert API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
  319 |         console.log('Verified sales enquiry creation API with status code:', response.status());
  320 |         return extId;
  321 |     }
  322 |     @step()
  323 |     async validateCreateSalesEnquiryNotTriggeredAPI(enquiryType: string) {
  324 |         await this.clickAndValidateAPINotTriggered(this.enquiryButton(enquiryType), 'salesEnquiry/upsertSalesEnquiry', 'Create sales enquiry');
  325 |     }
  326 |     @step()
  327 |     async validateDeleteSalesEnquiryAPI(statusCode: number) {
  328 |         await this.deleteButton.click();
  329 |         const responsePromise = this.page.waitForResponse('**/salesEnquiry/delete/**');
  330 |         await this.deleteConfirmationButton.click();
  331 |         const response = await responsePromise;
  332 |         expect(response.status(), `Sales enquiry delete API status code mismatch. Expected ${statusCode}, received ${response.status()}`).toBe(statusCode);
  333 |         console.log('Sales enquiry deleted successfully');
  334 |         console.log(`Verified sales enquiry deletion API with status code:`, response.status());
  335 |     }
  336 |     @step()
  337 |     async viewSalesEnquiry(customerName: string) {
  338 |         // Search for the customer
  339 |         await this.search(customerName);
  340 |         await expect(this.createdSalesEnquiry(customerName), `Sales enquiry is not visible for customer: ${customerName}`).toBeVisible();
  341 | 
  342 |         // // Click the eye icon to view the enquiry
  343 |         // const eyeIcon = this.page.locator('//img[contains(@src, "eye")]').first();
  344 |         await expect(this.eyeIcon, "View sales enquiry eye icon is not visible").toBeVisible();
  345 |     }
  346 |     @step()
  347 |     async validateViewEnquiryDetails(data: SalesEnquiryData) {
  348 |         // await expect(this.page.getByRole('heading'), "View Enquiry Title is does not contain View Enquiry").toContainText('View Enquiry');
  349 |         // Get all the detail labels and values from the view page
  350 |         // const detailsText = await this.page.locator('//div[@class="p-0 undefined"]').innerText();
  351 |         await expect(this.page.locator('//div[@class="p-[18px] undefined"]'), `View sales enquiry details do not contain customer name: ${data.customerName}`).toContainText(data.customerName);
  352 |         const detailsText = await this.page.locator('//div[@class="p-[18px] undefined"]').innerText();
  353 |         console.log(`✓ Customer Name displayed: ${data.customerName}`);
  354 | 
  355 |         // Validate project name if not empty
  356 |         expect(detailsText, `View sales enquiry details do not contain project name: ${data.projectName}`).toContain(data.projectName);
  357 |         console.log(`✓ Project Name displayed: ${data.projectName}`);
```