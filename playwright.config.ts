import { devices, defineConfig } from "@playwright/test";

if (process.env.MISE_ENV !== "test") {
  throw new Error('MISE_ENV must be "test". Run tests with `MISE_ENV=test mise run test`.');
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
if (!baseUrl) {
  throw new Error(
    "NEXT_PUBLIC_BASE_URL is required. Run tests via mise with test environment settings.",
  );
}

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
    stdout: "ignore",
    stderr: "pipe",
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
