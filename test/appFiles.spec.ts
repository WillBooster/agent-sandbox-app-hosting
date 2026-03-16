import { expect, test } from "@playwright/test";
import { uploadApp } from "./helpers";

test.describe("GET /api/apps/:appId/files/*", () => {
  test("serves index.html by default", async ({ request }) => {
    const htmlContent = "<html><body><h1>Test</h1></body></html>";
    const { id } = await uploadApp(request, {
      title: "File Serve Test",
      files: [{ name: "index.html", content: htmlContent, mimeType: "text/html" }],
    });

    const response = await request.get(`/api/apps/${id}/files/index.html`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(response.headers()["cache-control"]).toBe("public, max-age=3600");
    expect(await response.text()).toBe(htmlContent);
  });

  test("serves specific files by path", async ({ request }) => {
    const cssContent = "body { color: red; }";
    const { id } = await uploadApp(request, {
      title: "Multi File Test",
      files: [
        { name: "index.html", content: "<html></html>", mimeType: "text/html" },
        { name: "css/style.css", content: cssContent, mimeType: "text/css" },
      ],
    });

    const response = await request.get(`/api/apps/${id}/files/css/style.css`);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/css");
    expect(await response.text()).toBe(cssContent);
  });

  test("returns 404 for non-existent file", async ({ request }) => {
    const { id } = await uploadApp(request, {
      title: "404 Test",
      files: [{ name: "index.html", content: "<html></html>", mimeType: "text/html" }],
    });

    const response = await request.get(`/api/apps/${id}/files/nonexistent.js`);
    expect(response.status()).toBe(404);
  });

  test("returns 404 for non-existent app", async ({ request }) => {
    const response = await request.get("/api/apps/nonexistent-id/files/");
    expect(response.status()).toBe(404);
  });
});
