import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { inArray, desc } from "drizzle-orm";
import Link from "next/link";
import { CalendarDays, Church } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import BeritaListClient from "./BeritaListClient";

export const dynamic = "force-dynamic";

export default async function BeritaPage() {
  const allNews = await db.select()
    .from(contents)
    .where(inArray(contents.type, ["NEWS", "ANNOUNCEMENT"]))
    .orderBy(desc(contents.createdAt));

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>
      {/* Header */}
      <div className="py-16" style={{ background: "#F5F0E8", borderBottom: "1px solid #E8E0D0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="none">
            <p className="section-label mb-3">Paroki Katedral Santo Yosef</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-4"
                style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
              Berita &amp; Pengumuman
            </h1>
            <p className="text-[16px] max-w-xl mx-auto" style={{ color: "#6B5744" }}>
              Informasi terbaru seputar kegiatan, agenda paroki, dan pengumuman sakramen.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <ScrollReveal delay={100}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <BeritaListClient allNews={allNews} />
        </div>
      </ScrollReveal>
    </div>
  );
}
