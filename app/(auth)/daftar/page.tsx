"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { toast } from "sonner";

// ── Password Strength Helpers ──────────────────────────────────────────────
type StrengthLevel = 0 | 1 | 2 | 3 | 4;

function calcStrength(pwd: string): StrengthLevel {
  if (!pwd) return 0;
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score as StrengthLevel;
}

const STRENGTH_CONFIG = [
  { label: "", color: "" },
  { label: "Lemah",       color: "#E53935" },
  { label: "Cukup",       color: "#FB8C00" },
  { label: "Kuat",        color: "#43A047" },
  { label: "Sangat Kuat", color: "#1E88E5" },
];

export default function DaftarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dasbor",
      });
    } catch {
      toast.error("Terjadi kesalahan saat mendaftar dengan Google.");
      setLoading(false);
    }
  };

  const handleManualSignUp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password || !confirmPassword) {
      toast.error("Mohon lengkapi semua data pendaftaran.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error("Format alamat email tidak valid.");
      return;
    }

    if (password.length < 8) {
      toast.error("Kata sandi harus memiliki minimal 8 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Konfirmasi kata sandi tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      const { error: signUpError } = await authClient.signUp.email({
        email,
        password,
        name,
      });

      if (signUpError) {
        throw new Error(signUpError.message || "Gagal mendaftar");
      }

      toast.success("Akun berhasil dibuat! Silakan cek email Anda.");
      router.push(`/cek-email?email=${encodeURIComponent(email)}`);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* KOLOM KIRI (50%) */}
      <div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center flex-col"
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

      {/* KOLOM KANAN (50%) */}
      <div
        className="w-full lg:w-1/2 flex items-center justify-center py-12 relative"
        style={{ background: "#FAF7F2", padding: "48px" }}
      >
        {/* Back Button */}
        <Link
          href="/"
          className="absolute top-6 left-6 sm:top-8 sm:left-8 flex items-center gap-2 text-[13px] font-semibold transition-colors hover:text-[#B8960C]"
          style={{ color: "#9C8B7A" }}
        >
          <ArrowLeft size={16} />
          Kembali ke Beranda
        </Link>

        <div className="w-full max-w-md">
          <h2
            className="mb-2 text-center lg:text-left"
            style={{ fontFamily: "var(--font-cormorant)", fontSize: "32px", color: "#3D2B1F" }}
          >
            Buat Akun Baru
          </h2>
          <p
            className="mb-6 text-center lg:text-left"
            style={{ fontFamily: "var(--font-dm-sans)", fontSize: "14px", color: "#6B6560" }}
          >
            Daftarkan diri Anda untuk memantau progres pendaftaran pernikahan secara online.
          </p>

          <div className="space-y-4 mb-6">
            <button
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full rounded-md flex items-center justify-center gap-3 transition-opacity hover:opacity-90 disabled:opacity-70 bg-white border border-[#DDD8D0] shadow-sm"
              style={{ height: "48px", color: "#3D2B1F", fontFamily: "var(--font-dm-sans)", fontSize: "14px", fontWeight: "bold" }}
            >
              {loading ? (
                "Memproses..."
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Daftar dengan Google
                </>
              )}
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#DDD8D0]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-[#FAF7F2] text-[#A89880] text-xs font-bold uppercase tracking-wider">
                ATAU DAFTAR DENGAN EMAIL
              </span>
            </div>
          </div>

          <form onSubmit={handleManualSignUp} noValidate className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#6B6560] mb-1.5 uppercase tracking-wide">Nama</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-[#DDD8D0] bg-white text-[#3D2B1F] focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none text-sm transition-shadow"
                placeholder="Nama Anda"
              />
            </div>
            
            <div>
              <label className="block text-xs font-bold text-[#6B6560] mb-1.5 uppercase tracking-wide">Alamat Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-11 px-3 rounded-md border border-[#DDD8D0] bg-white text-[#3D2B1F] focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none text-sm transition-shadow"
                placeholder="nama@email.com"
              />
            </div>

            {/* ── Kata Sandi ── */}
            <div>
              <label className="block text-xs font-bold text-[#6B6560] mb-1.5 uppercase tracking-wide">Kata Sandi</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 px-3 pr-10 rounded-md border border-[#DDD8D0] bg-white text-[#3D2B1F] focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none text-sm transition-shadow"
                  placeholder="Min. 8 karakter"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89880] hover:text-[#6B6560] transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* ── Password Strength Indicator ── */}
              {password.length > 0 && (
                <div className="mt-2">
                  {/* 4 progress bars */}
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = calcStrength(password);
                      const active = strength >= level;
                      const cfg = STRENGTH_CONFIG[strength];
                      return (
                        <div
                          key={level}
                          className="h-1 flex-1 rounded-full transition-all duration-300"
                          style={{
                            background: active ? cfg.color : "#E8E2DA",
                            opacity: active ? 1 : 0.5,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Label kekuatan */}
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[11px] font-semibold transition-colors duration-300"
                      style={{ color: STRENGTH_CONFIG[calcStrength(password)].color }}
                    >
                      {STRENGTH_CONFIG[calcStrength(password)].label}
                    </span>

                    {/* Checklist kriteria */}
                    <div className="flex gap-2">
                      {[
                        { ok: password.length >= 8,          tip: "8+ karakter" },
                        { ok: /[A-Z]/.test(password),        tip: "Huruf besar" },
                        { ok: /[0-9]/.test(password),        tip: "Angka" },
                        { ok: /[^A-Za-z0-9]/.test(password), tip: "Simbol" },
                      ].map(({ ok, tip }) => (
                        <span
                          key={tip}
                          title={tip}
                          className="flex items-center gap-0.5 text-[10px] font-medium transition-colors duration-200"
                          style={{ color: ok ? "#43A047" : "#C4B8AD" }}
                        >
                          <Check size={10} strokeWidth={ok ? 3 : 1.5} />
                          {tip}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Ulangi Sandi ── */}
            <div>
              <label className="block text-xs font-bold text-[#6B6560] mb-1.5 uppercase tracking-wide">Ulangi Sandi</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full h-11 px-3 pr-10 rounded-md border bg-white text-[#3D2B1F] focus:ring-1 outline-none text-sm transition-shadow ${
                    confirmPassword && confirmPassword !== password
                      ? "border-[#E53935] focus:border-[#E53935] focus:ring-[#E53935]"
                      : confirmPassword && confirmPassword === password
                      ? "border-[#43A047] focus:border-[#43A047] focus:ring-[#43A047]"
                      : "border-[#DDD8D0] focus:border-[#B8960C] focus:ring-[#B8960C]"
                  }`}
                  placeholder="Ulangi kata sandi"
                  minLength={8}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A89880] hover:text-[#6B6560] transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <p
                  className="mt-1 text-[11px] font-medium transition-colors duration-200"
                  style={{ color: confirmPassword === password ? "#43A047" : "#E53935" }}
                >
                  {confirmPassword === password ? "✓ Kata sandi cocok" : "✗ Kata sandi tidak cocok"}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md flex items-center justify-center transition-colors disabled:opacity-70"
              style={{
                height: "48px",
                background: "#B8960C",
                color: "white",
                fontFamily: "var(--font-dm-sans)",
                fontSize: "14px",
                fontWeight: "bold",
                marginTop: "24px"
              }}
            >
              {loading ? "Memproses..." : "Daftar Akun"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p style={{ fontSize: "14px", color: "#6B6560" }}>
              Sudah punya akun?{" "}
              <Link href="/masuk" className="font-bold hover:underline" style={{ color: "#B8960C" }}>
                Masuk
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
