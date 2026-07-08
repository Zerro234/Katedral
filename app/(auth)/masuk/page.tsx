"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Church, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function MasukPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({ provider: "google", callbackURL: "/dasbor" });
    } catch {
      toast.error("Terjadi kesalahan saat masuk dengan Google.");
      setLoading(false);
    }
  };

  const handleManualSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error("Mohon isi email dan kata sandi Anda."); return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) { toast.error("Format alamat email tidak valid."); return; }

    setLoading(true);
    try {
      const { data, error: signInError } = await authClient.signIn.email({ email, password });
      
      if (signInError) {
        if (signInError.status === 403) {
          toast.error("Email Anda belum diverifikasi.");
          router.push(`/cek-email?email=${encodeURIComponent(email)}`);
          return;
        }
        throw new Error(signInError.message || "Gagal masuk.");
      }
      
      toast.success("Berhasil masuk!");
      const user = data?.user as { role?: string } | undefined;
      router.push(user?.role === "ADMIN" ? "/admin/ringkasan" : "/dasbor/beranda");
      router.refresh();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "#FAF7F2" }}>

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
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-[13px] font-semibold transition-colors hover:text-[#B8960C]"
          style={{ color: "#9C8B7A" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        <div className="w-full max-w-[400px]">

          {/* Mobile Logo */}
          <div className="flex items-center justify-center gap-2.5 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#B8960C" }}>
              <Church size={18} color="#FFFFFF" />
            </div>
            <span
              className="font-bold text-[18px]"
              style={{ fontFamily: "var(--font-cormorant)", color: "#B8960C" }}
            >
              Katedral Santo Yosef
            </span>
          </div>

          {/* Heading */}
          <h2
            className="mb-1"
            style={{
              fontFamily: "var(--font-cormorant)",
              fontSize: "30px",
              color: "#2C1F14",
              fontWeight: 700,
            }}
          >
            Masuk ke Akun Anda
          </h2>
          <p className="mb-8 text-[14px]" style={{ color: "#9C8B7A" }}>
            Selamat datang kembali. Silakan masuk untuk melanjutkan.
          </p>

          {/* Google Button */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-lg transition-all hover:shadow-sm disabled:opacity-60 mb-6"
            style={{
              height: "46px",
              background: "#FFFFFF",
              border: "1px solid #E8E0D0",
              color: "#2C1F14",
              fontFamily: "var(--font-dm-sans)",
              fontSize: "14px",
              fontWeight: 600,
            }}
          >
            {loading ? (
              "Memproses..."
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Lanjutkan dengan Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full" style={{ borderTop: "1px solid #E8E0D0" }} />
            </div>
            <div className="relative flex justify-center">
              <span
                className="px-3 text-[11px] font-bold uppercase tracking-widest"
                style={{ background: "#FAF7F2", color: "#9C8B7A" }}
              >
                atau masuk dengan email
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleManualSignIn} noValidate className="space-y-4">
            {/* Email */}
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

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider"
                  style={{ color: "#6B5744" }}
                >
                  Kata Sandi
                </label>
                <Link
                  href="/lupa-sandi"
                  className="text-[12px] font-semibold hover:underline"
                  style={{ color: "#B8960C" }}
                >
                  Lupa Sandi?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 pr-11 rounded-lg text-[14px] outline-none transition-all input-gold"
                  style={{
                    height: "44px",
                    border: "1px solid #E8E0D0",
                    background: "#FFFFFF",
                    color: "#2C1F14",
                  }}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: "#9C8B7A" }}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center rounded-lg font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 active:scale-[0.98]"
              style={{
                height: "46px",
                background: "#B8960C",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                marginTop: "8px",
              }}
            >
              {loading ? "Memproses..." : "Masuk"}
            </button>
          </form>

          {/* Register link */}
          <p
            className="mt-8 text-center text-[14px]"
            style={{ color: "#9C8B7A" }}
          >
            Belum punya akun?{" "}
            <Link
              href="/daftar"
              className="font-bold hover:underline"
              style={{ color: "#B8960C" }}
            >
              Buat Akun
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
