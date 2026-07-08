import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import EditKontenClient from "./EditKontenClient";

export default async function EditKontenPage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return null;

  const { id } = await params;

  const record = await db.select().from(contents).where(eq(contents.id, id)).limit(1);
  if (record.length === 0) notFound();

  const content = record[0];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/konten" className="flex items-center gap-1.5 px-3 py-1.5 border border-[#DDD8D0] rounded-full text-xs font-semibold text-[#6B6560] hover:bg-[#FAF7F2] transition-colors">
          <ArrowLeft size={14} /> Kembali
        </Link>
        <h1 className="text-2xl font-bold text-[#3D2B1F]" style={{ fontFamily: "var(--font-cormorant)" }}>
          Edit Konten
        </h1>
      </div>
      <EditKontenClient content={content} />
    </div>
  );
}
