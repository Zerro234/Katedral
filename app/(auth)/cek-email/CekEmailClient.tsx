"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function CekEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email") || "";
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  const handleResend = async () => {
    if (!email) {
      toast.error("Alamat email tidak ditemukan.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.sendVerificationEmail({
        email,
        callbackURL: "/dasbor/beranda",
      });
      if (error) throw new Error(error.message);
      toast.success("Email verifikasi telah dikirim ulang!");
      setCooldown(60);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Gagal mengirim ulang email.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  return (
    <div className="min-h-screen flex">
      {/* KOLOM KIRI (50%) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center flex-col"
      >
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 hover:scale-105"
          style={{ backgroundImage: 'url("/bg-login.jpg")' }}
        />
        <div className="absolute inset-0 bg-[#2C1F14]/70 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C1F14]/90 via-transparent to-transparent" />

        <div className="relative z-10 flex flex-col items-center text-center px-12 max-w-md">
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
            Pusat Informasi & Layanan Paroki
          </p>
        </div>
      </div>

      {/* KOLOM KANAN (50%) */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center py-12 relative"
        style={{ background: "#FAF7F2", padding: "48px" }}
      >
        {/* Back Button */}
        <Link
          href="/masuk"
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-[13px] font-semibold transition-colors hover:text-[#B8960C]"
          style={{ color: "#9C8B7A" }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Login</span>
        </Link>

        <div className="w-full max-w-md text-center">
          <div className="flex justify-center mb-6">
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#B8960C"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="20" height="16" x="2" y="4" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
          </div>

          <h2
            className="mb-4"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "32px",
              color: "#3D2B1F",
            }}
          >
            Cek Email Anda
          </h2>
          <p
            className="mb-2"
            style={{
              fontFamily: "var(--font-dm-sans)",
              fontSize: "15px",
              color: "#6B6560",
            }}
          >
            Kami telah mengirim link aktivasi akun ke email
          </p>
          <p className="font-bold mb-8" style={{ color: "#3D2B1F", fontSize: "16px" }}>
            {email || "yang Anda daftarkan"}
          </p>

          <a
            href="mailto:"
            className="w-full rounded-md flex items-center justify-center transition-opacity hover:opacity-90"
            style={{
              height: "48px",
              background: "#B8960C",
              color: "#FFFFFF",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              fontWeight: "bold",
              marginBottom: "24px"
            }}
          >
            Buka Aplikasi Email
          </a>

          <p style={{ fontSize: "14px", color: "#6B6560" }}>
            <button 
              onClick={handleResend}
              disabled={loading || cooldown > 0}
              className="font-medium hover:underline mb-4 disabled:opacity-50 disabled:no-underline" 
              style={{ color: "#B8960C" }}
            >
              {loading ? "Mengirim..." : cooldown > 0 ? `Kirim ulang tersedia dalam ${cooldown}s` : "Kirim ulang email aktivasi"}
            </button>
          </p>
          
          <p style={{ fontSize: "12px", color: "#A89880" }}>
            Catatan: Cek folder spam jika tidak menemukan email dalam 5 menit.
          </p>
        </div>
      </div>
    </div>
  );
}
