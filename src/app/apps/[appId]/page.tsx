import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import { db } from "@/lib/db";
import { app } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function AppPage({ params }: { params: Promise<{ appId: string }> }) {
  const { appId } = await params;
  const found = await db.query.app.findFirst({
    where: eq(app.id, appId),
  });

  if (!found) {
    notFound();
  }

  return (
    <div className="h-screen flex flex-col">
      <header className="bg-white border-b border-gray-200 px-4 py-2 flex items-center gap-3 shrink-0">
        <Link href="/" className="text-gray-500 hover:text-gray-700">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-sm font-semibold text-gray-900 truncate">{found.title}</h1>
      </header>
      <iframe
        src={`/api/apps/${appId}/files/index.html`}
        sandbox="allow-scripts allow-same-origin allow-modals allow-forms allow-downloads allow-popups"
        className="flex-1 w-full border-0"
        title={found.title}
      />
    </div>
  );
}
