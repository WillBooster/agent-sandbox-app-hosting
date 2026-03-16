import { expect, test } from "@playwright/test";
import { uploadApp } from "./helpers";

test.describe("Home page", () => {
  test("shows uploaded app in the list", async ({ page, request }) => {
    const { id } = await uploadApp(request, {
      title: "My Cool App",
      description: "An awesome app for testing",
      files: [
        {
          name: "index.html",
          content: "<html><body>Hello</body></html>",
          mimeType: "text/html",
        },
      ],
    });

    await page.goto("/");
    await expect(page.getByText("My Cool App")).toBeVisible();
    await expect(page.getByText("An awesome app for testing")).toBeVisible();

    // Click the card to navigate to app page
    await page.getByText("My Cool App").click();
    await page.waitForURL(`/apps/${id}`);
  });
});
