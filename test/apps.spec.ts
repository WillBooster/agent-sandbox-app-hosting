import { expect, test } from "@playwright/test";
import { TEST_API_KEY, uploadApp } from "./helpers";

test.describe("POST /api/apps", () => {
  test("uploads an app successfully", async ({ request }) => {
    const result = await uploadApp(request, {
      title: "Test App",
      description: "A test application",
      files: [
        {
          name: "index.html",
          content: "<html><body><h1>Hello</h1></body></html>",
          mimeType: "text/html",
        },
      ],
    });

    expect(result.id).toBeTruthy();
    expect(result.url).toContain(`/apps/${result.id}`);
  });

  test("rejects request without auth", async ({ request }) => {
    const response = await request.post("/api/apps", {
      multipart: {
        title: "No Auth App",
        files: {
          name: "index.html",
          mimeType: "text/html",
          buffer: Buffer.from("<html></html>"),
        },
      },
    });
    expect(response.status()).toBe(401);
  });

  test("rejects request with wrong auth", async ({ request }) => {
    const response = await request.post("/api/apps", {
      headers: { Authorization: "Bearer wrong-key" },
      multipart: {
        title: "Bad Auth App",
        files: {
          name: "index.html",
          mimeType: "text/html",
          buffer: Buffer.from("<html></html>"),
        },
      },
    });
    expect(response.status()).toBe(401);
  });

  test("rejects request without index.html", async ({ request }) => {
    const response = await request.post("/api/apps", {
      headers: { Authorization: `Bearer ${TEST_API_KEY}` },
      multipart: {
        title: "No Index App",
        files: {
          name: "style.css",
          mimeType: "text/css",
          buffer: Buffer.from("body {}"),
        },
      },
    });
    expect(response.status()).toBe(400);
  });

  test("rejects request without title", async ({ request }) => {
    const response = await request.post("/api/apps", {
      headers: { Authorization: `Bearer ${TEST_API_KEY}` },
      multipart: {
        files: {
          name: "index.html",
          mimeType: "text/html",
          buffer: Buffer.from("<html></html>"),
        },
      },
    });
    expect(response.status()).toBe(400);
  });
});
