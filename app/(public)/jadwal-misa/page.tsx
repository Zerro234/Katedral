import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { AlertCircle } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import JadwalMisaClient from "./JadwalMisaClient";

export const dynamic = "force-dynamic";

export default async function JadwalMisaPage() {
  const allMasses = await db.select().from(contents).where(eq(contents.type, "MASS_SCHEDULE"));

  return (
    <div className="min-h-screen" style={{ background: "#FAF7F2" }}>

      {/* Page Header */}
      <div className="py-16" style={{ background: "#F5F0E8", borderBottom: "1px solid #E8E0D0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="none">
            <p className="section-label mb-3">Paroki Katedral Santo Yosef</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
              Jadwal Misa
            </h1>
            <p className="text-[16px] max-w-xl mx-auto" style={{ color: "#6B5744" }}>
              Jadwal perayaan Ekaristi mingguan dan harian di Katedral Santo Yosef Pontianak.
            </p>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-14">

        {/* Info Banner */}
        <ScrollReveal delay={100}>
          <div className="flex gap-3.5 p-5 rounded-xl mb-10" style={{ background: "#FDF3D0", border: "1px solid #E8D070" }}>
            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" style={{ color: "#B8960C" }} />
            <div>
              <h4 className="font-bold text-[14px] mb-1" style={{ color: "#2C1F14" }}>Informasi Penting</h4>
              <p className="text-[13px] leading-relaxed" style={{ color: "#6B5744" }}>
                Jadwal di bawah adalah jadwal reguler. Pada hari raya besar (Paskah, Natal, Pekan Suci), jadwal dapat berubah. Pantau pengumuman di halaman berita.
              </p>
            </div>
          </div>
        </ScrollReveal>

        <ScrollReveal delay={200}>
          <JadwalMisaClient masses={allMasses} />
        </ScrollReveal>

      </div>
    </div>
  );
}
