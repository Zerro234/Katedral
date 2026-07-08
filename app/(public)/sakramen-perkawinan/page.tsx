import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function SakramenPerkawinanPage() {
  const timelineSteps = [
    { title: "Pendaftaran Awal", desc: "Calon mempelai melapor ke Sekretariat Paroki minimal 6 bulan sebelum rencana pernikahan.", primary: true },
    { title: "Kursus Persiapan Perkawinan (KPP)", desc: "Mengikuti pembekalan selama 2-3 hari untuk memahami hakikat perkawinan Katolik." },
    { title: "Administrasi & Pembayaran", desc: "Penyelesaian biaya administrasi dan penentuan tanggal penyelidikan kanonik." },
    { title: "Penyelidikan Kanonik", desc: "Wawancara khusus antara calon mempelai dengan Pastor Paroki." },
    { title: "Penyerahan Dokumen", desc: "Melengkapi seluruh berkas administratif (Surat Baptis terbaru, KTP, dll)." },
    { title: "Pengumuman Perkawinan", desc: "Diumumkan di Gereja selama 3 minggu berturut-turut untuk meminta dukungan doa umat." },
    { title: "Gladi Bersih", desc: "Latihan teknis upacara pemberkatan bersama saksi dan petugas liturgi." },
    { title: "Pemberkatan & Pengambilan Surat", desc: "Hari bahagia peneguhan janji suci dan serah terima dokumen resmi gereja.", primary: true },
  ];

  const dokumenKatolik = [
    "Surat Baptis Terbaru (Maksimal 6 bulan)",
    "Sertifikat Kursus Persiapan Perkawinan",
    "Fotokopi KTP & Kartu Keluarga",
  ];

  const dokumenNonKatolik = [
    "Surat Keterangan Belum Menikah (Lurah)",
    "Fotokopi Akte Kelahiran",
    "2 Orang Saksi (Dewasa & Berakal Budi)",
  ];

  return (
    <div className="flex flex-col">

      {/* ═══════════════════ HEADER ═══════════════════ */}
      <div className="py-16" style={{ background: "#F5F0E8", borderBottom: "1px solid #E8E0D0" }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <ScrollReveal direction="none">
            <p className="section-label mb-3">Paroki Katedral Santo Yosef</p>
            <h1 className="text-5xl md:text-6xl font-bold mb-4"
                style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
              Sakramen Perkawinan
            </h1>
            <p className="text-[16px] max-w-xl mx-auto italic" style={{ fontFamily: "var(--font-cormorant)", color: "#6B5744" }}>
              &quot;Demikianlah mereka bukan lagi dua, melainkan satu. Karena itu, apa yang telah dipersatukan Allah, tidak boleh diceraikan manusia.&quot;
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* ═══════════════════ MAIN CONTENT ═══════════════════ */}
      <div className="max-w-[900px] mx-auto px-6 py-20 space-y-32">

        {/* ═══════════════════ TIMELINE ═══════════════════ */}
        <section>
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-[#3D2B1F]" style={{ fontFamily: "var(--font-cormorant)" }}>
                Alur Proses Perkawinan
              </h2>
              <div className="h-[2px] w-24 bg-[#B8960C]/50 mx-auto" />
            </div>
          </ScrollReveal>
          <div className="relative space-y-0">
            {/* Vertical connector line */}
            <div className="absolute left-6 top-4 bottom-4 w-[1px] border-l border-dashed border-[#DDD8D0]" />

            {timelineSteps.map((step, i) => (
              <ScrollReveal key={i} delay={i * 80}>
                <div className={`relative flex gap-8 ${i < timelineSteps.length - 1 ? "pb-12" : "pb-0"} group`}>
                  <div
                    className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-bold text-xl ${
                      step.primary
                        ? "bg-[#B8960C] text-white"
                        : "bg-[#EDE8DF] border border-[#DDD8D0] text-[#6B6560]"
                    }`}
                    style={{ fontFamily: "var(--font-cormorant)" }}
                  >
                    {i + 1}
                  </div>
                  <div className="pt-2">
                    <h4 className="text-xl font-bold text-[#3D2B1F]">{step.title}</h4>
                    <p className="text-[#6B6560] mt-1">{step.desc}</p>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>

        {/* ═══════════════════ DOKUMEN ═══════════════════ */}
        <section>
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-[#3D2B1F]" style={{ fontFamily: "var(--font-cormorant)" }}>
                Dokumen yang Diperlukan
              </h2>
              <p className="text-[#6B6560] italic" style={{ fontFamily: "var(--font-cormorant)" }}>
                Pastikan dokumen asli dibawa saat verifikasi di sekretariat.
              </p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-12">
            {/* Calon Katolik */}
            <ScrollReveal delay={0}>
              <div className="bg-[#F5F0E8] p-8 rounded-2xl">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-[#B8960C]" style={{ fontFamily: "var(--font-cormorant)" }}>
                    Calon Katolik
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-bold uppercase tracking-wider rounded">
                    Wajib
                  </span>
                </div>
                <ul className="space-y-6">
                  {dokumenKatolik.map((doc, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="text-[#B8960C] mt-0.5 flex-shrink-0" size={20} />
                      <p className="text-[#6B6560]">{doc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
            {/* Calon Non-Katolik */}
            <ScrollReveal delay={150}>
              <div className="bg-[#F5F0E8] p-8 rounded-2xl border border-[#DDD8D0]">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-2xl font-bold text-[#6B6560]" style={{ fontFamily: "var(--font-cormorant)" }}>
                    Calon Non-Katolik
                  </h3>
                  <span className="px-3 py-1 bg-[#EDE8DF] text-[#6B6560] text-[10px] font-bold uppercase tracking-wider rounded">
                    Menyesuaikan
                  </span>
                </div>
                <ul className="space-y-6">
                  {dokumenNonKatolik.map((doc, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <CheckCircle2 className="text-[#B8960C] mt-0.5 flex-shrink-0" size={20} />
                      <p className="text-[#6B6560]">{doc}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════ BIAYA ═══════════════════ */}
        <section>
          <ScrollReveal>
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4 text-[#3D2B1F]" style={{ fontFamily: "var(--font-cormorant)" }}>
                Biaya Administrasi &amp; Stole Fee
              </h2>
              <p className="text-[#6B6560]">Kontribusi untuk pemeliharaan Gereja dan operasional Liturgi.</p>
            </div>
          </ScrollReveal>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Umat Paroki */}
            <ScrollReveal delay={0}>
              <div className="bg-white shadow-sm p-10 rounded-2xl text-center flex flex-col items-center">
                <span className="text-xs uppercase tracking-widest text-[#6B6560]/60 mb-4">Umat Paroki</span>
                <div className="text-5xl font-bold text-[#B8960C] mb-6" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Rp 1.000.000
                </div>
                <p className="text-sm text-[#6B6560] max-w-[200px] leading-relaxed">
                  Bagi mempelai yang berdomisili dan terdaftar di Paroki Katedral.
                </p>
              </div>
            </ScrollReveal>
            {/* Luar Paroki */}
            <ScrollReveal delay={150}>
              <div className="bg-white shadow-sm p-10 rounded-2xl text-center flex flex-col items-center border border-[#B8960C]/20">
                <span className="text-xs uppercase tracking-widest text-[#6B6560]/60 mb-4">Luar Paroki</span>
                <div className="text-5xl font-bold text-[#B8960C] mb-6" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Rp 2.000.000
                </div>
                <p className="text-sm text-[#6B6560] max-w-[200px] leading-relaxed">
                  Bagi mempelai yang berasal dari Paroki lain (Perlu Surat Ijin Pastor).
                </p>
              </div>
            </ScrollReveal>
          </div>
        </section>

        {/* ═══════════════════ CTA ═══════════════════ */}
        <ScrollReveal>
          <section className="bg-gradient-to-br from-[#EAE0D1] to-[#D5C6AF] text-[#3D2B1F] rounded-3xl p-12 text-center shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden relative group border border-[#D5C6AF]/50">
            {/* Decorative Icon (Wedding Rings) */}
            <div className="absolute top-[-50px] right-[-50px] opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-700">
              <svg width="300" height="300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-[#B8960C]">
                <circle cx="9" cy="12" r="5" />
                <circle cx="15" cy="12" r="5" />
              </svg>
            </div>
            <h2
              className="text-4xl font-bold mb-6 relative z-10"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Siap Memulai Perjalanan Suci Anda?
            </h2>
            <p className="text-lg opacity-90 mb-10 max-w-xl mx-auto relative z-10 font-light text-[#6B5744]">
              Daftarkan pernikahan Anda secara online. Login atau buat akun terlebih dahulu untuk memulai proses pendaftaran.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-10">
              <Link
                href="/daftar"
                className="bg-[#B8960C] text-white px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#9A7A00] hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                Daftar Pernikahan Sekarang
              </Link>
              <Link
                href="/masuk"
                className="bg-white border border-[#B8960C] text-[#B8960C] px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#B8960C] hover:text-white hover:-translate-y-1 hover:shadow-lg transition-all duration-300"
              >
                Masuk ke Akun
              </Link>
            </div>
            <p className="text-[12px] italic opacity-80 mt-6 relative z-10 text-[#6B5744]">
              Sudah memiliki akun?{" "}
              <Link href="/masuk" className="underline hover:text-[#B8960C] transition-colors">
                Login
              </Link>{" "}
              untuk langsung melanjutkan pendaftaran Anda.
            </p>
          </section>
        </ScrollReveal>

      </div>
    </div>
  );
}
