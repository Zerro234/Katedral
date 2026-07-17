import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { CalendarDays, Church, ArrowLeft, CalendarClock, MapPin } from "lucide-react";
import { notFound } from "next/navigation";
import Image from "next/image";
import { NewsPhotoGallery } from "@/components/berita/NewsPhotoGallery";
import { BeritaShareButton } from "@/components/berita/BeritaShareButton";

export const dynamic = "force-dynamic";

/**
 * Parse body field: supports both legacy plain HTML and new JSON format.
 */
function parseNewsBody(body: string | null): { html: string; images: string[]; parsedCaption?: string; parsedAuthor?: string } {
  if (!body) return { html: "", images: [], parsedCaption: "", parsedAuthor: "" };

  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && "html" in parsed) {
      return {
        html: parsed.html || "",
        images: Array.isArray(parsed.images) ? parsed.images.filter(Boolean) : [],
        parsedCaption: parsed.coverCaption || "",
        parsedAuthor: parsed.author || "", 
      };
    }
    return { html: body, images: [], parsedCaption: "" };
  } catch {
    return { html: body, images: [], parsedCaption: "" };
  }
}

export default async function BeritaDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = await params;

  const newsRecord = await db.select()
    .from(contents)
    .where(eq(contents.slug, slug))
    .limit(1);

  if (newsRecord.length === 0) {
    notFound();
  }

  const news = newsRecord[0];
  const { html, images, parsedCaption, parsedAuthor } = parseNewsBody(news.body);

  // PERBAIKAN UTAMA: Tarik data langsung dari kolom database (prioritas pertama)
  const finalAuthor = news.author || parsedAuthor || "Sekretariat Paroki";
  const finalCaption = news.imageCaption || parsedCaption || "";

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      
      {/* Header Image */}
      <div className="w-full h-72 md:h-96 bg-[#2C1F14] relative">
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1F14] to-transparent z-10" />
        <Image
          src="/bg-login.jpg"
          alt="Gereja Katedral Santo Yosef"
          fill
          className="object-cover opacity-60"
          priority
          sizes="100vw"
        />
      </div>

      {/* Content Area */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-20 pb-20">
        
        {/* Article Card */}
        <div className="bg-white rounded-xl shadow-md border border-[#DDD8D0] p-6 md:p-12">
          
          <Link href="/berita" className="inline-flex items-center gap-2 text-sm text-[#B8960C] font-bold hover:underline mb-8">
            <ArrowLeft size={16} /> Kembali ke Berita
          </Link>

          <div className="flex items-center gap-3 mb-6">
            <span className="px-3 py-1 bg-[#FFF8E1] text-[#B8960C] text-[10px] font-bold uppercase rounded-full tracking-widest">
              {news.category || "Pengumuman"}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-[#A89880] font-medium border-l border-[#DDD8D0] pl-3">
              <CalendarDays size={14} />
              <span>{new Date(news.createdAt || new Date()).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-[#3D2B1F] mb-8 leading-tight" style={{ fontFamily: "var(--font-cormorant)" }}>
            {news.title}
          </h1>

          {/* 1. MENAMPILKAN GAMBAR COVER DAN KETERANGANNYA */}
          {news.imageUrl && (
            <div className="mb-10">
              <div className="relative w-full h-[300px] md:h-[450px] rounded-2xl overflow-hidden shadow-sm border border-[#EDE8DF] bg-[#F5F0E8]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={news.imageUrl}
                  alt={news.title || "Cover Berita"}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              
              {/* PERBAIKAN: Variabel dipanggil menggunakan finalCaption */}
              {finalCaption && (
                <p className="mt-3 text-sm md:text-base italic text-[#6B5744] text-left leading-relaxed">
                  {finalCaption}
                </p>
              )}
            </div>
          )}

          {/* 2. KOTAK INFO TANGGAL/LOKASI */}
          {news.type !== "NEWS" && (news.eventDate || news.location) && (
            <div className="mb-8 p-5 bg-[#F5F0E8] rounded-xl border border-[#EDE8DF] flex flex-col sm:flex-row flex-wrap gap-4 sm:gap-8">
              {news.eventDate && (
                <div className="flex items-center gap-2.5 text-sm text-[#4A3728]">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <CalendarClock size={16} className="text-[#B8960C]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#A89880] uppercase tracking-wider mb-0.5">
                      {news.type === "MASS_SCHEDULE" ? "Waktu Pelaksanaan" : "Tanggal Acara"}
                    </div>
                    <div className="font-semibold">
                      {news.eventDate.includes("-") 
                        ? new Date(news.eventDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
                        : news.eventDate}
                    </div>
                  </div>
                </div>
              )}
              {news.location && (
                <div className="flex items-center gap-2.5 text-sm text-[#4A3728]">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
                    <MapPin size={16} className="text-[#B8960C]" />
                  </div>
                  <div>
                    <div className="text-[10px] font-bold text-[#A89880] uppercase tracking-wider mb-0.5">
                      Lokasi
                    </div>
                    <div className="font-semibold">{news.location}</div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 3. ISI KONTEN */}
          <div
            className="whitespace-pre-wrap prose prose-stone max-w-none text-[#4A3728] prose-p:leading-relaxed prose-p:mb-5 prose-a:text-[#B8960C] prose-a:font-semibold prose-headings:font-bold prose-headings:text-[#3D2B1F] prose-strong:text-[#3D2B1F] prose-li:mb-1"
            dangerouslySetInnerHTML={{ __html: html }}
          />

          {/* Dokumentasi Foto */}
          {images.length > 0 && (
            <NewsPhotoGallery images={images} title={news.title || undefined} />
          )}

          {/* Share & Footer */}
          <div className="mt-12 pt-8 border-t border-[#EDE8DF] flex justify-between items-center">
            <div className="text-sm font-medium text-[#A89880]">
              {/* PERBAIKAN: Variabel dipanggil menggunakan finalAuthor */}
              Dipublikasikan oleh: <strong className="text-[#3D2B1F]">{finalAuthor}</strong>
            </div>
            <BeritaShareButton title={news.title} />
          </div>

        </div>
            
      </div>

    </div>
  );
}