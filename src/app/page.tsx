import Link from "next/link";
import { desc } from "drizzle-orm";
import { AppWindow } from "lucide-react";
import { db } from "@/lib/db";
import { app } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const apps = await db.select().from(app).orderBy(desc(app.createdAt));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-2">
          <AppWindow className="w-6 h-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-900">agent-sandbox-app-hosting</h1>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {apps.length === 0 ? (
          <div className="text-center py-20 text-gray-500">
            <AppWindow className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-lg">まだアプリがありません</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {apps.map((a) => (
              <Link
                key={a.id}
                href={`/apps/${a.id}`}
                className="block bg-white rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow"
              >
                <h2 className="text-lg font-semibold text-gray-900 truncate">{a.title}</h2>
                {a.description && (
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{a.description}</p>
                )}
                <p className="mt-3 text-xs text-gray-400">
                  {new Date(a.createdAt).toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" })}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
