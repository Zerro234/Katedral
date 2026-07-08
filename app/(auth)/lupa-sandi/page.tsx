"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";

export default function LupaSandiPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [isSent, setIsSent] = useState(false);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Mohon masukkan alamat email Anda.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Format alamat email tidak valid.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-sandi",
      });

      if (error) {
        console.error("Lupa Sandi Error Message:", error.message);
        console.error("Lupa Sandi Error Status:", error.status);
        throw new Error(error.message || `Gagal mengirim email (Status: ${error?.status || 'Unknown'})`);
      }

      setIsSent(true);
      toast.success("Tautan pemulihan telah dikirim ke email Anda.");
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Terjadi kesalahan sistem.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FDFBF7]">
      {/* ── LEFT PANEL: Brand/Visual ── */}
      <div
        className="hidden lg:flex lg:w-[45%] relative overflow-hidden flex-col items-center justify-center"
      >
        {/* Background Image */}
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: 'url("/bg-login.jpg")' }}
        />
        {/* Dark Overlay for text readability */}
        <div className="absolute inset-0 bg-[#2C1F14]/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1F14]/90 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-md">
          {/* Logo */}
          <div className="mb-8 drop-shadow-xl">
            <img 
              src="/logo-katedral.png" 
              alt="Logo Katedral Santo Yosef" 
              className="w-28 h-auto object-contain"
            />
          </div>

          <h1
            className="text-white mb-4 leading-tight drop-shadow-md"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "42px",
              fontWeight: 700,
            }}
          >
            Katedral Santo Yosef
          </h1>

          <p
            className="text-[17px] italic leading-relaxed mb-8 drop-shadow-md"
            style={{
              fontFamily: "var(--font-cormorant)",
              color: "rgba(253,247,242,0.9)",
            }}
          >
            Sistem Informasi Pendaftaran<br />Sakramen Perkawinan
          </p>

          <div
            className="w-12 h-px mb-8"
            style={{ background: "#B8960C", opacity: 0.8 }}
          />

          <p
            className="text-[13px] leading-relaxed font-semibold drop-shadow-md"
            style={{ color: "rgba(253,247,242,0.7)", letterSpacing: "0.08em" }}
          >
            KEUSKUPAN AGUNG PONTIANAK
          </p>
        </div>
      </div>

      {/* ── RIGHT PANEL: Form ── */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 relative">
        <Link
          href="/masuk"
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-[13px] font-semibold transition-colors hover:text-[#B8960C]"
          style={{ color: "#9C8B7A" }}
        >
          <ArrowLeft size={16} /> Kembali ke Masuk
        </Link>

        <div className="w-full max-w-[400px]">
          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#B8960C" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 20V10" />
                <path d="M6 20V10" />
                <path d="M12 20V4" />
                <path d="M12 4l6 6" />
                <path d="M12 4l-6 6" />
                <path d="M4 20h16" />
              </svg>
            </div>
            <span
              className="font-bold text-[18px]"
              style={{ fontFamily: "var(--font-cormorant)", color: "#B8960C" }}
            >
              Katedral Santo Yosef
            </span>
          </div>
          
          <div className="mb-10 text-center lg:text-left">
            <h2
              className="mb-1"
              style={{
                fontFamily: "var(--font-cormorant)",
                fontSize: "30px",
                color: "#2C1F14",
                fontWeight: 700,
              }}
            >
              Lupa Kata Sandi
            </h2>
            <p className="mb-8 text-[14px]" style={{ color: "#9C8B7A" }}>
              Masukkan alamat email yang terdaftar. Kami akan mengirimkan tautan untuk mengatur ulang kata sandi Anda.
            </p>
          </div>

          {isSent ? (
            <div className="bg-[#F0F5ED] border border-[#D5E5C9] p-6 rounded-lg text-center">
              <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
              </div>
              <h3 className="text-[#3D2B1F] font-bold text-lg mb-2">Periksa Email Anda</h3>
              <p className="text-[#6B6560] text-sm mb-6">
                Tautan pemulihan kata sandi telah dikirim ke <span className="font-bold">{email}</span>. Silakan periksa folder Inbox atau Spam Anda.
              </p>
              <button
                onClick={() => setIsSent(false)}
                className="text-[#B8960C] text-sm font-semibold hover:underline"
              >
                Kirim ulang email
              </button>
            </div>
          ) : (
            <form onSubmit={handleReset} noValidate className="space-y-4">
              <div>
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#6B5744" }}
                >
                  Alamat Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 rounded-lg text-[14px] outline-none transition-all input-gold"
                  style={{
                    height: "44px",
                    border: "1px solid #E8E0D0",
                    background: "#FFFFFF",
                    color: "#2C1F14",
                  }}
                  placeholder="nama@email.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center rounded-lg font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 active:scale-[0.98]"
                style={{
                  height: "46px",
                  background: "#B8960C",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                  marginTop: "16px",
                }}
              >
                {loading ? "Mengirim..." : "Kirim Tautan Pemulihan"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
