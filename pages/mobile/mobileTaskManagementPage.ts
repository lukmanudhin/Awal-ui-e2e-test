import { step } from "../basePage";
import { MobileBasePage } from "./mobileBasePage";
import { MobileSession } from "../../utils/mobileSession";

// Production > Task Management of the Awal tablet app: pick the employee, verify with the face camera, assign the PJO and run
// the task (start / end). All screens were checked on the app: employee cards, authentication method, Biometric Authentication,
// Assign PJO, Production Job Detail (status, Start / End Task), the Confirm pop up and the Success pop up.
export class MobileTaskManagementPage extends MobileBasePage {
  private readonly pageTitle = '//android.widget.TextView[@text="Task Management"]';
  private readonly chartSearchField = '(//android.widget.EditText[@hint="Search"])[last()]';
  private readonly text = (value: string): string => `//android.widget.TextView[@text="${value}"]`;
  private readonly employeeCard = (name: string): string => `//android.widget.TextView[contains(@text,"${name}")]`;
  // The PJO cards are touchable views whose accessibility text is "PJO Number, -, <number>, Sales Order Number, -, ..."
  private readonly pjoCard = (pjoNumber: string): string => `//android.view.ViewGroup[contains(@content-desc,"PJO Number, -, ${pjoNumber},")]`;
  // Status is compared ignoring case, spaces and underscores so NOTYETSTARTED / Not Yet Started / NOT_YET_STARTED all match
  private readonly status = (status: string): string =>
    `//android.widget.TextView[translate(@text,"abcdefghijklmnopqrstuvwxyz _","ABCDEFGHIJKLMNOPQRSTUVWXYZ")="${status.toUpperCase().replace(/[ _]/g, "")}"]`;
  // The pop ups ("Assigned" after Submit, "Success" after Start / End Task) have a title and a "✕" icon in the header, they have
  // no Close or OK button
  private readonly popupTitle = (title: string): string => `//android.widget.TextView[@text="${title}"]`;
  private readonly popupCloseIcon = '//android.widget.TextView[@text="✕"]';
  // Shown instead of the PJO list when the employee still has an unfinished PJO assigned
  private readonly currentTaskOption = '//android.widget.TextView[@text="Current Task"]';
  // Area of the "PJO Lists" card that scrolls on the Assign PJO screen (landscape 1280x800 tablet)
  private readonly pjoListArea = { left: 120, top: 450, width: 1060, height: 200 };

  constructor(session: MobileSession) {
    super(session);
  }

  // The employee cards are drawn in an org chart, so the card is searched for when it is not on the screen already
  @step()
  async selectEmployee(name: string) {
    if (!(await this.isDisplayed(this.employeeCard(name), 5000))) {
      await this.type(this.chartSearchField, name);
      await this.hideKeyboard(this.pageTitle);
    }
    await this.tap(this.employeeCard(name));
  }

  @step()
  async selectFaceRecognition() {
    await this.tap(this.text("Face Recognition"));
  }

  @step()
  async startVerification() {
    await this.tap(this.text("Start Verification"));
  }

  // After a successful verification the Assign PJO screen lists the PJOs of the employee's sub department
  async isAssignPJOScreenDisplayed(timeout = 60000): Promise<boolean> {
    return this.isDisplayed(this.text("Assign PJO"), timeout);
  }

  @step()
  async selectPJOAndSubmit(pjoNumber: string) {
    const found = await this.scrollUntilDisplayed(this.pjoCard(pjoNumber), this.pjoListArea);
    if (!found) {
      if (await this.isShownNow(this.currentTaskOption)) {
        throw new Error(
          `PJO ${pjoNumber} cannot be assigned: the employee still has an unfinished PJO (the app shows Current Task / Break options ` +
            "instead of the PJO list). Complete that task in the app first, it is left over from an earlier failed run."
        );
      }
      throw new Error(`PJO ${pjoNumber} is not listed in the PJO Lists of the Assign PJO screen`);
    }
    await this.tap(this.pjoCard(pjoNumber));
    await this.tap(this.text("Submit"));
  }

  async isPopupDisplayed(title: string, timeout?: number): Promise<boolean> {
    return this.isDisplayed(this.popupTitle(title), timeout);
  }

  // true when the pop up is gone after tapping its ✕ icon
  @step()
  async closePopup(title: string): Promise<boolean> {
    await this.tap(this.popupCloseIcon);
    return this.isNotDisplayed(this.popupTitle(title), 10000);
  }

  async isStatusDisplayed(status: string, timeout?: number): Promise<boolean> {
    return this.isDisplayed(this.status(status), timeout);
  }

  @step()
  async startTask() {
    await this.tap(this.text("Start Task"));
    await this.tap(this.text("Yes"));
  }

  @step()
  async endTask() {
    await this.tap(this.text("End Task"));
    await this.tap(this.text("Yes"));
  }
}
