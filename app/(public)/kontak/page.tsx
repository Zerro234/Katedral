import type { Metadata } from "next";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic"; // always fetch fresh from DB

export const metadata: Metadata = {
  title: "Kontak & Lokasi",
  description:
    "Informasi kontak, alamat, jam operasional sekretariat, dan jadwal misa Paroki Katedral Santo Yosef Pontianak.",
};

const SETTINGS_SLUG = "church-settings-v1";

const DEFAULT_INFO = {
  name: "Katedral Santo Yosef Pontianak",
  address: "Jl. Pattimura Indah No. 195, Darat Sekip, Kec. Pontianak Kota, Kota Pontianak, Kalimantan Barat 78011",
  phone: "+62 851-7544-7819",
  email: "skrt.kat.ptk@gmail.com",
  operationalHours: "Senin–Jumat: 08.00–12.00 dan 13.00–16.00\nSabtu: 08.00–12.00\nMinggu & Hari Raya: Tutup",
};

async function getChurchInfo() {
  try {
    const record = await db
      .select({ body: contents.body })
      .from(contents)
      .where(eq(contents.slug, SETTINGS_SLUG))
      .limit(1);

    if (record.length === 0) return DEFAULT_INFO;
    const settings = JSON.parse(record[0].body ?? "{}");
    return { ...DEFAULT_INFO, ...settings };
  } catch {
    return DEFAULT_INFO;
  }
}

export default async function KontakPage() {
  const info = await getChurchInfo();

  const operationalLines = (info.operationalHours || "").split("\n").filter(Boolean);

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Header */}
      <div className="py-16" style={{ background: "#F5F0E8", borderBottom: "1px solid #E8E0D0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="none">
            <p className="section-label mb-3">Paroki Katedral Santo Yosef</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-4"
                style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
              Kontak &amp; Lokasi
            </h1>
            <p className="text-[16px] max-w-xl mx-auto" style={{ color: "#6B5744" }}>
              Kami dengan senang hati menerima kunjungan dan pertanyaan Anda. Berikut informasi kontak dan lokasi paroki.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-16 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column — Contact Cards */}
        <div className="space-y-4 lg:col-span-1">

          {/* Address */}
          <ScrollReveal delay={0}>
            <div className="bg-white rounded-xl border border-[#DDD8D0] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#FFF8E1] rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-[#B8960C]" />
                </div>
                <h3 className="font-bold text-[#3D2B1F] text-sm uppercase tracking-wider">Alamat</h3>
              </div>
              <p className="text-[#6B6560] text-sm leading-relaxed">{info.address}</p>
            </div>
          </ScrollReveal>

          {/* Phone */}
          <ScrollReveal delay={100}>
            <div className="bg-white rounded-xl border border-[#DDD8D0] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#FFF8E1] rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-[#B8960C]" />
                </div>
                <h3 className="font-bold text-[#3D2B1F] text-sm uppercase tracking-wider">Telepon</h3>
              </div>
              <a href={`tel:${info.phone}`} className="text-[#B8960C] font-bold hover:underline">
                {info.phone}
              </a>
            </div>
          </ScrollReveal>

          {/* Email */}
          <ScrollReveal delay={200}>
            <div className="bg-white rounded-xl border border-[#DDD8D0] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#FFF8E1] rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-[#B8960C]" />
                </div>
                <h3 className="font-bold text-[#3D2B1F] text-sm uppercase tracking-wider">Email</h3>
              </div>
              <a href={`mailto:${info.email}`} className="text-[#B8960C] font-bold hover:underline break-all">
                {info.email}
              </a>
            </div>
          </ScrollReveal>

          {/* Jam Operasional */}
          <ScrollReveal delay={300}>
            <div className="bg-white rounded-xl border border-[#DDD8D0] p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-[#FFF8E1] rounded-full flex items-center justify-center flex-shrink-0">
                  <Clock size={18} className="text-[#B8960C]" />
                </div>
                <h3 className="font-bold text-[#3D2B1F] text-sm uppercase tracking-wider">Jam Sekretariat</h3>
              </div>
              <div className="space-y-1">
                {operationalLines.map((line: string, i: number) => (
                  <p key={i} className="text-[#6B6560] text-sm">{line}</p>
                ))}
              </div>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column — Map */}
        <div className="lg:col-span-2 space-y-6">
          <ScrollReveal direction="right" delay={150} duration={800}>
            <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden h-full min-h-[450px]">
              <div className="px-5 py-4 border-b border-[#EDE8DF] bg-[#FAF7F2]">
                <h3 className="font-bold text-[#3D2B1F] text-sm uppercase tracking-wider">Peta Lokasi</h3>
                <p className="text-xs text-[#A89880] mt-0.5">{info.name}</p>
              </div>
              <div className="relative w-full h-full min-h-96">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d993.7633700785!2d109.33882837573483!3d-0.02657003610827697!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f17!3m3!1m2!1s0x2e1d585096004cfb%3A0x970b0a544ceba22f!2sGereja%20Katedral%20Pontianak%2C%20Santo%20Yosef!5e0!3m2!1sid!2sid!4v1748440000000!5m2!1sid!2sid"
                  width="100%"
                  height="100%"
                  className="absolute inset-0 w-full h-full border-0"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Lokasi Katedral Santo Yosef Pontianak"
                />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </div>
  );
}
