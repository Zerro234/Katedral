import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#FAF7F2] flex items-center justify-center p-4 text-center">
      <div className="max-w-md w-full">
        <h1 
          className="text-8xl font-bold text-[#B8960C] mb-4" 
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          404
        </h1>
        <h2 
          className="text-2xl font-bold text-[#3D2B1F] mb-4"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Halaman Tidak Ditemukan
        </h2>
        <p className="text-[#6B6560] mb-8">
          Maaf, halaman yang Anda cari mungkin telah dihapus, diubah namanya, atau tidak pernah ada.
        </p>
        <Link 
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#3D2B1F] text-white font-bold rounded-md hover:bg-[#2C1F14] transition-colors"
        >
          <ArrowLeft size={18} />
          Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
