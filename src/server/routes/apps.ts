import { Hono } from "hono";
import { uuidv7 } from "uuidv7";
import { db } from "@/lib/db";
import { app, appFile } from "@/db/schema";

const MAX_TOTAL_SIZE = 50 * 1024 * 1024; // 50MB

const appsRoute = new Hono().post("/", async (c) => {
  const body = await c.req.parseBody({ all: true });

  const title = body.title;
  if (typeof title !== "string" || title.length < 1 || title.length > 100) {
    return c.json({ error: "title must be between 1 and 100 characters" }, 400);
  }

  const description = body.description;
  if (description !== undefined && typeof description !== "string") {
    return c.json({ error: "description must be a string" }, 400);
  }
  if (typeof description === "string" && description.length > 500) {
    return c.json({ error: "description must be at most 500 characters" }, 400);
  }

  const rawFiles = body.files;
  const files: File[] = [];
  if (Array.isArray(rawFiles)) {
    for (const f of rawFiles) {
      if (f instanceof File) files.push(f);
    }
  } else if (rawFiles instanceof File) {
    files.push(rawFiles);
  }

  if (files.length === 0) {
    return c.json({ error: "At least one file is required" }, 400);
  }

  // Validate files
  let totalSize = 0;
  let hasIndexHtml = false;

  for (const file of files) {
    const filename = file.name;
    if (!filename || filename.startsWith("/")) {
      return c.json({ error: `Invalid filename: "${filename}"` }, 400);
    }
    if (filename === "index.html") {
      hasIndexHtml = true;
    }
    totalSize += file.size;
  }

  if (!hasIndexHtml) {
    return c.json({ error: "index.html is required" }, 400);
  }

  if (totalSize > MAX_TOTAL_SIZE) {
    return c.json({ error: "Total file size exceeds 50MB limit" }, 400);
  }

  const appId = uuidv7();
  const now = Date.now();

  await db.insert(app).values({
    id: appId,
    title,
    description: typeof description === "string" ? description : "",
    createdAt: now,
  });

  for (const file of files) {
    const buffer = Buffer.from(await file.arrayBuffer());
    await db.insert(appFile).values({
      id: uuidv7(),
      appId,
      path: file.name,
      content: buffer,
      mimeType: file.type || "application/octet-stream",
      createdAt: now,
    });
  }

  const url = new URL(`/apps/${appId}`, process.env.NEXT_PUBLIC_BASE_URL ?? c.req.url).toString();
  return c.json({ id: appId, url }, 201);
});

export default appsRoute;
