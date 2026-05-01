import { devices, defineConfig } from "@playwright/test";
import { config } from "dotenv";
import { expand } from "dotenv-expand";

expand(config({ path: ".env", override: true }));
expand(config({ path: ".env.test", override: true }));

if (process.env.WB_ENV !== "test") {
  throw new Error('WB_ENV must be "test". Run tests with `WB_ENV=test`.');
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://127.0.0.1:3000";
const webServerEnv = Object.fromEntries(
  Object.entries(process.env).filter(
    (entry): entry is [string, string] => typeof entry[1] === "string",
  ),
);

export default defineConfig({
  forbidOnly: !!process.env.CI,
  retries: process.env.PWDEBUG ? 0 : process.env.CI ? 5 : 1,
  use: {
    baseURL: baseUrl,
    trace: process.env.CI ? "on-first-retry" : "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  webServer: {
    command: "mise run start-test-server",
    url: baseUrl,
    reuseExistingServer: !!process.env.CI,
    timeout: 300_000,
    stdout: "pipe",
    stderr: "pipe",
    env: webServerEnv,
    gracefulShutdown: {
      signal: "SIGTERM",
      timeout: 500,
    },
  },
  outputDir: "./test-results",
  testDir: "./test",
  workers: 1,
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
