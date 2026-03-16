import { expect, test } from "@playwright/test";
import { uploadApp } from "./helpers";

test.describe("App page", () => {
  test("displays app in iframe with header", async ({ page, request }) => {
    const { id } = await uploadApp(request, {
      title: "Iframe Test App",
      files: [
        {
          name: "index.html",
          content: "<html><body><h1>Hello from iframe</h1></body></html>",
          mimeType: "text/html",
        },
      ],
    });

    await page.goto(`/apps/${id}`);

    // Header shows app title
    await expect(page.getByText("Iframe Test App")).toBeVisible();

    // Back link exists
    const backLink = page.locator('a[href="/"]');
    await expect(backLink).toBeVisible();

    // Iframe exists with correct src
    const iframe = page.locator("iframe");
    await expect(iframe).toBeVisible();
    await expect(iframe).toHaveAttribute("src", `/api/apps/${id}/files/index.html`);
  });

  test("shows 404 for non-existent app", async ({ page }) => {
    const response = await page.goto("/apps/nonexistent-id");
    expect(response?.status()).toBe(404);
  });
});
