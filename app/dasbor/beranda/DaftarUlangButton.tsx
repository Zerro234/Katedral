"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, Loader2, AlertTriangle, X } from "lucide-react";

export default function DaftarUlangButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);

  const handleDaftarUlang = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/dasbor/daftar-ulang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal mendaftar ulang.");
      setDone(true);
      setShowModal(false);
      setTimeout(() => {
        router.refresh();
      }, 1500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#FDF3D0] text-[#B8960C] border border-[#E8D070] font-bold text-sm rounded-md">
        ⏳ Pengajuan daftar ulang terkirim! Memuat ulang...
      </div>
    );
  }

  return (
    <div>
      <button
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#B8960C] text-white font-bold text-[13px] rounded-lg hover:bg-[#9A7A00] transition-colors shadow-sm disabled:opacity-60"
      >
        {loading ? (
          <Loader2 size={16} className="animate-spin" />
        ) : (
          <RefreshCw size={16} />
        )}
        {loading ? "Memproses..." : "Ajukan Daftar Ulang"}
      </button>

      {/* Modal Konfirmasi */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FFF8E1] px-5 py-4 flex items-center justify-between border-b border-[#F0E6D2]">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B8960C]/10 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-[#B8960C]" />
                </div>
                <h3 className="font-bold text-[#3D2B1F]">Konfirmasi</h3>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#9C8B7A] hover:text-[#3D2B1F] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5">
              <p className="text-[14px] text-[#6B5744] mb-5 leading-relaxed">
                Anda akan mengajukan pendaftaran ulang. Pengajuan ini akan dikirim ke Sekretariat Katedral untuk ditinjau. Setelah disetujui, Anda dapat mulai melengkapi dokumen dari awal.
              </p>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-[13px] font-medium">
                  {error}
                </div>
              )}

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-white border border-[#DDD8D0] text-[#6B6560] font-bold text-[13px] rounded-lg hover:bg-[#FAF7F2] transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleDaftarUlang}
                  disabled={loading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-[#B8960C] text-white font-bold text-[13px] rounded-lg hover:bg-[#9A7A00] transition-colors shadow-sm disabled:opacity-50"
                >
                  {loading ? <Loader2 size={14} className="animate-spin" /> : null}
                  {loading ? "Memproses..." : "Ya, Lanjutkan"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
