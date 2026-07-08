"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { User, Heart, Camera, Info } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";

const AGAMA_OPTIONS = ["Katolik", "Kristen Protestan", "Islam", "Hindu", "Buddha", "Konghucu", "Lainnya"];

const inputClass =
  "w-full h-11 px-4 rounded-md border border-[#DDD8D0] focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none text-[#3D2B1F] bg-white";
const labelClass = "block mb-2 text-xs font-bold text-[#6B6560] uppercase tracking-wider";

export function ProfileForm() {
  const router = useRouter();

  // === Data Calon Suami ===
  const [groomName, setGroomName] = useState("");
  const [groomBirthdate, setGroomBirthdate] = useState("");
  const [groomReligion, setGroomReligion] = useState("");
  const [groomOccupation, setGroomOccupation] = useState("");
  const [groomPhone, setGroomPhone] = useState("");
  const [groomBaptismChurch, setGroomBaptismChurch] = useState("");
  const [groomFatherName, setGroomFatherName] = useState("");
  const [groomMotherName, setGroomMotherName] = useState("");

  // === Data Calon Isteri ===
  const [brideName, setBrideName] = useState("");
  const [brideBirthdate, setBrideBirthdate] = useState("");
  const [brideReligion, setBrideReligion] = useState("");
  const [brideOccupation, setBrideOccupation] = useState("");
  const [bridePhone, setBridePhone] = useState("");
  const [brideBaptismChurch, setBrideBaptismChurch] = useState("");
  const [brideFatherName, setBrideFatherName] = useState("");
  const [brideMotherName, setBrideMotherName] = useState("");

  // === Informasi Perkawinan ===
  const [preferredWeddingDate, setPreferredWeddingDate] = useState("");
  const [preferredWeddingTime, setPreferredWeddingTime] = useState("");
  const [postMarriageAddress, setPostMarriageAddress] = useState("");
  const [ceremonyType, setCeremonyType] = useState("");

  // === Persetujuan ===
  const [agreement, setAgreement] = useState(false);

  // === Foto Pasangan ===
  const [couplePhoto, setCouplePhoto] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/profil", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groomName, groomBirthdate, groomReligion, groomOccupation,
          groomPhone, groomBaptismChurch, groomFatherName, groomMotherName,
          brideName, brideBirthdate, brideReligion, brideOccupation,
          bridePhone, brideBaptismChurch, brideFatherName, brideMotherName,
          preferredWeddingDate, preferredWeddingTime, postMarriageAddress, ceremonyType,
          couplePhoto,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan profil");
      }

      router.push("/dasbor/beranda");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Terjadi kesalahan tak terduga");
      }
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#3D2B1F]" style={{ fontFamily: "var(--font-cormorant)" }}>
          Mulai Pendaftaran
        </h1>
        <p className="text-[#6B6560]">
          Mohon isi data lengkap calon pengantin sesuai dokumen resmi (KTP/Akte/Surat Baptis).
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-[#FDECEA] border border-[#C0392B]/30 text-[#C0392B] rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* ═══════════════ DATA CALON SUAMI ═══════════════ */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#EDE8DF]">
            <h2 className="font-bold text-[#3D2B1F] flex items-center gap-2 uppercase tracking-wide text-sm">
              <User size={18} className="text-[#B8960C]" /> Data Calon Suami
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Nama Lengkap (Sesuai KTP) <span className="text-red-400">*</span></label>
              <input type="text" required value={groomName} onChange={e => setGroomName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tanggal Lahir <span className="text-red-400">*</span></label>
              <input type="date" required value={groomBirthdate} onChange={e => setGroomBirthdate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Agama Sesuai Dokumen Resmi <span className="text-red-400">*</span></label>
              <select required value={groomReligion} onChange={e => setGroomReligion(e.target.value)} className={inputClass}>
                <option value="">— Pilih Agama —</option>
                {AGAMA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <p className="text-[11px] text-[#9C8B7A] mt-1">Data agama diisi sesuai dokumen resmi. Jika salah satu calon pengantin bukan Katolik, proses administrasi akan diverifikasi lebih lanjut oleh Admin Sekretariat.</p>
            </div>
            <div>
              <label className={labelClass}>Pekerjaan <span className="text-red-400">*</span></label>
              <input type="text" required value={groomOccupation} onChange={e => setGroomOccupation(e.target.value)} className={inputClass} placeholder="contoh: Pegawai Swasta" />
            </div>
            <div>
              <label className={labelClass}>Nomor Telepon / WhatsApp <span className="text-red-400">*</span></label>
              <input type="tel" required value={groomPhone} onChange={e => setGroomPhone(e.target.value)} className={inputClass} placeholder="contoh: 08123456789" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Paroki Tempat Dibaptis / Asal Paroki <span className="text-red-400">*</span></label>
              <input type="text" required value={groomBaptismChurch} onChange={e => setGroomBaptismChurch(e.target.value)} className={inputClass} placeholder="contoh: Katedral Santo Yosef Pontianak" />
            </div>
            <div>
              <label className={labelClass}>Nama Ayah <span className="text-red-400">*</span></label>
              <input type="text" required value={groomFatherName} onChange={e => setGroomFatherName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nama Ibu <span className="text-red-400">*</span></label>
              <input type="text" required value={groomMotherName} onChange={e => setGroomMotherName(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* ═══════════════ DATA CALON ISTERI ═══════════════ */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#EDE8DF]">
            <h2 className="font-bold text-[#3D2B1F] flex items-center gap-2 uppercase tracking-wide text-sm">
              <User size={18} className="text-[#B8960C]" /> Data Calon Isteri
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Nama Lengkap (Sesuai KTP) <span className="text-red-400">*</span></label>
              <input type="text" required value={brideName} onChange={e => setBrideName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Tanggal Lahir <span className="text-red-400">*</span></label>
              <input type="date" required value={brideBirthdate} onChange={e => setBrideBirthdate(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Agama Sesuai Dokumen Resmi <span className="text-red-400">*</span></label>
              <select required value={brideReligion} onChange={e => setBrideReligion(e.target.value)} className={inputClass}>
                <option value="">— Pilih Agama —</option>
                {AGAMA_OPTIONS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              <p className="text-[11px] text-[#9C8B7A] mt-1">Data agama diisi sesuai dokumen resmi. Jika salah satu calon pengantin bukan Katolik, proses administrasi akan diverifikasi lebih lanjut oleh Admin Sekretariat.</p>
            </div>
            <div>
              <label className={labelClass}>Pekerjaan <span className="text-red-400">*</span></label>
              <input type="text" required value={brideOccupation} onChange={e => setBrideOccupation(e.target.value)} className={inputClass} placeholder="contoh: Guru" />
            </div>
            <div>
              <label className={labelClass}>Nomor Telepon / WhatsApp <span className="text-red-400">*</span></label>
              <input type="tel" required value={bridePhone} onChange={e => setBridePhone(e.target.value)} className={inputClass} placeholder="contoh: 08198765432" />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Paroki Tempat Dibaptis / Asal Paroki <span className="text-red-400">*</span></label>
              <input type="text" required value={brideBaptismChurch} onChange={e => setBrideBaptismChurch(e.target.value)} className={inputClass} placeholder="contoh: Gereja Santa Maria Pontianak" />
            </div>
            <div>
              <label className={labelClass}>Nama Ayah <span className="text-red-400">*</span></label>
              <input type="text" required value={brideFatherName} onChange={e => setBrideFatherName(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Nama Ibu <span className="text-red-400">*</span></label>
              <input type="text" required value={brideMotherName} onChange={e => setBrideMotherName(e.target.value)} className={inputClass} />
            </div>
          </div>
        </div>

        {/* ═══════════════ INFORMASI PERKAWINAN ═══════════════ */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#EDE8DF]">
            <h2 className="font-bold text-[#3D2B1F] flex items-center gap-2 uppercase tracking-wide text-sm">
              <Heart size={18} className="text-[#B8960C]" /> Informasi Perkawinan
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Preferensi Tanggal Pemberkatan <span className="text-[#9C8B7A] normal-case font-normal">(opsional)</span></label>
              <input type="date" value={preferredWeddingDate} onChange={e => setPreferredWeddingDate(e.target.value)} className={inputClass} />
              <p className="text-[11px] text-[#9C8B7A] mt-1">Tanggal pemberkatan final akan ditentukan oleh Admin Sekretariat.</p>
            </div>
            <div>
              <label className={labelClass}>Preferensi Jam Pemberkatan <span className="text-[#9C8B7A] normal-case font-normal">(opsional)</span></label>
              <input type="time" value={preferredWeddingTime} onChange={e => setPreferredWeddingTime(e.target.value)} className={inputClass} />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Alamat Sesudah Perkawinan <span className="text-red-400">*</span></label>
              <input type="text" required value={postMarriageAddress} onChange={e => setPostMarriageAddress(e.target.value)} className={inputClass} placeholder="contoh: Jl. Ahmad Yani No. 123, Pontianak" />
            </div>
            <div>
              <label className={labelClass}>Misa / Tanpa Misa <span className="text-red-400">*</span></label>
              <select required value={ceremonyType} onChange={e => setCeremonyType(e.target.value)} className={inputClass}>
                <option value="">— Pilih Jenis Perayaan —</option>
                <option value="Misa">Misa</option>
                <option value="Tanpa Misa">Tanpa Misa</option>
              </select>
            </div>

            {/* Pastor Pemberkat — Info Only */}
            <div className="md:col-span-2">
              <label className={labelClass}>Pastor Pemberkat</label>
              <div className="flex items-center gap-3 px-4 py-3 rounded-md bg-[#F5F0E8] border border-[#EDE8DF]">
                <Info size={16} className="text-[#9C8B7A] flex-shrink-0" />
                <p className="text-sm text-[#9C8B7A] italic">Belum ditentukan oleh Admin Sekretariat</p>
              </div>
              <p className="text-[11px] text-[#9C8B7A] mt-1">Pastor Pemberkat akan ditugaskan oleh Admin Sekretariat setelah data pendaftaran diverifikasi.</p>
            </div>
          </div>
        </div>

        {/* ═══════════════ FOTO PASANGAN ═══════════════ */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#EDE8DF]">
            <h2 className="font-bold text-[#3D2B1F] flex items-center gap-2 uppercase tracking-wide text-sm">
              <Camera size={18} className="text-[#B8960C]" /> Foto Pasangan Calon Pengantin
            </h2>
          </div>
          <div className="p-6">
            <ImageUpload
              label="Foto Pasangan Calon Pengantin"
              value={couplePhoto}
              onChange={setCouplePhoto}
              aspectRatio={4 / 3}
              helpText="Foto menampilkan kedua calon pengantin dalam satu gambar, wajah terlihat jelas, berpakaian rapi dan sopan. Format: JPG, JPEG, PNG, WEBP. Maksimal 5 MB."
            />
          </div>
        </div>

        {/* ═══════════════ PERSETUJUAN ═══════════════ */}
        <div className="bg-[#FAF7F2] p-6 rounded-xl border border-[#EDE8DF]">
          <label className="flex items-start gap-4 cursor-pointer">
            <div className="pt-1">
              <input
                type="checkbox"
                required
                checked={agreement}
                onChange={(e) => setAgreement(e.target.checked)}
                className="w-5 h-5 rounded border-[#DDD8D0] text-[#B8960C] focus:ring-[#B8960C]"
              />
            </div>
            <div className="text-sm text-[#3D2B1F] leading-relaxed">
              Setelah membaca dan menyimak segala syarat dan ketentuan yang berlaku untuk menerima Sakramen Perkawinan di Gereja Katedral St. Yosef Pontianak, <strong>maka dengan ini saya menyatakan bahwa saya menyetujui dan mematuhi segala syarat dan ketentuan yang berlaku.</strong>
            </div>
          </label>
        </div>

        <div className="flex justify-end pt-4 border-t border-[#DDD8D0]">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-[#B8960C] text-white font-bold rounded-md hover:bg-[#9A7A00] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? "Menyimpan Data..." : "Simpan Profil & Lanjut ke Tahap 1"}
          </button>
        </div>
      </form>
    </div>
  );
}
