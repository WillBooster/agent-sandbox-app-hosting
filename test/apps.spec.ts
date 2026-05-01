import { expect, test } from "@playwright/test";
import { uploadApp } from "./helpers";

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

  test("builds returned URL from NEXT_PUBLIC_BASE_URL", async ({ request }) => {
    const response = await request.post("/api/apps", {
      multipart: {
        title: "Configured Base URL App",
        files: {
          name: "index.html",
          mimeType: "text/html",
          buffer: Buffer.from("<html></html>"),
        },
      },
    });

    expect(response.status()).toBe(201);
    const result = (await response.json()) as { id: string; url: string };
    expect(result.url).toBe(`${process.env.NEXT_PUBLIC_BASE_URL}/apps/${result.id}`);
  });

  test("accepts request without auth", async ({ request }) => {
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
    expect(response.status()).toBe(201);
  });

  test("rejects request without index.html", async ({ request }) => {
    const response = await request.post("/api/apps", {
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
