import { APIRequestContext } from "@playwright/test";
import { wrapRequestContext, ApiLoggerConfig } from "playwright-colorful-logger";

export const API_LOGGER_CONFIG: ApiLoggerConfig = {
    logHeaders: false,
    logBody: false,
    curl: "on-failure",
    colors: true,
    redactHeaders: ["authorization", "x-auth-token", "cookie"],
};

export function ApiLogger(context: APIRequestContext): APIRequestContext {
    return wrapRequestContext(context, API_LOGGER_CONFIG);
}
