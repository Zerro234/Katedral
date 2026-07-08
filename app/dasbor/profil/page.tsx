import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupleProfiles, marriageApplications, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { ProfileForm } from "./profile-form";
import { User, Calendar, Phone, Church, Info, ArrowLeft, Briefcase, BookOpen, Home, Heart } from "lucide-react";
import Link from "next/link";

const formatDate = (d: string | null) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" }); }
  catch { return d; }
};

const Field = ({ label, value }: { label: string; value: string | null }) => (
  <div>
    <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#9C8B7A" }}>{label}</p>
    <p className="text-[15px] font-semibold" style={{ color: "#2C1F14" }}>{value || "—"}</p>
  </div>
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FieldIcon = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | null }) => (
  <div className="flex items-center gap-3.5">
    <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "#F5F0E8" }}>
      <Icon size={15} style={{ color: "#B8960C" }} />
    </div>
    <div>
      <p className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "#9C8B7A" }}>{label}</p>
      <p className="text-[14px] font-medium" style={{ color: "#2C1F14" }}>{value || "—"}</p>
    </div>
  </div>
);

export default async function ProfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;

  const profileRecord = await db.select().from(coupleProfiles)
    .where(eq(coupleProfiles.userId, session.user.id)).limit(1);
  const profile = profileRecord[0];

  if (!profile) {
    return <div className="max-w-4xl mx-auto"><ProfileForm /></div>;
  }

  // Fetch priest info if assigned
  const appRecord = await db.select().from(marriageApplications)
    .where(eq(marriageApplications.coupleProfileId, profile.id)).limit(1);
  const application = appRecord[0];
  let priestName: string | null = null;
  if (application?.priestId) {
    const priestRecord = await db.select({ name: users.name }).from(users)
      .where(eq(users.id, application.priestId)).limit(1);
    priestName = priestRecord[0]?.name || null;
  }

  // Pick best photo: couplePhoto > groomPhoto (legacy)
  const photo = profile.couplePhoto || profile.groomPhoto || profile.bridePhoto;

  return (
    <div className="max-w-4xl mx-auto space-y-5 page-fade">
      {/* Header */}
      <div className="mb-2">
        <Link href="/dasbor/beranda"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold mb-5 transition-colors hover:text-[#B8960C]"
          style={{ color: "#9C8B7A" }}>
          <ArrowLeft size={14} /> Kembali ke Dasbor
        </Link>
        <p className="section-label mb-2">Dasbor Pengantin</p>
        <h1 className="text-[32px] font-bold" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
          Profil Pasangan
        </h1>
        <p className="text-[14px] mt-1" style={{ color: "#9C8B7A" }}>
          Informasi data diri yang terdaftar di Sekretariat Paroki.
        </p>
      </div>

      {/* Info Banner */}
      <div className="flex gap-3.5 p-4 rounded-xl" style={{ background: "#EAF0FA", border: "1px solid #A8BEDE" }}>
        <Info size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#4A6FA5" }} />
        <p className="text-[13px] leading-relaxed" style={{ color: "#2E4E85" }}>
          Data ini dikunci untuk keperluan administrasi. Jika ada kesalahan, hubungi Sekretariat Paroki secara langsung saat menyerahkan dokumen fisik.
        </p>
      </div>

      {/* Cards Grid — Mempelai */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Mempelai Pria */}
        <div className="card-sacred overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#FDF3D0" }}>
              <User size={15} style={{ color: "#B8960C" }} />
            </div>
            <h2 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: "#2C1F14" }}>Calon Suami</h2>
          </div>
          <div className="p-6 space-y-5">
            <Field label="Nama Lengkap" value={profile.groomName} />
            <FieldIcon icon={Calendar} label="Tanggal Lahir" value={formatDate(profile.groomBirthdate)} />
            <FieldIcon icon={BookOpen} label="Agama" value={profile.groomReligion} />
            <FieldIcon icon={Briefcase} label="Pekerjaan" value={profile.groomOccupation} />
            <FieldIcon icon={Phone} label="No. Telepon / WhatsApp" value={profile.groomPhone} />
            <FieldIcon icon={Church} label="Paroki Asal / Tempat Baptis" value={profile.groomBaptismChurch} />
            <Field label="Nama Ayah" value={profile.groomFatherName} />
            <Field label="Nama Ibu" value={profile.groomMotherName} />
          </div>
        </div>

        {/* Mempelai Wanita */}
        <div className="card-sacred overflow-hidden">
          <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}>
            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#FDF3D0" }}>
              <User size={15} style={{ color: "#B8960C" }} />
            </div>
            <h2 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: "#2C1F14" }}>Calon Isteri</h2>
          </div>
          <div className="p-6 space-y-5">
            <Field label="Nama Lengkap" value={profile.brideName} />
            <FieldIcon icon={Calendar} label="Tanggal Lahir" value={formatDate(profile.brideBirthdate)} />
            <FieldIcon icon={BookOpen} label="Agama" value={profile.brideReligion} />
            <FieldIcon icon={Briefcase} label="Pekerjaan" value={profile.brideOccupation} />
            <FieldIcon icon={Phone} label="No. Telepon / WhatsApp" value={profile.bridePhone} />
            <FieldIcon icon={Church} label="Paroki Asal / Tempat Baptis" value={profile.brideBaptismChurch} />
            <Field label="Nama Ayah" value={profile.brideFatherName} />
            <Field label="Nama Ibu" value={profile.brideMotherName} />
          </div>
        </div>
      </div>

      {/* Informasi Perkawinan */}
      <div className="card-sacred overflow-hidden">
        <div className="px-6 py-4 flex items-center gap-2.5" style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#FDF3D0" }}>
            <Heart size={15} style={{ color: "#B8960C" }} />
          </div>
          <h2 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: "#2C1F14" }}>Informasi Perkawinan</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
          {profile.preferredWeddingDate && (
            <Field label="Preferensi Tanggal Pemberkatan" value={formatDate(profile.preferredWeddingDate)} />
          )}
          {profile.preferredWeddingTime && (
            <Field label="Preferensi Jam Pemberkatan" value={`${profile.preferredWeddingTime} WIB`} />
          )}
          <Field label="Alamat Sesudah Perkawinan" value={profile.postMarriageAddress} />
          <Field label="Jenis Perayaan" value={profile.ceremonyType} />
          <div className="md:col-span-2 mt-2 pt-4 border-t border-[#EDE8DF]">
            <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#9C8B7A" }}>Pastor Pemberkat</p>
            <p className="text-[15px] font-semibold" style={{ color: priestName ? "#2C1F14" : "#9C8B7A", fontStyle: priestName ? "normal" : "italic" }}>
              {priestName || "Belum ditentukan oleh Admin Sekretariat"}
            </p>
          </div>
        </div>
      </div>

      {/* Foto Pasangan */}
      {photo && (
        <div className="card-sacred overflow-hidden">
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}>
            <h2 className="font-bold text-[13px] uppercase tracking-wider" style={{ color: "#2C1F14" }}>Foto Pasangan</h2>
          </div>
          <div className="p-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={photo} alt="Foto Pasangan Calon Pengantin" className="max-w-sm w-full rounded-lg border border-[#DDD8D0] shadow-sm" />
          </div>
        </div>
      )}

      {/* Registration Number */}
      <div className="card-sacred p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="px-5 py-3 rounded-xl text-center" style={{ background: "#FDF3D0", border: "1px solid #E8D070" }}>
          <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "#B8960C" }}>
            Nomor Registrasi
          </p>
          <p className="font-bold text-[16px]" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
            {profile.registrationNumber}
          </p>
        </div>
      </div>
    </div>
  );
}
