import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, join, relative } from "node:path";
import { eq } from "drizzle-orm";
import { lookup } from "mime-types";
import { uuidv7 } from "uuidv7";

import { db } from "@/lib/db";
import { app, appFile } from "@/db/schema";

const appEnv = process.env.MISE_ENV;
if (appEnv === "production") {
  console.log("Skipping seed in production environment.");
  process.exit(0);
}

interface SeedAppDef {
  id: string;
  dir: string;
  title: string;
  description: string;
}

const SEEDS_DIR = join(import.meta.dirname, "seeds");

const SEED_APPS: SeedAppDef[] = [
  {
    id: "00000000-0000-7000-8000-000000000001",
    dir: "counter",
    title: "カウンターアプリ",
    description: "ボタンをクリックするとカウントが増減するシンプルなアプリです。",
  },
  {
    id: "00000000-0000-7000-8000-000000000002",
    dir: "todo",
    title: "TODOリスト",
    description:
      "タスクの追加・完了・削除ができるTODOリストアプリです。データはローカルストレージに保存されます。",
  },
  {
    id: "00000000-0000-7000-8000-000000000003",
    dir: "clock",
    title: "デジタル時計",
    description: "現在時刻をリアルタイムで表示するデジタル時計です。",
  },
];

function collectFiles(dir: string): { path: string; content: Buffer; mimeType: string }[] {
  const files: { path: string; content: Buffer; mimeType: string }[] = [];

  function walk(currentDir: string): void {
    for (const entry of readdirSync(currentDir)) {
      const fullPath = join(currentDir, entry);
      if (statSync(fullPath).isDirectory()) {
        walk(fullPath);
      } else {
        const relPath = relative(dir, fullPath);
        files.push({
          path: relPath,
          content: readFileSync(fullPath),
          mimeType: lookup(basename(fullPath)) || "application/octet-stream",
        });
      }
    }
  }

  walk(dir);
  return files;
}

async function upsertApp(seedApp: SeedAppDef): Promise<void> {
  const existing = await db
    .select({ id: app.id })
    .from(app)
    .where(eq(app.id, seedApp.id))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(app)
      .set({ title: seedApp.title, description: seedApp.description })
      .where(eq(app.id, seedApp.id));
  } else {
    await db.insert(app).values({
      id: seedApp.id,
      title: seedApp.title,
      description: seedApp.description,
      createdAt: Date.now(),
    });
  }

  await db.delete(appFile).where(eq(appFile.appId, seedApp.id));

  const appDir = join(SEEDS_DIR, seedApp.dir);
  for (const file of collectFiles(appDir)) {
    await db.insert(appFile).values({
      id: uuidv7(),
      appId: seedApp.id,
      path: file.path,
      content: file.content,
      mimeType: file.mimeType,
      createdAt: Date.now(),
    });
  }

  console.log(`Seeded app: ${seedApp.title}`);
}

async function main(): Promise<void> {
  for (const seedApp of SEED_APPS) {
    await upsertApp(seedApp);
  }
  console.log("Seed completed successfully.");
}

try {
  await main();
} catch (error: unknown) {
  console.error(error);
  process.exit(1);
}
