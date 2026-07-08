import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupleProfiles, marriageApplications, requiredDocuments } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { CheckCircle2, Circle, AlertTriangle, FileText, Info } from "lucide-react";
import Link from "next/link";

export default async function DokumenPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const profileRecord = await db.select().from(coupleProfiles)
    .where(eq(coupleProfiles.userId, session.user.id)).limit(1);
  const profile = profileRecord[0];

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center py-24">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
             style={{ background: "#F5F0E8" }}>
          <AlertTriangle size={28} style={{ color: "#B8960C" }} />
        </div>
        <h2 className="text-2xl font-bold mb-2"
            style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
          Profil Belum Dilengkapi
        </h2>
        <p className="text-[14px] mb-6 text-center max-w-md" style={{ color: "#9C8B7A" }}>
          Anda harus melengkapi profil pendaftaran terlebih dahulu untuk melihat daftar dokumen.
        </p>
        <Link href="/dasbor/profil"
          className="px-6 py-2.5 rounded-lg font-bold text-white text-[14px] transition-all hover:opacity-90"
          style={{ background: "#B8960C" }}>
          Lengkapi Profil
        </Link>
      </div>
    );
  }

  const appRecord = await db.select().from(marriageApplications)
    .where(eq(marriageApplications.coupleProfileId, profile.id)).limit(1);
  const application = appRecord[0];

  const docs = await db.select().from(requiredDocuments)
    .where(eq(requiredDocuments.applicationId, application.id));

  const receivedDocs = docs.filter((d) => d.isReceived).length;
  const totalDocs = docs.length;
  const isComplete = receivedDocs === totalDocs && totalDocs > 0;
  const percent = totalDocs > 0 ? Math.round((receivedDocs / totalDocs) * 100) : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6 page-fade">
      {/* Page Header */}
      <div className="mb-6">
        <p className="section-label mb-2">Dasbor Pengantin</p>
        <h1 className="text-[32px] font-bold leading-tight"
            style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
          Kelengkapan Dokumen
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "#9C8B7A" }}>
          Checklist dokumen persyaratan administrasi yang harus diserahkan ke Sekretariat Paroki.
        </p>
      </div>

      {/* Progress Card */}
      <div className="card-sacred p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: "#9C8B7A" }}>
              Progres Berkas
            </p>
            <p className="text-[28px] font-bold leading-none"
               style={{ fontFamily: "var(--font-cormorant)", color: isComplete ? "#4A7C59" : "#B8960C" }}>
              {receivedDocs}
              <span className="text-[18px] font-normal" style={{ color: "#9C8B7A" }}> / {totalDocs} dokumen</span>
            </p>
          </div>
          <span
            className="inline-flex px-3.5 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider self-start sm:self-center"
            style={{
              background: isComplete ? "#EAF4ED" : "#FDF3D0",
              color: isComplete ? "#2E6B41" : "#9A7A0A",
              border: `1px solid ${isComplete ? "#A8D5B4" : "#E8D070"}`,
            }}
          >
            {isComplete ? "Lengkap" : `${percent}% Selesai`}
          </span>
        </div>
        {/* Progress bar */}
        <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: "#F0EBE3" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${percent}%`, background: isComplete ? "#4A7C59" : "#B8960C" }}
          />
        </div>
      </div>

      {/* Info Banner */}
      <div className="flex gap-3.5 p-5 rounded-xl"
           style={{ background: "#EAF0FA", border: "1px solid #A8BEDE" }}>
        <Info size={17} className="flex-shrink-0 mt-0.5" style={{ color: "#4A6FA5" }} />
        <p className="text-[13px] leading-relaxed" style={{ color: "#2E4E85" }}>
          Sistem ini <strong>tidak menerima unggahan digital</strong>. Serahkan dokumen fisik 
          dalam satu map ke Sekretariat Katedral pada jam kerja. 
          Admin akan memperbarui status setelah verifikasi.
        </p>
      </div>

      {/* Document Checklist */}
      <div className="card-sacred overflow-hidden">
        <div className="px-6 py-4 flex items-center justify-between"
             style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}>
          <div className="flex items-center gap-2">
            <FileText size={17} style={{ color: "#B8960C" }} />
            <h2 className="font-bold text-[15px]"
                style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
              Daftar Dokumen Fisik
            </h2>
          </div>
          <span className="text-[13px] font-bold" style={{ color: isComplete ? "#4A7C59" : "#B8960C" }}>
            {receivedDocs} / {totalDocs} Selesai
          </span>
        </div>

        <div>
          {docs.length === 0 ? (
            <div className="p-10 text-center text-[14px]" style={{ color: "#9C8B7A" }}>
              Daftar dokumen belum tersedia.
            </div>
          ) : (
            docs.map((doc, idx) => (
              <div
                key={doc.id}
                className="flex items-center justify-between gap-4 px-6 py-4 transition-colors hover:bg-[#FDFBF8]"
                style={{
                  borderTop: idx > 0 ? "1px solid #F0EBE3" : undefined,
                  borderLeft: doc.isReceived ? "3px solid #4A7C59" : "3px solid transparent",
                }}
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex-shrink-0">
                    {doc.isReceived ? (
                      <CheckCircle2 size={20} style={{ color: "#4A7C59" }} />
                    ) : (
                      <Circle size={20} style={{ color: "#D4CAC0" }} />
                    )}
                  </div>
                  <div>
                    <p
                      className="text-[14px] font-medium"
                      style={{ color: doc.isReceived ? "#2C1F14" : "#6B5744" }}
                    >
                      {doc.documentName}
                    </p>
                    {doc.isReceived && doc.receivedAt && (
                      <p className="text-[11px] mt-0.5" style={{ color: "#4A7C59" }}>
                        Diverifikasi {new Date(doc.receivedAt).toLocaleDateString("id-ID", {
                          day: "numeric", month: "long", year: "numeric",
                        })}
                      </p>
                    )}
                  </div>
                </div>

                <span
                  className="flex-shrink-0 inline-flex px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={
                    doc.isReceived
                      ? { background: "#EAF4ED", color: "#2E6B41", border: "1px solid #A8D5B4" }
                      : { background: "#F5F0E8", color: "#9C8B7A", border: "1px solid #E8E0D0" }
                  }
                >
                  {doc.isReceived ? "Diterima" : "Belum"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
