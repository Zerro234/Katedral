import { db } from "@/lib/db";
import { contents, coupleProfiles, marriageApplications } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calendar, Newspaper, BookOpen, MapPin, CalendarDays, ArrowUpRight } from "lucide-react";
import { ScrollReveal } from "@/components/ui/scroll-reveal";
import { WeddingAnnouncementsClient } from "@/components/WeddingAnnouncementsClient";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const latestNews = await db.select()
    .from(contents)
    .where(eq(contents.type, "NEWS"))
    .orderBy(desc(contents.createdAt))
    .limit(3);

  const upcomingAgendas = await db.select()
    .from(contents)
    .where(eq(contents.category, "Pengumuman"))
    .orderBy(desc(contents.createdAt))
    .limit(3);

  const allMasses = await db.select()
    .from(contents)
    .where(eq(contents.type, "MASS_SCHEDULE"));

  const allStage5Weddings = await db.select({
    groomName: coupleProfiles.groomName,
    brideName: coupleProfiles.brideName,
    weddingDate: marriageApplications.weddingDate,
    couplePhoto: coupleProfiles.couplePhoto,
    preferredWeddingTime: coupleProfiles.preferredWeddingTime,
  })
    .from(marriageApplications)
    .innerJoin(coupleProfiles, eq(marriageApplications.coupleProfileId, coupleProfiles.id))
    .where(eq(marriageApplications.currentStage, 5));

  const HARI_ORDER = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const weekdays = HARI_ORDER;

  const getDayName = (rawStr: string | undefined | null): string => {
    if (!rawStr) return "";
    const prefix = rawStr.split("::")[0];
    const dateObj = new Date(prefix);
    if (!isNaN(dateObj.getTime())) {
      return ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][dateObj.getDay()];
    }
    return prefix;
  };

  const massesHarian = allMasses.filter(m => m.category?.endsWith("::Harian"));

  // All harian rows
  const harianRows = massesHarian.map(m => ({
    day: getDayName(m.category),
    time: m.eventDate || "",
    title: m.title || "",
  }));

  // === Misa Harian (Senin–Jumat) ===
  const weekdayRows = harianRows.filter(r => weekdays.includes(r.day));
  const weekdayByTime = new Map<string, { days: string[]; titles: Set<string> }>();
  for (const r of weekdayRows) {
    const existing = weekdayByTime.get(r.time);
    if (existing) {
      if (!existing.days.includes(r.day)) existing.days.push(r.day);
      existing.titles.add(r.title);
    } else {
      weekdayByTime.set(r.time, { days: [r.day], titles: new Set([r.title]) });
    }
  }

  type ScheduleRow = { label: string; time: string; subtitle?: string; key: string };

  const groupedHarian: ScheduleRow[] = [];
  for (const [time, { days, titles }] of weekdayByTime) {
    days.sort((a, b) => weekdays.indexOf(a) - weekdays.indexOf(b));
    const label = days.length === 5 ? "Senin – Jumat" : days.length > 1 ? days.join(", ") : days[0];
    const titleArr = Array.from(titles).filter(t => t !== "Misa Harian");
    const subtitle = titleArr.length > 0 ? titleArr.join(", ") : undefined;
    groupedHarian.push({ label, time: `${time} WIB`, subtitle, key: `h-${time}-${label}` });
  }

  // === Misa Mingguan (Sabtu & Minggu) ===
  const weekendRows = harianRows.filter(r => ["Sabtu", "Minggu"].includes(r.day));
  const groupedMingguan: ScheduleRow[] = [];

  const sabtuMasses = weekendRows.filter(r => r.day === "Sabtu");
  if (sabtuMasses.length > 0) {
    const time = sabtuMasses.map(r => r.time).join(" & ");
    groupedMingguan.push({ label: "Sabtu", time: `${time} WIB`, key: "sabtu" });
  }

  const mingguMasses = weekendRows.filter(r => r.day === "Minggu");
  if (mingguMasses.length > 0) {
    const pagi = mingguMasses.filter(r => parseInt(r.time.split(/[:.]/)[0]) < 12);
    const sore = mingguMasses.filter(r => parseInt(r.time.split(/[:.]/)[0]) >= 12);
    if (pagi.length > 0) groupedMingguan.push({ label: "Minggu Pagi", time: `${pagi.map(r => r.time).join(" & ")} WIB`, key: "minggu-pagi" });
    if (sore.length > 0) groupedMingguan.push({ label: "Minggu Sore", time: `${sore.map(r => r.time).join(" & ")} WIB`, key: "minggu-sore" });
    if (pagi.length === 0 && sore.length === 0) groupedMingguan.push({ label: "Minggu", time: `${mingguMasses.map(r => r.time).join(" & ")} WIB`, key: "minggu" });
  }


  return (
    <div className="flex flex-col bg-transparent">

      {/* ═══════════════════ HERO SECTION ═══════════════════ */}
      <section className="relative min-h-[100vh] w-full flex items-center justify-center overflow-hidden -mt-[72px]">
        <div className="absolute inset-0">
          <picture>
            <source
              media="(max-width: 768px)"
              srcSet="/bg-katedral-mobile.webp"
              type="image/webp"
            />
            <source
              media="(max-width: 1024px)"
              srcSet="/bg-katedral-tablet.webp"
              type="image/webp"
            />
            <source
              srcSet="/bg-katedral-desktop.webp"
              type="image/webp"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/bg-katedral.jpg"
              alt="Eksterior Katedral Santo Yosef Pontianak"
              className="w-full h-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
          </picture>
          {/* Elegant gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#2C1F14]/70 via-[#2C1F14]/50 to-[#FAF7F2]" />
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-8 text-center flex flex-col items-center mt-20 pb-20 md:pb-32">
          <ScrollReveal direction="up" delay={100} duration={1000}>
            <span className="font-sans text-xs md:text-sm tracking-[0.3em] text-white mb-6 uppercase font-bold inline-block border-b border-white/50 pb-2">
              Keuskupan Agung Pontianak
            </span>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={300} duration={1200}>
            <h1
              className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl leading-[1.1] text-white mb-6 md:mb-8 font-bold drop-shadow-lg"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Selamat Datang di<br className="hidden md:block" /> Katedral Santo Yosef<br className="hidden md:block" /> Pontianak
            </h1>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={500} duration={1000}>
            <p className="font-light text-base sm:text-lg md:text-xl text-white/90 max-w-4xl mb-10 md:mb-12 leading-relaxed drop-shadow">
              Dibangun pada tahun 1909, Katedral ini menjadi pusat kedudukan Uskup Keuskupan Agung Pontianak. Memadukan arsitektur bergaya Romawi, Timur Tengah, dengan sentuhan ornamen khas Dayak dan Tionghoa sebagai simbol keagungan iman dan inkulturasi budaya.
            </p>
          </ScrollReveal>

          <ScrollReveal direction="up" delay={700} duration={1000}>
            <div className="flex flex-col sm:flex-row gap-4 md:gap-6 w-full sm:w-auto px-4 sm:px-0">
              <Link
                href="/jadwal-misa"
                className="group relative w-full sm:w-auto inline-flex items-center justify-center bg-[#B8960C] text-white px-8 md:px-10 py-3.5 md:py-4 rounded-sm font-sans text-sm tracking-wide font-semibold hover:bg-[#9A7A00] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Lihat Jadwal Misa
              </Link>
              <Link
                href="/sakramen-perkawinan"
                className="group w-full sm:w-auto inline-flex items-center justify-center bg-white/15 backdrop-blur-md border border-white/80 text-white px-8 md:px-10 py-3.5 md:py-4 rounded-sm font-sans text-sm tracking-wide font-semibold hover:bg-white hover:text-[#3D2B1F] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1"
              >
                Sakramen Perkawinan
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ QUICK INFORMATION CARDS ═══════════════════ */}
      <section className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pt-12 sm:pt-16 md:pt-20 relative z-20 w-full mb-16 md:mb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-12">
          {/* Card 1 */}
          <ScrollReveal delay={100} className="h-full">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-elegant border border-white/60 flex flex-col h-full group hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm">
              <div className="w-14 h-14 bg-[#FAF7F2] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#B8960C] transition-colors duration-500">
                <Calendar className="text-[#B8960C] h-6 w-6 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#3D2B1F] mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>
                Jadwal Misa Hari Ini
              </h3>
              <p className="text-[#6B6560] text-base leading-relaxed flex-grow font-light mb-8">
                Informasi waktu pelaksanaan misa harian dan akhir pekan di Katedral.
              </p>
              <Link href="/jadwal-misa" className="text-[#B8960C] text-sm font-bold tracking-wider uppercase flex items-center gap-2 group/link w-fit">
                Lihat Selengkapnya <ArrowUpRight className="h-4 w-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
          
          {/* Card 2 */}
          <ScrollReveal delay={200} className="h-full">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-elegant border border-white/60 flex flex-col h-full group hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm">
              <div className="w-14 h-14 bg-[#FAF7F2] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#B8960C] transition-colors duration-500">
                <Newspaper className="text-[#B8960C] h-6 w-6 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#3D2B1F] mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>
                Berita Terbaru
              </h3>
              <p className="text-[#6B6560] text-base leading-relaxed flex-grow font-light mb-8">
                Pengumuman paroki, kegiatan umat, dan pesan gembala terkini.
              </p>
              <Link href="/berita" className="text-[#B8960C] text-sm font-bold tracking-wider uppercase flex items-center gap-2 group/link w-fit">
                Lihat Selengkapnya <ArrowUpRight className="h-4 w-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>

          {/* Card 3 */}
          <ScrollReveal delay={300} className="h-full">
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-elegant border border-white/60 flex flex-col h-full group hover:-translate-y-2 transition-all duration-500 backdrop-blur-sm">
              <div className="w-14 h-14 bg-[#FAF7F2] rounded-full flex items-center justify-center mb-6 group-hover:bg-[#B8960C] transition-colors duration-500">
                <BookOpen className="text-[#B8960C] h-6 w-6 group-hover:text-white transition-colors duration-500" />
              </div>
              <h3 className="text-2xl font-bold text-[#3D2B1F] mb-4" style={{ fontFamily: "var(--font-cormorant)" }}>
                Panduan Sakramen
              </h3>
              <p className="text-[#6B6560] text-base leading-relaxed flex-grow font-light mb-8">
                Persyaratan dan langkah-langkah untuk menerima sakramen gereja.
              </p>
              <Link href="/daftar" className="text-[#B8960C] text-sm font-bold tracking-wider uppercase flex items-center gap-2 group/link w-fit">
                Lihat Selengkapnya <ArrowUpRight className="h-4 w-4 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ JADWAL MISA PREVIEW ═══════════════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-16 flex flex-col items-center">
              <div className="h-12 w-px bg-[#B8960C]/50 mb-6" />
              <span className="font-sans text-xs tracking-[0.25em] text-[#B8960C] uppercase font-bold mb-4">
                Peribadatan
              </span>
              <h2 className="text-4xl md:text-5xl text-[#3D2B1F] font-bold text-center" style={{ fontFamily: "var(--font-cormorant)" }}>
                Jadwal Misa Katedral
              </h2>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={200}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-5xl mx-auto bg-white rounded-2xl shadow-elegant overflow-hidden">
              {/* Misa Harian */}
              <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#EDE8DF] relative">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#B8960C]/20" />
                <h3 className="text-2xl md:text-3xl text-[#3D2B1F] mb-6 md:mb-8 font-bold" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Misa Harian
                </h3>
                <ul className="space-y-4 md:space-y-6">
                  {groupedHarian.length > 0 ? groupedHarian.map((g) => (
                    <li key={g.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 group">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#6B6560] group-hover:text-[#3D2B1F] transition-colors">{g.label}</span>
                        {g.subtitle && <span className="text-xs text-[#9C8B7A]">{g.subtitle}</span>}
                      </div>
                      <span className="font-semibold text-[#B8960C] bg-[#FFF8E1] px-4 py-1.5 rounded-full text-sm w-fit whitespace-nowrap">{g.time}</span>
                    </li>
                  )) : (
                    <li className="text-[#9C8B7A] italic text-sm">Belum ada jadwal.</li>
                  )}
                </ul>
              </div>
              
              {/* Misa Mingguan */}
              <div className="p-8 md:p-12 relative">
                <div className="absolute top-0 right-0 w-1 h-full bg-[#B8960C]" />
                <h3 className="text-2xl md:text-3xl text-[#3D2B1F] mb-6 md:mb-8 font-bold" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Misa Mingguan
                </h3>
                <ul className="space-y-4 md:space-y-6">
                  {groupedMingguan.length > 0 ? groupedMingguan.map((g) => (
                    <li key={g.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 group">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#6B6560] group-hover:text-[#3D2B1F] transition-colors">{g.label}</span>
                        {g.subtitle && <span className="text-xs text-[#9C8B7A]">{g.subtitle}</span>}
                      </div>
                      <span className="font-semibold text-[#B8960C] bg-[#FFF8E1] px-4 py-1.5 rounded-full text-sm w-fit whitespace-nowrap">{g.time}</span>
                    </li>
                  )) : (
                    <li className="text-[#9C8B7A] italic text-sm">Belum ada jadwal.</li>
                  )}
                </ul>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={400}>
            <div className="text-center mt-12">
              <Link href="/jadwal-misa" className="inline-flex items-center justify-center bg-transparent border border-[#3D2B1F] text-[#3D2B1F] px-8 py-3 rounded-sm font-sans text-sm tracking-wide font-semibold hover:bg-[#3D2B1F] hover:text-white transition-all duration-300">
                Lihat Semua Jadwal
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ BERITA TERBARU ═══════════════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-[#DDD8D0] to-transparent max-w-7xl" />
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 md:mb-16 gap-6">
              <div>
                <span className="font-sans text-xs tracking-[0.25em] text-[#B8960C] uppercase font-bold mb-4 block">
                  Informasi Paroki
                </span>
                <h2 className="text-4xl md:text-5xl text-[#3D2B1F] font-bold" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Berita Terbaru
                </h2>
              </div>
              <Link href="/berita" className="text-[#3D2B1F] font-medium hover:text-[#B8960C] transition-colors flex items-center gap-2 pb-2 border-b border-[#3D2B1F] hover:border-[#B8960C] w-fit">
                Semua Berita <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {latestNews.length > 0 ? (
              latestNews.map((news, index) => {
                return (
                  <ScrollReveal key={news.id} delay={index * 150} className="h-full">
                    <Link href={`/berita/${news.slug}`} className="group block h-full">
                      <div className="bg-transparent flex flex-col h-full cursor-pointer">
                        <div className="h-64 relative rounded-xl overflow-hidden mb-6 bg-[#F5F0E8]">
                          {news.imageUrl ? (
                            <Image
                              src={news.imageUrl}
                              alt={news.title || "Foto berita"}
                              fill
                              className="object-cover transition-transform duration-700 group-hover:scale-105"
                              loading="lazy"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-[#EDE8DF]">
                              <Newspaper className="text-[#B8960C]/40" size={48} />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          <span className="absolute top-4 left-4 bg-[#FAF7F2]/90 backdrop-blur-sm text-[#3D2B1F] text-xs font-bold px-3 py-1.5 rounded uppercase tracking-wider shadow-sm">
                            {news.category || "Berita"}
                          </span>
                        </div>
                        <div className="flex flex-col flex-grow">
                          <span className="text-[#B8960C] text-xs font-bold tracking-widest uppercase mb-3 flex items-center gap-2">
                            <span className="w-4 h-px bg-[#B8960C]"></span>
                            {new Date(news.createdAt || new Date()).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </span>
                          <h3 className="text-2xl text-[#3D2B1F] font-bold leading-snug mb-4 line-clamp-3 group-hover:text-[#B8960C] transition-colors" style={{ fontFamily: "var(--font-cormorant)" }}>
                            {news.title}
                          </h3>
                        </div>
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })
            ) : (
              <div className="col-span-1 md:col-span-3 py-16 flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#F5F0E8] rounded-full flex items-center justify-center mb-6 shadow-sm border border-[#E8E0D0]">
                  <Newspaper className="text-[#B8960C] h-10 w-10 opacity-80" />
                </div>
                <h3 className="text-2xl font-bold text-[#3D2B1F] mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Belum Ada Berita
                </h3>
                <p className="text-[#6B5744] text-base max-w-md">
                  Informasi dan berita terbaru seputar kegiatan paroki akan segera hadir di sini.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════ AGENDA UMAT ═══════════════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto">
          <ScrollReveal>
            <div className="text-center mb-10 md:mb-16 flex flex-col items-center">
              <div className="h-12 w-px bg-[#B8960C]/50 mb-6" />
              <span className="font-sans text-xs tracking-[0.25em] text-[#B8960C] uppercase font-bold mb-4">
                Kegiatan Mendatang
              </span>
              <h2 className="text-4xl md:text-5xl text-[#3D2B1F] font-bold" style={{ fontFamily: "var(--font-cormorant)" }}>
                Agenda Umat
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {upcomingAgendas.length > 0 ? (
              upcomingAgendas.map((agenda, i) => {
                // Safely parse date: try eventDate first, then createdAt
                let dateObj: Date | null = null;
                if (agenda.eventDate) {
                  const parsed = new Date(agenda.eventDate);
                  if (!isNaN(parsed.getTime())) dateObj = parsed;
                }
                if (!dateObj && agenda.createdAt) {
                  const parsed = agenda.createdAt instanceof Date ? agenda.createdAt : new Date(agenda.createdAt);
                  if (!isNaN(parsed.getTime())) dateObj = parsed;
                }
                if (!dateObj) dateObj = new Date();

                const bulan = dateObj.toLocaleDateString("id-ID", { month: "short" });
                const tanggal = String(dateObj.getDate()).padStart(2, "0");

                return (
                  <ScrollReveal key={agenda.id} delay={i * 150}>
                    <Link href={`/berita/${agenda.slug}`} className="block group">
                      <div className="bg-white rounded-xl p-6 flex items-start gap-6 shadow-sm border border-transparent hover:border-[#B8960C]/30 hover:shadow-elegant transition-all duration-300 cursor-pointer min-h-[120px]">
                        <div className="text-center min-w-[70px] shrink-0 flex flex-col items-center justify-center pt-1">
                          <span className="block font-sans text-xs text-[#B8960C] font-bold uppercase tracking-wider mb-1">{bulan}</span>
                          <span className="block text-4xl text-[#3D2B1F] font-bold" style={{ fontFamily: "var(--font-cormorant)" }}>
                            {tanggal}
                          </span>
                        </div>
                        <div className="w-px self-stretch bg-[#EDE8DF]" />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-lg font-bold text-[#3D2B1F] mb-2 group-hover:text-[#B8960C] transition-colors line-clamp-2" style={{ fontFamily: "var(--font-cormorant)" }}>
                            {agenda.title}
                          </h4>
                          <p className="text-sm text-[#6B6560] font-light flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 text-[#B8960C] shrink-0" /> {agenda.location || "Gereja Katedral"}
                          </p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-[#B8960C]/40 group-hover:text-[#B8960C] group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0 mt-1" />
                      </div>
                    </Link>
                  </ScrollReveal>
                );
              })
            ) : (
              <div className="lg:col-span-3 flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center mb-5 shadow-sm">
                  <CalendarDays className="h-7 w-7 text-[#B8960C]/50" />
                </div>
                <h4 className="text-xl font-bold text-[#3D2B1F] mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
                  Belum Ada Agenda Terbaru
                </h4>
                <p className="text-sm text-[#6B6560] max-w-md mb-6">
                  Saat ini tidak ada pengumuman atau kegiatan mendatang. Kunjungi halaman berita untuk melihat informasi terdahulu.
                </p>
                <Link href="/berita" className="inline-flex items-center gap-2 text-sm font-bold text-[#B8960C] hover:text-[#9A7A00] transition-colors border-b border-[#B8960C] pb-1">
                  Lihat Semua Berita <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ═══════════════════ PENGUMUMAN PERKAWINAN ═══════════════════ */}
      <section className="py-16 md:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16 items-stretch">
          {/* Image Column */}
          <ScrollReveal direction="right" duration={1000} className="w-full order-2 lg:order-1 sticky top-24 h-fit">
            <div className="relative h-[400px] md:h-[500px] lg:h-[700px] w-full rounded-2xl overflow-hidden shadow-elegant group">
              <img
                alt="Pernikahan di Katedral"
                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBR-_8bRb1Mt5tUrKEwh_3FL4PHLE7F_0e6zhDyYHxJyprN4Wz2jCXMt7O0baiJ3FPKXwZnUMLCGzF-ovWz9rcNFTX_vTtM9CeQtBMEg09IWSy-neg5Z9dZSSosjQ4jZwWT8SCvjTxzs33RQQm-Eh6UHoOMnIPEuAPeI1QPm222PbrchMIlEVQ2RsIlda3oVU5yP5j0WEfmetrtE8RPlVYaRjsKNBc_HQzM6kncfHqRqwI7FNV33bAlVcM8ASVrYbEh68Zj-QXJJjQ"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2C1F14]/60 via-transparent to-transparent" />
            </div>
          </ScrollReveal>
          
          {/* Text Column */}
          <ScrollReveal direction="left" duration={1000} className="flex flex-col h-full order-1 lg:order-2">
            <span className="font-sans text-xs tracking-[0.25em] text-[#B8960C] uppercase font-bold mb-4">
              Sakramen Perkawinan
            </span>
            <h2 className="text-4xl md:text-5xl lg:text-6xl text-[#3D2B1F] mb-4 md:mb-6 font-bold" style={{ fontFamily: "var(--font-cormorant)" }}>
              Pengumuman Perkawinan
            </h2>
            <p className="text-[#6B6560] text-base md:text-lg font-light leading-relaxed mb-4">
              Pemberitahuan kepada umat mengenai rencana sakramen perkawinan dari calon mempelai. 
            </p>
            <Link href="/kontak" className="italic text-[#B8960C] hover:text-[#9A7A00] hover:underline mb-8 text-base flex-shrink-0 transition-colors inline-block" style={{ fontFamily: "var(--font-cormorant)" }}>
              * Jika umat mengetahui adanya halangan perkawinan ini, wajib memberitahu pastor paroki (Lapor Halangan).
            </Link>
            
            <div className="flex-grow flex flex-col overflow-hidden min-h-0">
              <WeddingAnnouncementsClient weddings={allStage5Weddings} />
            </div>
            
            <div className="mt-10 flex-shrink-0">
              <Link href="/daftar" className="inline-flex items-center text-[#B8960C] font-bold tracking-wider uppercase text-sm hover:underline gap-2">
                Informasi Pendaftaran Perkawinan <ArrowUpRight className="h-4 w-4" />
              </Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* ═══════════════════ DONASI SECTION ═══════════════════ */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <Image
            alt="Katedral eksterior malam"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuByCUW2E10TvEaMTGU4wkasrC8LVmZhelnxuPEMUdl08pq4p9RYfDdquxGzLFnLWiaQHNo-IcrgknBpDTYTDuzLIp3RfZJbggwnIL6FacWugqEsVg-gXLf6XnwpSp0lYb50WypbH5MkPis7yQKscH-yPoHvkMhDzAP2rq04Wc2crtq1ihyqJOadK-ah-vWGFApj6gNM-d9EC3gdm0IwMZahS8gZlBfT9MfNPegdiN9StyBplOvz3EL30E8-eIP1yJTy4D6Ct63eRSg"
            fill
            loading="lazy"
          />
          <div className="absolute inset-0 bg-[#2C1F14]/85" />
        </div>
        
        <div className="relative z-10 max-w-4xl mx-auto text-center flex flex-col items-center">
          <ScrollReveal direction="up" delay={100}>
            <span className="font-sans text-xs tracking-[0.25em] text-[#B8960C] uppercase font-bold mb-6 block">
              Dukung Pelayanan Gereja
            </span>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={200}>
            <h2 className="text-4xl md:text-5xl lg:text-7xl text-white mb-6 md:mb-8 font-bold drop-shadow-md text-center" style={{ fontFamily: "var(--font-cormorant)" }}>
              Persembahan Kasih
            </h2>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={300}>
            <p className="font-light text-base md:text-xl text-[#EDE8DF] leading-relaxed mb-10 md:mb-12 drop-shadow text-center">
              Setiap persembahan kasih yang Anda berikan akan menjadi saluran berkat yang menopang seluruh karya dan pelayanan gereja. Dukungan tulus dari Anda akan digunakan untuk kegiatan pastoral, pengembangan iman umat, serta pelayanan diakonia bagi mereka yang membutuhkan.
            </p>
          </ScrollReveal>
          
          <ScrollReveal direction="up" delay={400}>
            <Link
              href="/kontak"
              className="inline-flex items-center justify-center bg-[#B8960C] border border-[#B8960C] text-white px-10 py-4 rounded-sm font-sans text-sm tracking-wide font-semibold hover:bg-transparent hover:text-[#B8960C] transition-all duration-300"
            >
              Pelajari Lebih Lanjut
            </Link>
          </ScrollReveal>
        </div>
      </section>

    </div>
  );
}
