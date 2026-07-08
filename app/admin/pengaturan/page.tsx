"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { Loader2, CheckCircle2, AlertCircle, Church, Clock, Settings } from "lucide-react";

// Church info stored as a special content record
type ChurchInfo = {
  name: string;
  address: string;
  phone: string;
  email: string;
  operationalHours: string;
};

const DEFAULT_CHURCH: ChurchInfo = {
  name: "Katedral Santo Yosef Pontianak",
  address: "Jl. Pattimura Indah No. 195, Darat Sekip, Kec. Pontianak Kota, Kota Pontianak, Kalimantan Barat 78011",
  phone: "+62 851-7544-7819",
  email: "skrt.kat.ptk@gmail.com",
  operationalHours: "Senin–Jumat: 08.00–12.00 dan 13.00–16.00\nSabtu: 08.00–12.00\nMinggu & Hari Raya: Tutup",
};

export default function PengaturanAdminPage() {
  const session = authClient.useSession();

  // ─── Admin Profile ───────────────────────────────────────
  const [name, setName] = useState(session.data?.user?.name || "");
  const [loadingProfil, setLoadingProfil] = useState(false);
  const [msgProfil, setMsgProfil] = useState({ text: "", type: "" });

  // ─── Password ────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loadingPass, setLoadingPass] = useState(false);
  const [msgPass, setMsgPass] = useState({ text: "", type: "" });

  // ─── Church Info ─────────────────────────────────────────
  const [church, setChurch] = useState<ChurchInfo>(DEFAULT_CHURCH);
  const [loadingChurch, setLoadingChurch] = useState(false);
  const [fetchingChurch, setFetchingChurch] = useState(true);
  const [msgChurch, setMsgChurch] = useState({ text: "", type: "" });

  // Load church settings on mount
  useEffect(() => {
    fetch("/api/admin/pengaturan")
      .then((r) => r.json())
      .then((data) => {
        if (data.settings) setChurch({ ...DEFAULT_CHURCH, ...data.settings });
      })
      .finally(() => setFetchingChurch(false));
  }, []);

  const handleUpdateProfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingProfil(true);
    setMsgProfil({ text: "", type: "" });
    try {
      const { error } = await authClient.updateUser({ name });
      if (error) throw new Error(error.message);
      setMsgProfil({ text: "Profil berhasil diperbarui.", type: "success" });
    } catch (err: unknown) {
      setMsgProfil({ text: err instanceof Error ? err.message : "Terjadi kesalahan.", type: "error" });
    } finally {
      setLoadingProfil(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingPass(true);
    setMsgPass({ text: "", type: "" });
    if (newPassword !== confirmPassword) {
      setMsgPass({ text: "Konfirmasi kata sandi tidak cocok.", type: "error" });
      setLoadingPass(false);
      return;
    }
    if (newPassword.length < 8) {
      setMsgPass({ text: "Kata sandi baru minimal 8 karakter.", type: "error" });
      setLoadingPass(false);
      return;
    }
    try {
      const { error } = await authClient.changePassword({
        newPassword,
        currentPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message);
      setMsgPass({ text: "Kata sandi berhasil diubah.", type: "success" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      setMsgPass({ text: err instanceof Error ? err.message : "Terjadi kesalahan.", type: "error" });
    } finally {
      setLoadingPass(false);
    }
  };

  const handleSaveChurch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadingChurch(true);
    setMsgChurch({ text: "", type: "" });
    try {
      const res = await fetch("/api/admin/pengaturan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(church),
      });
      if (!res.ok) throw new Error("Gagal menyimpan.");
      setMsgChurch({ text: "Informasi gereja berhasil disimpan.", type: "success" });
    } catch (err: unknown) {
      setMsgChurch({ text: err instanceof Error ? err.message : "Terjadi kesalahan.", type: "error" });
    } finally {
      setLoadingChurch(false);
    }
  };

  const inputCls =
    "w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none";
  const textareaCls =
    "w-full px-4 py-3 border border-[#DDD8D0] rounded-md text-sm focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none resize-none";
  const labelCls =
    "block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2";

  return (
    <div className="max-w-3xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#3D2B1F] mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>
          Pengaturan
        </h1>
        <p className="text-[#6B6560] text-sm">Kelola informasi gereja dan akun admin Anda.</p>
      </div>

      {/* ── Church Info ── */}
      <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#EDE8DF] bg-[#FAF7F2] flex items-center gap-3">
          <Church size={18} className="text-[#B8960C]" />
          <div>
            <h2 className="font-bold text-[#3D2B1F]">Informasi Gereja</h2>
            <p className="text-xs text-[#6B6560] mt-0.5">Data yang tampil di halaman publik.</p>
          </div>
        </div>
        {fetchingChurch ? (
          <div className="p-6 flex items-center gap-2 text-[#A89880]">
            <Loader2 size={16} className="animate-spin" /> Memuat data...
          </div>
        ) : (
          <form onSubmit={handleSaveChurch} className="p-6 space-y-5">
            {msgChurch.text && (
              <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${msgChurch.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                {msgChurch.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                {msgChurch.text}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label className={labelCls}>Nama Gereja / Paroki</label>
                <input type="text" value={church.name} onChange={(e) => setChurch({ ...church, name: e.target.value })} required className={inputCls} />
              </div>
              <div className="md:col-span-2">
                <label className={labelCls}>Alamat Lengkap</label>
                <input type="text" value={church.address} onChange={(e) => setChurch({ ...church, address: e.target.value })} required className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Nomor Telepon</label>
                <input type="text" value={church.phone} onChange={(e) => setChurch({ ...church, phone: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Email Sekretariat</label>
                <input type="email" value={church.email} onChange={(e) => setChurch({ ...church, email: e.target.value })} className={inputCls} />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-[#EDE8DF]">
              <Clock size={15} className="text-[#A89880]" />
              <h3 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">Jam Operasional</h3>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <div>
                <label className={labelCls}>Jam Operasional Sekretariat</label>
                <textarea rows={4} value={church.operationalHours} onChange={(e) => setChurch({ ...church, operationalHours: e.target.value })} className={textareaCls} placeholder="Contoh: Senin–Jumat: 08.00–16.00" />
                <p className="text-[10px] text-[#A89880] mt-1">Satu baris per hari.</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={loadingChurch} className="flex items-center gap-2 px-6 py-2.5 bg-[#B8960C] text-white font-bold text-sm rounded-md hover:bg-[#9A7A00] transition-colors disabled:opacity-50">
                {loadingChurch && <Loader2 size={16} className="animate-spin" />}
                Simpan Informasi Gereja
              </button>
            </div>
          </form>
        )}
      </div>

      {/* ── Divider ── */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[#EDE8DF]" />
        <Settings size={14} className="text-[#A89880]" />
        <span className="text-xs text-[#A89880] uppercase tracking-wider font-semibold">Akun Admin</span>
        <div className="flex-1 h-px bg-[#EDE8DF]" />
      </div>

      {/* ── Profile ── */}
      <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#EDE8DF] bg-[#FAF7F2]">
          <h2 className="font-bold text-[#3D2B1F]">Informasi Profil Admin</h2>
          <p className="text-xs text-[#6B6560] mt-1">Nama yang tampil di sistem.</p>
        </div>
        <form onSubmit={handleUpdateProfil} className="p-6 space-y-5">
          {msgProfil.text && (
            <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${msgProfil.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {msgProfil.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {msgProfil.text}
            </div>
          )}
          <div>
            <label className={labelCls}>Email (Tidak dapat diubah)</label>
            <input type="email" value={session.data?.user?.email || ""} disabled className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm bg-gray-50 text-gray-500 cursor-not-allowed" />
          </div>
          <div>
            <label className={labelCls}>Nama Lengkap</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className={inputCls} />
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={loadingProfil || name === session.data?.user?.name} className="flex items-center gap-2 px-6 py-2.5 bg-[#B8960C] text-white font-bold text-sm rounded-md hover:bg-[#9A7A00] transition-colors disabled:opacity-50">
              {loadingProfil && <Loader2 size={16} className="animate-spin" />}
              Simpan Profil
            </button>
          </div>
        </form>
      </div>

      {/* ── Password ── */}
      <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#EDE8DF] bg-[#FAF7F2]">
          <h2 className="font-bold text-[#3D2B1F]">Keamanan (Ubah Kata Sandi)</h2>
          <p className="text-xs text-[#6B6560] mt-1">Minimal 8 karakter.</p>
        </div>
        <form onSubmit={handleUpdatePassword} className="p-6 space-y-5">
          {msgPass.text && (
            <div className={`p-3 rounded-md text-sm flex items-center gap-2 ${msgPass.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {msgPass.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              {msgPass.text}
            </div>
          )}
          <div>
            <label className={labelCls}>Kata Sandi Saat Ini</label>
            <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} required className={inputCls} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className={labelCls}>Kata Sandi Baru</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Konfirmasi Sandi Baru</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className={inputCls} />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button type="submit" disabled={loadingPass || !currentPassword || !newPassword || !confirmPassword} className="flex items-center gap-2 px-6 py-2.5 bg-[#3D2B1F] text-white font-bold text-sm rounded-md hover:bg-[#2C1F14] transition-colors disabled:opacity-50">
              {loadingPass && <Loader2 size={16} className="animate-spin" />}
              Perbarui Kata Sandi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
