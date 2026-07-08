"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { authClient } from "@/lib/auth-client";

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isLandingPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileMenuOpen(false);
  }, [pathname]);

  const navLinks = [
    { name: "Beranda",              href: "/" },
    { name: "Berita",               href: "/berita" },
    { name: "Jadwal Misa",          href: "/jadwal-misa" },
    { name: "Galeri",               href: "/galeri" },
    { name: "Sakramen Perkawinan",  href: "/sakramen-perkawinan" },
    { name: "Kontak",               href: "/kontak" },
  ];

  const isTransparent = isLandingPage && !scrolled && !mobileMenuOpen;

  return (
    <nav
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-500",
        isTransparent
          ? "bg-transparent border-b border-transparent"
          : "bg-[#FAF7F2]/95 backdrop-blur-md border-b border-[#E8E0D0]",
        !isTransparent && "shadow-[0_1px_8px_rgba(44,31,20,0.07)]"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-[72px]">

          {/* ── Logo ── */}
          <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
              <div
                className="w-14 h-14 md:w-16 md:h-16 flex items-center justify-center transition-colors duration-500 flex-shrink-0"
                style={{
                  backgroundColor: isTransparent ? "#FFFFFF" : "#B8960C",
                  WebkitMaskImage: "url('/logo-katedral.png')",
                  WebkitMaskSize: "contain",
                  WebkitMaskRepeat: "no-repeat",
                  WebkitMaskPosition: "center",
                  maskImage: "url('/logo-katedral.png')",
                  maskSize: "contain",
                  maskRepeat: "no-repeat",
                  maskPosition: "center",
                }}
              />
            <div>
              <span
                className={cn(
                  "font-bold text-[19px] leading-none block transition-colors duration-500",
                  isTransparent ? "text-white" : "text-[#2C1F14]"
                )}
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Katedral Santo Yosef
              </span>
              <span
                className={cn(
                  "text-[9px] uppercase tracking-[0.25em] font-bold block mt-0.5 transition-colors duration-500",
                  isTransparent ? "text-white/70" : "text-[#B8960C]"
                )}
              >
                Pontianak
              </span>
            </div>
          </Link>

          {/* ── Desktop Nav ── */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative px-3 py-2 text-[13px] font-medium tracking-wide rounded-md transition-all duration-200 group",
                    isTransparent
                      ? "text-white/85 hover:text-white hover:bg-white/10"
                      : isActive
                        ? "text-[#B8960C] bg-[#FDF3D0]"
                        : "text-[#6B5744] hover:text-[#2C1F14] hover:bg-[#F5F0E8]"
                  )}
                >
                  {link.name}
                  {/* Active underline */}
                  {isActive && !isTransparent && (
                    <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-[#B8960C] rounded-full" />
                  )}
                </Link>
              );
            })}

            {/* Divider */}
            <div className={cn(
              "w-px h-5 mx-2",
              isTransparent ? "bg-white/20" : "bg-[#E8E0D0]"
            )} />

            {/* CTA Masuk */}
            {session?.user ? (
              <Link
                href={(session.user as { role?: string }).role === "ADMIN" ? "/admin/ringkasan" : "/dasbor"}
                className={cn(
                  "px-5 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 border",
                  isTransparent
                    ? "border-white/50 text-white hover:bg-white hover:text-[#2C1F14]"
                    : "border-[#B8960C] text-[#B8960C] hover:bg-[#B8960C] hover:text-white"
                )}
              >
                Halo, {session.user.name}
              </Link>
            ) : (
              <Link
                href="/masuk"
                className={cn(
                  "px-5 py-2 text-[13px] font-semibold rounded-lg transition-all duration-200 border",
                  isTransparent
                    ? "border-white/50 text-white hover:bg-white hover:text-[#2C1F14]"
                    : "border-[#B8960C] text-[#B8960C] hover:bg-[#B8960C] hover:text-white"
                )}
              >
                Masuk
              </Link>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            className="md:hidden p-2 rounded-lg transition-colors"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Buka menu"
            style={{ color: isTransparent ? "#FFFFFF" : "#2C1F14" }}
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* ── Mobile Menu ── */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          "bg-[#FAF7F2] border-t border-[#E8E0D0]",
          mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0 pointer-events-none"
        )}
      >
        <div className="px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "block px-4 py-3 rounded-lg text-[14px] font-medium transition-colors",
                  isActive
                    ? "bg-[#FDF3D0] text-[#B8960C]"
                    : "text-[#6B5744] hover:bg-[#F5F0E8] hover:text-[#2C1F14]"
                )}
              >
                {link.name}
              </Link>
            );
          })}
          {session?.user ? (
            <>
              <div className="h-px bg-[#E8E0D0] my-2" />
              <Link
                href={(session.user as { role?: string }).role === "ADMIN" ? "/admin/ringkasan" : "/dasbor"}
                className="block px-4 py-3 rounded-lg text-[14px] font-semibold text-center bg-[#B8960C] text-white hover:bg-[#9A7A0A] transition-colors"
              >
                Dasbor ({session.user.name})
              </Link>
            </>
          ) : (
            <>
              <div className="h-px bg-[#E8E0D0] my-2" />
              <Link
                href="/masuk"
                className="block px-4 py-3 rounded-lg text-[14px] font-semibold text-center border border-[#B8960C] text-[#B8960C] hover:bg-[#FDF3D0] transition-colors"
              >
                Masuk
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
