"use client";

import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, EyeOff, CheckCircle2, Check } from "lucide-react";
import Link from "next/link";

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

export default function ResetSandiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsClient(true);
  }, []);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || !confirmPassword) {
      toast.error("Mohon lengkapi kata sandi baru Anda.");
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
      const token = new URLSearchParams(window.location.search).get("token");
      
      if (!token) {
        toast.error("Tautan tidak valid atau tidak memiliki token pemulihan.");
        setLoading(false);
        return;
      }

      const { error } = await authClient.resetPassword({
        newPassword: password,
        token,
      });

      if (error) {
        throw new Error(error.message || "Gagal mengatur ulang kata sandi. Tautan mungkin telah kedaluwarsa.");
      }

      setIsSuccess(true);
      toast.success("Kata sandi berhasil diubah!");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      toast.error(err.message || "Terjadi kesalahan sistem.");
    } finally {
      setLoading(false);
    }
  };

  if (!isClient) return null; // Mencegah hydration mismatch

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
              Atur Ulang Sandi
            </h2>
            <p className="mb-8 text-[14px]" style={{ color: "#9C8B7A" }}>
              Masukkan kata sandi baru Anda untuk akun ini.
            </p>
          </div>

          {isSuccess ? (
            <div className="bg-[#F0F5ED] border border-[#D5E5C9] p-6 rounded-lg text-center">
              <CheckCircle2 size={48} className="text-green-600 mx-auto mb-4" />
              <h3 className="text-[#3D2B1F] font-bold text-lg mb-2">Berhasil!</h3>
              <p className="text-[#6B6560] text-sm mb-6">
                Kata sandi Anda telah berhasil diatur ulang. Anda sekarang dapat masuk menggunakan kata sandi baru.
              </p>
              <Link 
                href="/masuk" 
                className="w-full flex items-center justify-center rounded-lg font-bold text-white transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  height: "46px",
                  background: "#B8960C",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                }}
              >
                Masuk ke Dasbor
              </Link>
            </div>
          ) : (
            <form onSubmit={handleReset} noValidate className="space-y-4">
              <div>
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#6B5744" }}
                >
                  Kata Sandi Baru
                </label>
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
                    placeholder="Minimal 8 karakter"
                    minLength={8}
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

              <div>
                <label
                  className="block text-[11px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#6B5744" }}
                >
                  Ulangi Sandi Baru
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 pr-11 rounded-lg text-[14px] outline-none transition-all input-gold"
                    style={{
                      height: "44px",
                      border: `1px solid ${
                        confirmPassword && confirmPassword !== password
                          ? "#E53935"
                          : confirmPassword && confirmPassword === password
                          ? "#43A047"
                          : "#E8E0D0"
                      }`,
                      background: "#FFFFFF",
                      color: "#2C1F14",
                    }}
                    placeholder="Ulangi kata sandi"
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                    style={{ color: "#9C8B7A" }}
                  >
                    {showConfirmPassword ? <EyeOff size={17} /> : <Eye size={17} />}
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
                className="w-full flex items-center justify-center rounded-lg font-bold text-white transition-all hover:opacity-90 disabled:opacity-60 active:scale-[0.98]"
                style={{
                  height: "46px",
                  background: "#B8960C",
                  fontFamily: "var(--font-dm-sans)",
                  fontSize: "14px",
                  marginTop: "16px",
                }}
              >
                {loading ? "Menyimpan..." : "Simpan Kata Sandi"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
