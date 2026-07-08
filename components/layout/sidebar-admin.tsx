"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Plus,
  Settings,
  LogOut,
  Church,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SidebarAdmin() {
  const pathname = usePathname();
  const router = useRouter();

  const session = authClient.useSession();
  const userName = session.data?.user?.name || "Administrator Katedral";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/masuk");
  };

  const navItems = [
    { icon: LayoutDashboard, label: "Ringkasan",       href: "/admin/ringkasan" },
    { icon: FileText,        label: "Data Pernikahan", href: "/admin/pernikahan" },
    { icon: BookOpen,        label: "Kelola Konten",   href: "/admin/konten" },
  ];

  return (
    <aside
      className="hidden md:flex h-screen w-[240px] flex-shrink-0 flex-col justify-between border-r-0"
      style={{ background: "#2C1F14" }}
    >
      {/* ── Top ── */}
      <div>
        {/* Logo / Brand */}
        <div className="px-5 pt-6 pb-5 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link href="/" className="flex items-center gap-3 group mb-4">
            <div className="w-9 h-9 rounded-full flex items-center justify-center"
                 style={{ background: "#B8960C" }}>
              <Church size={18} color="#FFFFFF" />
            </div>
            <div>
              <p className="text-white font-bold leading-none"
                 style={{ fontFamily: "var(--font-cormorant)", fontSize: "16px" }}>
                Katedral
              </p>
              <p className="text-[10px] uppercase tracking-widest font-bold"
                 style={{ color: "#B8960C" }}>
                Santo Yosef
              </p>
            </div>
          </Link>

          {/* User info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white"
                 style={{ background: "rgba(184,150,12,0.3)", fontSize: "15px", fontFamily: "var(--font-cormorant)" }}>
              {userInitial}
            </div>
            <div className="min-w-0">
              <p className="text-white font-semibold text-[13px] truncate"
                 style={{ fontFamily: "var(--font-dm-sans)" }}>
                {userName}
              </p>
              <p className="text-[10px] uppercase tracking-wider"
                 style={{ color: "#9C8B7A", fontFamily: "var(--font-dm-sans)" }}>
                Admin Sekretariat
              </p>
            </div>
          </div>
        </div>

        {/* New Pengumuman Button */}
        <div className="px-4 pt-5 pb-3">
          <Link
            href="/admin/konten/tambah"
            className="w-full flex items-center justify-center gap-2 rounded-lg font-semibold text-[13px] text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{
              height: "40px",
              background: "#B8960C",
              fontFamily: "var(--font-dm-sans)",
            }}
          >
            <Plus size={15} />
            Buat Konten Baru
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex flex-col px-3 gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] transition-all duration-150",
                  isActive ? "admin-nav-active" : "admin-nav-item"
                )}
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <Icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom ── */}
      <div>
        <div style={{ height: "1px", background: "rgba(255,255,255,0.08)" }} />
        <div className="p-3 flex flex-col gap-0.5">
          <Link
            href="/admin/pengaturan"
            className={cn(
              "flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] admin-nav-item",
            )}
            style={{ fontFamily: "var(--font-dm-sans)" }}
          >
            <Settings size={17} />
            Pengaturan
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] transition-all hover:bg-red-500/10 text-left w-full"
            style={{ color: "#E87070", fontFamily: "var(--font-dm-sans)" }}
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </div>
    </aside>
  );
}
