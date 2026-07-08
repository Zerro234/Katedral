import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupleProfiles, marriageApplications, requiredDocuments, stageHistory, contents, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import Link from "next/link";
import { CheckCircle2, Circle, Clock, AlertCircle, FileText, ChevronRight, Church, Info } from "lucide-react";
import DaftarUlangButton from "./DaftarUlangButton";

const STAGE_NAMES = ["Pengisian Profil", "Kursus KPP", "Pemberkasan Dokumen", "Penyelidikan Kanonik", "Pemberkatan Nikah"];
const STAGE_DESC: Record<number, string> = {
  1: "Profil tersimpan. Tunggu info jadwal KPP dari sekretariat.",
  2: "Anda di tahap KPP. Hadiri kursus sesuai jadwal.",
  3: "Kumpulkan dokumen fisik ke sekretariat paroki.",
  4: "Penyelidikan Kanonik sedang dijadwalkan bersama Romo.",
  5: "Semua persiapan selesai! Menunggu hari pemberkatan.",
};

export default async function BerandaDasborPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  const user = session.user;

  const profileRecord = await db.select().from(coupleProfiles).where(eq(coupleProfiles.userId, user.id)).limit(1);
  const profile = profileRecord[0];

  // ── STATE: BELUM ADA PROFIL ──
  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto mt-8 page-fade">
        <p className="section-label mb-2">Dasbor Pengantin</p>
        <h1 className="text-[36px] font-bold mb-2" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
          Selamat datang, {user.name.split(" ")[0]}
        </h1>
        <p className="text-[14px] mb-8" style={{ color: "#9C8B7A" }}>
          Anda belum memiliki data pendaftaran pernikahan yang aktif.
        </p>

        <div className="card-sacred overflow-hidden mb-10">
          <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: "1px solid #E8E0D0", background: "#FDF3D0" }}>
            <AlertCircle size={18} style={{ color: "#B8960C" }} />
            <h3 className="font-bold text-[15px]" style={{ color: "#B8960C" }}>Tindakan Diperlukan</h3>
          </div>
          <div className="p-10 text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: "#F5F0E8" }}>
              <Church size={28} style={{ color: "#B8960C" }} />
            </div>
            <h2 className="text-2xl font-bold mb-3" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
              Lengkapi Data Calon Pasangan
            </h2>
            <p className="text-[14px] mb-8 max-w-lg mx-auto" style={{ color: "#6B5744" }}>
              Langkah pertama adalah melengkapi data diri mempelai pria dan wanita.
            </p>
            <Link href="/dasbor/profil"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-bold text-white transition-all hover:opacity-90"
              style={{ background: "#B8960C" }}>
              Mulai Pendaftaran →
            </Link>
          </div>
        </div>

        <h3 className="text-lg font-bold mb-4" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
          Alur Pendaftaran Pernikahan
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {STAGE_NAMES.map((name, i) => (
            <div key={i} className="card-sacred p-4 text-center opacity-50">
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold mx-auto mb-3 text-[14px]"
                   style={{ background: "#F5F0E8", color: "#9C8B7A" }}>{i + 1}</div>
              <p className="text-[12px] font-medium leading-tight" style={{ color: "#6B5744" }}>{name}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const appRecord = await db.select().from(marriageApplications).where(eq(marriageApplications.coupleProfileId, profile.id)).orderBy(desc(marriageApplications.createdAt)).limit(1);
  const application = appRecord[0];
  const allHistory = await db.select().from(stageHistory).where(eq(stageHistory.applicationId, application.id)).orderBy(desc(stageHistory.changedAt));
  const adminMessage = allHistory[0]?.note || "Berkas pendaftaran sedang ditinjau.";
  const docs = await db.select().from(requiredDocuments).where(eq(requiredDocuments.applicationId, application.id));
  const receivedDocs = docs.filter((d) => d.isReceived).length;
  const totalDocs = docs.length;
  const isCanceled = application.currentStage === 99;
  const isPendingDaftarUlang = application.currentStage === 98;

  // Fetch dynamic contact info
  const settingsRecord = await db.select({ body: contents.body }).from(contents).where(eq(contents.slug, "church-settings-v1")).limit(1);
  const settings = settingsRecord.length > 0 ? JSON.parse(settingsRecord[0].body ?? "{}") : {};
  const phone = settings.phone || "0561-1234567";
  const email = settings.email || "sekretariat@katedral.id";
  const address = settings.address || "Jl. Gereja No. 1, Pontianak, Kalimantan Barat";
  const operationalHours = settings.operationalHours || "Senin–Jumat: 08.00–12.00 dan 13.00–16.00\nSabtu: 08.00–12.00\nMinggu & Hari Raya: Tutup";

  // helper for phone link
  const cleanPhone = phone.replace(/\D/g, "");
  const waLink = `https://wa.me/62${cleanPhone.startsWith("0") ? cleanPhone.slice(1) : cleanPhone}`;

  let priestName = null;
  if (application.priestId) {
    const priestRecord = await db.select({ name: users.name }).from(users).where(eq(users.id, application.priestId)).limit(1);
    priestName = priestRecord[0]?.name;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-5 page-fade">

      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-2">
        <div>
          <p className="section-label mb-2">Dasbor Pengantin</p>
          <h1 className="text-[36px] font-bold leading-tight" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
            Selamat datang, {user.name.split(" ")[0]}
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "#9C8B7A" }}>Pantau progres pendaftaran pernikahan Anda.</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[12px] font-bold" style={{ background: "#FDF3D0", color: "#9A7A0A", border: "1px solid #E8D070" }}>
            No. Reg: {profile.registrationNumber}
          </span>
        </div>
      </div>
         {/* ── Progress Steps ── */}
      <div className="card-sacred p-6 overflow-x-auto">
        {isCanceled && (
          <div className="flex justify-center mb-5">
            <span className="px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
                  style={{ background: "#FAEDED", color: "#8B3A3A", border: "1px solid #E8AAAA" }}>
              ❌ Pendaftaran Dibatalkan
            </span>
          </div>
        )}
        {isPendingDaftarUlang && (
          <div className="flex justify-center mb-5">
            <span className="px-5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
                  style={{ background: "#FFF8E1", color: "#B8960C", border: "1px solid #E8D070" }}>
              ⏳ Menunggu Konfirmasi Daftar Ulang
            </span>
          </div>
        )}
        <div className="flex items-center min-w-max justify-between px-2">
          {STAGE_NAMES.map((name, i) => {
            const step = i + 1;
            const done = (!isCanceled && !isPendingDaftarUlang) && step < application.currentStage;
            const current = (!isCanceled && !isPendingDaftarUlang) && step === application.currentStage;
            const dimmed = isCanceled || isPendingDaftarUlang;
            return (
              <div key={i} className="flex items-center">
                <div className="flex flex-col items-center w-28">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center border-2 mb-2 transition-all"
                    style={{
                      background: dimmed ? "#F0EDEB" : done ? "#EAF4ED" : current ? "#B8960C" : "#F5F0E8",
                      borderColor: dimmed ? "#D4CAC0" : done ? "#4A7C59" : current ? "#B8960C" : "#E8E0D0",
                      color: dimmed ? "#D4CAC0" : done ? "#4A7C59" : current ? "#FFFFFF" : "#9C8B7A",
                      opacity: dimmed ? 0.5 : 1,
                    }}>
                    {done ? <CheckCircle2 size={18} /> : <span className="font-bold text-[14px]">{step}</span>}
                  </div>
                  <span className="text-[10px] font-semibold text-center uppercase tracking-wide leading-tight"
                    style={{ color: dimmed ? "#D4CAC0" : done ? "#4A7C59" : current ? "#B8960C" : "#9C8B7A" }}>
                    {name}
                  </span>
                </div>
                {i < STAGE_NAMES.length - 1 && (
                  <div className="w-14 h-0.5 -mx-3 z-0 rounded-full"
                    style={{ background: !dimmed && step < application.currentStage ? "#4A7C59" : "#E8E0D0" }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── BANNER PEMBATALAN ── */}
      {isCanceled && (
        <div className="rounded-xl p-8" style={{ background: "#FAEDED", border: "2px solid #E8AAAA" }}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F5D5D5" }}>
              <AlertCircle size={40} style={{ color: "#8B3A3A" }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[4px] mb-1" style={{ color: "#C08080" }}>Status Pendaftaran</p>
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-cormorant)", color: "#8B3A3A" }}>Pendaftaran Dibatalkan</h2>
              <div className="p-4 rounded-lg mb-4" style={{ background: "#FFFFFF", border: "1px solid #F0D0D0" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#9C8B7A" }}>Alasan dari Sekretariat:</p>
                <p className="italic font-medium" style={{ color: "#2C1F14" }}>&ldquo;{adminMessage}&rdquo;</p>
              </div>
              <p className="text-[13px] mb-5" style={{ color: "#6B5744" }}>
                Untuk mendaftar ulang atau info lebih lanjut, hubungi Sekretariat Katedral.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <DaftarUlangButton />
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[13px] text-white transition-all hover:opacity-90"
                  style={{ background: "#25D366" }}>
                  💬 WhatsApp Sekretariat
                </a>
                <a href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[13px] border transition-all hover:bg-[#FAEDED]"
                  style={{ color: "#8B3A3A", borderColor: "#E8AAAA" }}>
                  ✉ Email Sekretariat
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── BANNER PENDING DAFTAR ULANG ── */}
      {isPendingDaftarUlang && (
        <div className="rounded-xl p-8" style={{ background: "#FFF8E1", border: "2px solid #E8D070" }}>
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#FDF3D0" }}>
              <Clock size={40} style={{ color: "#B8960C" }} />
            </div>
            <div className="flex-1 text-center md:text-left">
              <p className="text-[10px] font-bold uppercase tracking-[4px] mb-1" style={{ color: "#9A7A0A" }}>Status Pendaftaran</p>
              <h2 className="text-3xl font-bold mb-3" style={{ fontFamily: "var(--font-cormorant)", color: "#B8960C" }}>Menunggu Konfirmasi</h2>
              <div className="p-4 rounded-lg mb-4" style={{ background: "#FFFFFF", border: "1px solid #E8D070" }}>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#9C8B7A" }}>Informasi:</p>
                <p className="italic font-medium" style={{ color: "#2C1F14" }}>&ldquo;Pengajuan daftar ulang Anda telah dikirim dan sedang menunggu persetujuan dari Sekretariat Katedral.&rdquo;</p>
              </div>
              <p className="text-[13px] mb-5" style={{ color: "#6B5744" }}>
                Jika Anda memiliki pertanyaan lebih lanjut, silakan hubungi kami.
              </p>
              <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[13px] text-white transition-all hover:opacity-90"
                  style={{ background: "#25D366" }}>
                  💬 WhatsApp Sekretariat
                </a>
                <a href={`mailto:${email}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-[13px] border transition-all hover:bg-[#FFF8E1]"
                  style={{ color: "#B8960C", borderColor: "#E8D070" }}>
                  ✉ Email Sekretariat
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Jadwal & Romo Pemberkatan ── */}
      {(!isCanceled && !isPendingDaftarUlang && (application.currentStage ?? 1) >= 5) && (application.weddingDate || priestName) && (
        <div className="rounded-xl p-6 flex flex-col md:flex-row items-center gap-5"
          style={{ background: "#FDFBF8", border: "1px solid #E8D070", boxShadow: "0 4px 12px rgba(184,150,12,0.08)" }}>
          <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
               style={{ background: "#FDF3D0", border: "2px solid #E8D070" }}>⛪</div>
          <div className="flex-1 flex flex-col md:flex-row gap-6 md:gap-12 text-center md:text-left">
            {application.weddingDate && (
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[3px] mb-1.5" style={{ color: "#B8960C" }}>
                  Jadwal Pemberkatan
                </p>
                <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
                  {new Date(application.weddingDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
                </h2>
                <p className="text-[14px] mt-1 font-medium" style={{ color: "#6B5744" }}>
                  {(application.weddingDate as string).includes("T") ? `${(application.weddingDate as string).substring(11, 16)} WIB · ` : ""}Katedral Santo Yosef
                </p>
              </div>
            )}
            {priestName && (
              <div className={application.weddingDate ? "pt-4 md:pt-0 md:pl-12 md:border-l border-[#E8D070]" : ""}>
                <p className="text-[11px] font-bold uppercase tracking-[3px] mb-1.5" style={{ color: "#B8960C" }}>
                  Romo yang Ditugaskan
                </p>
                <h2 className="text-2xl font-bold" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
                  {priestName}
                </h2>
                <p className="text-[14px] mt-1 font-medium" style={{ color: "#6B5744" }}>Memimpin Misa Pemberkatan</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── KONTEN BAWAH ── */}
      {(isCanceled || isPendingDaftarUlang) ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card-sacred p-6">
            <h3 className="font-bold text-[15px] mb-4" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>Kontak Sekretariat</h3>
            <div className="space-y-3 text-[13px]" style={{ color: "#6B5744" }}>
              <div className="flex gap-3"><span>📍</span><span>{address}</span></div>
              <div className="flex gap-3"><span>📞</span><a href={`tel:${phone}`} className="font-bold hover:underline" style={{ color: "#B8960C" }}>{phone}</a></div>
              <div className="flex gap-3"><span>✉</span><a href={`mailto:${email}`} className="font-bold hover:underline" style={{ color: "#B8960C" }}>{email}</a></div>
              <div className="flex gap-3"><span>🕐</span><span className="whitespace-pre-line">{operationalHours}</span></div>
            </div>
          </div>
          {isCanceled && (
            <div className="card-sacred p-6" style={{ background: "#FDF3D0", border: "1px solid #E8D070" }}>
              <h3 className="font-bold text-[15px] mb-3" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>Langkah Selanjutnya</h3>
              <ul className="space-y-2 text-[13px]" style={{ color: "#6B5744" }}>
                {["Hubungi sekretariat untuk klarifikasi alasan pembatalan.", "Datangi kantor paroki untuk mendaftar ulang.", "Siapkan dokumen untuk proses baru."].map((s, i) => (
                  <li key={i} className="flex gap-2"><span className="font-bold" style={{ color: "#B8960C" }}>{i + 1}.</span>{s}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Status Card & Informasi Tahap 4 */}
          <div className="space-y-4">
            {application.currentStage === 4 && (
              <div className="card-sacred overflow-hidden" style={{ background: "#FDF3D0", border: "1px solid #E8D070" }}>
                <div className="px-5 py-3 flex items-center gap-2" style={{ borderBottom: "1px solid #E8D070", background: "#FDFBF8" }}>
                  <Info size={16} style={{ color: "#B8960C" }} />
                  <h3 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: "#9A7A0A" }}>Informasi Administratif</h3>
                </div>
                <div className="p-5 text-[13px]" style={{ color: "#3D2B1F" }}>
                  <p className="mb-2">
                    Penyelidikan Kanonik sedang berlangsung. Setelah tahap ini dinyatakan selesai oleh pihak gereja, calon pengantin akan diarahkan untuk mengikuti proses administratif berikut:
                  </p>
                  <ul className="list-disc pl-5 mb-3 space-y-1 font-medium">
                    <li>Pembayaran Administrasi</li>
                    <li>Pengumuman Gereja (3 Minggu)</li>
                    <li>Gladi Bersih</li>
                  </ul>
                  <p className="italic" style={{ color: "#6B5744" }}>
                    Informasi jadwal dan ketentuan akan disampaikan oleh Admin Sekretariat.
                  </p>
                </div>
              </div>
            )}

            <div className="card-sacred overflow-hidden">
              <div className="px-5 py-3" style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}>
                <h3 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: "#9C8B7A" }}>Status Saat Ini</h3>
              </div>
              <div className="p-5">
                <h4 className="text-xl font-bold mb-2" style={{ fontFamily: "var(--font-cormorant)", color: "#B8960C" }}>
                  Tahap {application.currentStage}: {STAGE_NAMES[(application.currentStage ?? 1) - 1]}
                </h4>
                <p className="text-[13px]" style={{ color: "#6B5744" }}>
                  {STAGE_DESC[application.currentStage ?? 1]}
                </p>
              </div>
            </div>

            <div className="card-sacred overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E0D0" }}>
                <h3 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: "#9C8B7A" }}>Pesan Sekretariat</h3>
                <Clock size={14} style={{ color: "#D4CAC0" }} />
              </div>
              <div className="p-5" style={{ borderLeft: "3px solid #4A7C59" }}>
                <p className="text-[13px] italic" style={{ color: "#2C1F14" }}>&quot;{adminMessage}&quot;</p>
              </div>
            </div>
          </div>

          {/* Dokumen Column */}
          <div className="lg:col-span-2 card-sacred overflow-hidden">
            <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}>
              <div className="flex items-center gap-2">
                <FileText size={16} style={{ color: "#B8960C" }} />
                <h3 className="font-bold text-[15px]" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>Kelengkapan Dokumen</h3>
              </div>
              <Link href="/dasbor/dokumen" className="text-[12px] font-bold flex items-center gap-0.5 hover:underline" style={{ color: "#B8960C" }}>
                Detail <ChevronRight size={13} />
              </Link>
            </div>
            <div className="p-5">
              <div className="flex justify-between text-[13px] mb-2">
                <span style={{ color: "#9C8B7A" }}>Progres Berkas</span>
                <span className="font-bold" style={{ color: "#4A7C59" }}>{receivedDocs} dari {totalDocs} diterima</span>
              </div>
              <div className="w-full h-1.5 rounded-full mb-5 overflow-hidden" style={{ background: "#F0EBE3" }}>
                <div className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${totalDocs > 0 ? (receivedDocs / totalDocs) * 100 : 0}%`, background: "#4A7C59" }} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {docs.map((doc) => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg"
                    style={{ background: "#FDFBF8", border: "1px solid #F0EBE3" }}>
                    <div className="flex-shrink-0">
                      {doc.isReceived ? <CheckCircle2 size={17} style={{ color: "#4A7C59" }} /> : <Circle size={17} style={{ color: "#D4CAC0" }} />}
                    </div>
                    <div>
                      <p className="text-[12px] font-medium leading-tight" style={{ color: doc.isReceived ? "#2C1F14" : "#9C8B7A" }}>{doc.documentName}</p>
                      {doc.isReceived && <p className="text-[10px] font-bold uppercase mt-0.5" style={{ color: "#4A7C59" }}>Diterima</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Riwayat Timeline ── */}
      {allHistory.length > 0 && (
        <div className="card-sacred overflow-hidden">
          <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}>
            <Clock size={15} style={{ color: "#B8960C" }} />
            <h3 className="font-bold text-[15px]" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>Riwayat Perubahan Tahap</h3>
          </div>
          <div className="p-5">
            <div className="relative pl-5" style={{ borderLeft: "2px solid #E8E0D0" }}>
              {allHistory.map((h, i) => {
                const isCancel = h.stageNumber === 99;
                const date = h.changedAt ? new Date(h.changedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }) : "—";
                const time = h.changedAt ? new Date(h.changedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) : "";
                return (
                  <div key={i} className="relative mb-5 last:mb-0">
                    <div className="absolute -left-[21px] top-1 w-3 h-3 rounded-full border-2"
                      style={{ background: i === 0 ? (isCancel ? "#8B3A3A" : "#B8960C") : "#E8E0D0", borderColor: "#FFFFFF", boxShadow: "0 0 0 2px #E8E0D0" }} />
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={isCancel ? { background: "#FAEDED", color: "#8B3A3A" } : { background: "#FDF3D0", color: "#9A7A0A" }}>
                        {isCancel ? "Dibatalkan" : `Tahap ${h.stageNumber}`}
                      </span>
                      <span className="text-[11px]" style={{ color: "#9C8B7A" }}>{date} · {time}</span>
                    </div>
                    <p className="text-[13px]" style={{ color: "#6B5744" }}>{h.note}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
