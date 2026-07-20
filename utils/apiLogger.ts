import { APIRequestContext } from "@playwright/test";
import { wrapRequestContext, ApiLoggerConfig } from "playwright-colorful-logger";

// Single source of truth for API request/response logging across the suite:
// used by the `request` fixture in fixtures/baseFixtures.ts and by the pure
// API specs that create their own APIRequestContext.
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
