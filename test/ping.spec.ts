import { expect, test } from "@playwright/test";

test.describe("/api/ping", () => {
  test("returns ok status", async ({ request }) => {
    const response = await request.get("/api/ping");

    expect(response.status()).toBe(200);
    const data = (await response.json()) as { status: string };
    expect(data).toEqual({ status: "ok" });
  });
});
