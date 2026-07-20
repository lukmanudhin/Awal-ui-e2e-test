import dotenv from "dotenv";
dotenv.config({
  path: `./env/.env.${(process.env.ENV || process.env.NODE_ENV)?.trim().toLowerCase() || "qa"}`,
  debug: true,
  override: true,
});
export class ENV {
  public static BASE_URL = process.env.BASE_URL;
  public static EMAIL_ID = process.env.EMAIL_ID;
  public static PASSWORD = process.env.PASSWORD;
  public static ENV_API = process.env.ENV_API;
}