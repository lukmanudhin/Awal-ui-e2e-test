# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: UI/sales/manufacturingTest.spec.ts >> Create Manufacturing E2E Flow >> Verify new Manufacturing enquiry is created successfully
- Location: tests/UI/sales/manufacturingTest.spec.ts:38:9

# Error details

```
Error: "DIGITAL PRINTING INK" is not an available option in the "Item Name*" dropdown

expect(locator).toBeVisible() failed

Locator: getByRole('option', { name: 'DIGITAL PRINTING INK' })
Expected: visible
Error: strict mode violation: getByRole('option', { name: 'DIGITAL PRINTING INK' }) resolved to 3 elements:
    1) <li tabindex="-1" role="option" data-option-index="0" aria-disabled="false" aria-selected="false" id="materialName-option-0" class="MuiAutocomplete-option">…</li> aka getByRole('option', { name: 'MAT-00414 - DIGITAL PRINTING' })
    2) <li tabindex="-1" role="option" data-option-index="1" aria-disabled="false" aria-selected="false" id="materialName-option-1" class="MuiAutocomplete-option">…</li> aka getByRole('option', { name: 'MAT-00286 - DIGITAL PRINTING' })
    3) <li tabindex="-1" role="option" data-option-index="2" aria-disabled="false" aria-selected="false" id="materialName-option-2" class="MuiAutocomplete-option">…</li> aka getByRole('option', { name: 'MAT-00284 - DIGITAL PRINTING' })

Call log:
  - "DIGITAL PRINTING INK" is not an available option in the "Item Name*" dropdown with timeout 15000ms
  - waiting for getByRole('option', { name: 'DIGITAL PRINTING INK' })

```

# Test source

