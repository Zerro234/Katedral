import type { Metadata } from "next";
import { Images } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { GalleryCard } from "@/components/galeri/GalleryCard";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galeri Foto",
  description:
    "Galeri foto kegiatan dan dokumentasi Paroki Katedral Santo Yosef Pontianak — misa, perayaan, dan momen istimewa.",
};

interface GalleryPhoto {
  id: string;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  images?: string[];
  createdAt: Date | null;
}

async function getPhotos(): Promise<GalleryPhoto[]> {
  try {
    const rows = await db
      .select({
        id: contents.id,
        title: contents.title,
        body: contents.body,
        imageUrl: contents.imageUrl,
        createdAt: contents.createdAt,
      })
      .from(contents)
      .where(eq(contents.type, "GALLERY"))
      .orderBy(desc(contents.createdAt));

    // Parse body to extract multiple images if stored as JSON
    return rows.map((row) => {
      let images: string[] = [];
      try {
        const parsed = JSON.parse(row.body ?? "{}");
        if (Array.isArray(parsed.images) && parsed.images.length > 0) {
          images = parsed.images.filter((u: unknown) => typeof u === "string" && u);
        }
      } catch {
        // body is plain text caption — not JSON
      }
      // Always include primary imageUrl as first if not already present
      if (row.imageUrl && !images.includes(row.imageUrl)) {
        images = [row.imageUrl, ...images];
      }
      return { ...row, images };
    });
  } catch {
    return [];
  }
}

// Masonry layout: split into 3 columns
function splitIntoColumns<T>(items: T[], cols: number): T[][] {
  const columns: T[][] = Array.from({ length: cols }, () => []);
  items.forEach((item, i) => columns[i % cols].push(item));
  return columns;
}

export default async function GaleriPage() {
  const photos = await getPhotos();
  const totalImages = photos.reduce((sum, p) => sum + (p.images?.length ?? 1), 0);
  const columns = splitIntoColumns(photos, 3);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="py-16" style={{ background: "#F5F0E8", borderBottom: "1px solid #E8E0D0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="none">
            <p className="section-label mb-3">Paroki Katedral Santo Yosef</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-4"
                style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
              Galeri Foto
            </h1>
            <p className="text-[16px] max-w-xl mx-auto" style={{ color: "#6B5744" }}>
              Momen-momen berharga dari kegiatan dan perayaan di Paroki Katedral Santo Yosef Pontianak.
            </p>
            {photos.length > 0 && (
              <p className="text-sm mt-3" style={{ color: "#A89880" }}>
                {photos.length} album · {totalImages} foto tersedia
              </p>
            )}
          </ScrollReveal>
        </div>
      </div>

      {/* Gallery Content */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        {photos.length === 0 ? (
          <ScrollReveal direction="none">
            <div className="text-center py-24">
              <div className="inline-flex w-20 h-20 bg-[#FFF8E1] border border-[#B8960C]/20 rounded-full items-center justify-center mb-6">
                <Images size={36} className="text-[#B8960C]" />
              </div>
              <h2 className="text-2xl font-bold text-[#3D2B1F] mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
                Belum Ada Foto
              </h2>
              <p className="text-[#6B6560] text-sm max-w-sm mx-auto">
                Galeri foto akan segera diisi oleh tim sekretariat paroki. Kunjungi kembali nanti.
              </p>
            </div>
          </ScrollReveal>
        ) : (
          <ScrollReveal delay={100}>
            <>
              {/* Masonry Grid — desktop 3 cols, tablet 2 cols, mobile 1 col */}
              <div className="hidden md:flex gap-5 items-start">
                {columns.map((col, colIdx) => (
                  <div key={colIdx} className="flex-1 space-y-5">
                    {col.map((photo) => (
                      <GalleryCard key={photo.id} photo={photo} />
                    ))}
                  </div>
                ))}
              </div>

              {/* Mobile: single column */}
              <div className="flex flex-col gap-5 md:hidden">
                {photos.map((photo) => (
                  <GalleryCard key={photo.id} photo={photo} />
                ))}
              </div>
            </>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}
