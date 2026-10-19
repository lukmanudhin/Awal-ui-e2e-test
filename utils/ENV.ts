import dotenv from "dotenv";
dotenv.config({
  path: `./env/.env.${(process.env.ENV || process.env.NODE_ENV)?.trim().toLowerCase() || "stage"}`,
  debug: true,
  override: true,
});
export class ENV {
  public static BASE_URL = process.env.BASE_URL;
  public static EMAIL_ID = process.env.EMAIL_ID;
  public static PASSWORD = process.env.PASSWORD;
  public static ENV_API = process.env.ENV_API;

  // Mobile (Appium) settings - defaults match the local Appium server and the Awal Android app
  public static APPIUM_HOST = process.env.APPIUM_HOST || "127.0.0.1";
  public static APPIUM_PORT = Number(process.env.APPIUM_PORT || 4723);
  public static MOBILE_APP_PACKAGE = process.env.MOBILE_APP_PACKAGE || "com.awalPlastics";
  public static MOBILE_APP_ACTIVITY = process.env.MOBILE_APP_ACTIVITY || ".MainActivity";
  public static ANDROID_UDID = process.env.ANDROID_UDID;
}