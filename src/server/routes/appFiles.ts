import { Hono } from "hono";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { appFile } from "@/db/schema";

const appFilesRoute = new Hono().get("/:appId/files/*", async (c) => {
  const appId = c.req.param("appId");

  // Extract file path from the URL after /files/
  const prefix = `/apps/${appId}/files/`;
  const pathIndex = c.req.path.indexOf(prefix);
  const filePath = pathIndex >= 0 ? c.req.path.slice(pathIndex + prefix.length) : "";
  const resolvedPath = filePath === "" ? "index.html" : filePath;

  const file = await db.query.appFile.findFirst({
    where: and(eq(appFile.appId, appId), eq(appFile.path, resolvedPath)),
  });

  if (!file) {
    return c.json({ error: "File not found" }, 404);
  }

  c.header("Content-Type", file.mimeType);
  c.header("Cache-Control", "public, max-age=3600");
  return c.body(new Uint8Array(file.content));
});

export default appFilesRoute;
