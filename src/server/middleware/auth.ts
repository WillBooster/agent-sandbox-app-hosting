import { createMiddleware } from "hono/factory";

export const authMiddleware = createMiddleware(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return c.json({ error: "API_KEY is not configured" }, 500);
  }

  if (authHeader !== `Bearer ${apiKey}`) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  await next();
});