```ts
  128 |         await this.tab(tabName).click();
  129 |         await this.page.waitForLoadState('domcontentloaded');
  130 |         await this.waitForTableToLoad();
  131 |     }
  132 | 
  133 |     async clickViewIcon() {
  134 |         await this.page.waitForTimeout(500);
  135 |         const urlBeforeClick = this.page.url();
  136 |         await expect(async () => {
  137 |             await this.eyeIcon.click({ force: true });
  138 |             await this.page.waitForTimeout(300);
  139 |             expect(this.page.url(), 'Clicking the view icon did not navigate away from the current page').not.toBe(urlBeforeClick);
  140 |         }).toPass({ timeout: 20000, intervals: [500, 1000, 2000] });
  141 |         await this.page.waitForLoadState('domcontentloaded');
  142 |     }
  143 | 
  144 |     // async goToNestedSubModule(nestedSubModule: string) {
  145 |     //     await this.nestedSubModules(nestedSubModule).click();
  146 |     //     await this.page.waitForLoadState('domcontentloaded');
  147 |     // }
  148 | 
  149 |     async uploadFile(folderName: string, fileName: string, uploadBtnCount?: number) {
  150 |         // const fileName = 'Test_Document.pdf';
  151 |         const filePath = path.join(process.cwd(), folderName, fileName);
  152 | 
  153 |         const uploadTrigger = uploadBtnCount
  154 |             ? this.uploadButton.nth(uploadBtnCount).or(this.browseFileButton)
  155 |             : this.uploadButton.first().or(this.browseFileButton);
  156 | 
  157 |         const [fileChooser] = await Promise.all([
  158 |             this.page.waitForEvent('filechooser'),
  159 |             uploadTrigger.click(),
  160 |         ]);
  161 | 
  162 |         await fileChooser.setFiles(filePath);
  163 |     }
  164 | 
  165 |     // async selectDate(date: number) {
  166 |     //     await this.calenderButton.click();
  167 |     //     if (!(await this.dateLocator(`${date}`).isVisible())) {
  168 |     //         await this.nextMonthIcon.click();
  169 |     //     }
  170 |     //     await this.dateLocator(`${date}`).click();
  171 |     // }
  172 | 
  173 |     async selectDate(targetDayNumber: number, calenderBtnCount?: number) {
  174 |         const targetDate = new Date();
  175 |         targetDate.setDate(targetDayNumber);
  176 | 
  177 |         await this.calenderButton.nth(calenderBtnCount || 0).click();
  178 |         await this.page.waitForTimeout(500);
  179 | 
  180 |         while (true) {
  181 |             const headerText = await this.page.locator('//div[@class="MuiPickersFadeTransitionGroup-root css-1h73gvd"]').innerText();
  182 |             const currentDate = new Date(headerText);
  183 | 
  184 |             if (
  185 |                 currentDate.getMonth() === targetDate.getMonth() &&
  186 |                 currentDate.getFullYear() === targetDate.getFullYear()
  187 |             ) {
  188 |                 break;
  189 |             }
  190 |             await this.nextMonthIcon.click();
  191 |         }
  192 |         await this.dateLocator(`${targetDate.getDate()}`).click();
  193 |     }
  194 | 
  195 |     async scrollUntilElementVisibleAndClick(element: Locator, count?: number) {
  196 |         await this.page.locator('//table').nth(count || 0).click();
  197 |         const MAX_SCROLLS = 13;
  198 |         const SCROLL_DELAY_MS = 300;
  199 | 
  200 |         for (let i = 0; i < MAX_SCROLLS; i++) {
  201 |             if (await element.isVisible()) break;
  202 |             await this.page.keyboard.press('ArrowRight');
  203 |             await this.page.waitForTimeout(SCROLL_DELAY_MS);
  204 |         }
  205 |         await element.click();
  206 |         await this.page.waitForLoadState('domcontentloaded');
  207 |     }
  208 | 
  209 |     async scrollUntilElementVisible(element: Locator) {
  210 |         await this.page.locator('//tr').first().click();
  211 |         const MAX_SCROLLS = 10;
  212 |         const SCROLL_DELAY_MS = 300;
  213 | 
  214 |         for (let i = 0; i < MAX_SCROLLS; i++) {
  215 |             if (await element.isVisible()) break;
  216 |             await this.page.keyboard.press('ArrowRight');
  217 |             await this.page.waitForTimeout(SCROLL_DELAY_MS);
  218 |         }
  219 |     }
  220 | 
  221 |     async waitForTableToLoad(timeout = 30_000) {
  222 |         await expect(this.page.locator('.MuiSkeleton-root').first(), 'Table is still showing loading placeholders').toBeHidden({ timeout });
  223 |     }
  224 | 
  225 |     async selectOptionFromDropdown(dropdownName: string, value: string) {
  226 |         await this.dropDownField(dropdownName).clear();
  227 |         await this.dropDownField(dropdownName).fill(value);
> 228 |         await expect(this.dropDownMenu(value), `"${value}" is not an available option in the "${dropdownName}" dropdown`).toBeVisible();
      |                                                                                                                           ^ Error: "DIGITAL PRINTING INK" is not an available option in the "Item Name*" dropdown
  229 |         await this.dropDownMenu(value).click();
  230 |     }
  231 | 
  232 |     async clickEditIcon() {
  233 |         await this.editIcon.click();
  234 |         await this.page.waitForLoadState('domcontentloaded');
  235 |     }
  236 | 
  237 |     protected async clickAndValidateAPINotTriggered(element: Locator, endpoint: string, apiName: string) {
  238 |         let requestSent = false;
  239 |         const onRequest = (request: Request) => {
  240 |             if (request.method() !== 'GET' && request.url().includes(endpoint)) {
  241 |                 requestSent = true;
  242 |             }
  243 |         };
  244 |         this.page.on('request', onRequest);
  245 |         await element.click();
  246 |         await this.page.waitForTimeout(2000);
  247 |         this.page.off('request', onRequest);
  248 |         expect(requestSent, `${apiName} API was triggered even though the form has validation errors`).toBe(false);
  249 |         console.log(`Verified ${apiName} API was not triggered for invalid input`);
  250 |     }
  251 | }
  252 | 
```