"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home,
  FileText,
  Bell,
  User,
  LogOut,
  Church,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

export function SidebarUser() {
  const pathname = usePathname();
  const router = useRouter();
  const [notifCount, setNotifCount] = useState(0);

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/masuk");
  };

  useEffect(() => {
    const fetchCount = () => {
      fetch("/api/notifikasi/count")
        .then((r) => r.json())
        .then((data) => setNotifCount(data.count || 0));
    };

    fetchCount();

    const handleNotifRead = () => setNotifCount(0);
    window.addEventListener("notif-read", handleNotifRead);
    return () => window.removeEventListener("notif-read", handleNotifRead);
  }, []);

  const navItems = [
    { icon: Home,     label: "Beranda",   href: "/dasbor/beranda" },
    { icon: FileText, label: "Dokumen",   href: "/dasbor/dokumen" },
    { icon: Bell,     label: "Notifikasi", href: "/dasbor/notifikasi", badge: notifCount },
    { icon: User,     label: "Profil Saya", href: "/dasbor/profil" },
  ];

  return (
    <aside
      className="hidden md:flex h-screen w-[240px] flex-shrink-0 flex-col justify-between"
      style={{
        background: "#FFFFFF",
        borderRight: "1px solid #E8E0D0",
      }}
    >
      {/* ── Top ── */}
      <div>
        {/* Brand header */}
        <Link
          href="/"
          className="flex flex-col items-center gap-2 px-6 pt-7 pb-6 transition-colors hover:bg-[#FDFBF7]"
          style={{ borderBottom: "1px solid #E8E0D0" }}
        >
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
               style={{ background: "#B8960C" }}>
            <Church size={22} color="#FFFFFF" />
          </div>
          <div className="text-center">
            <p className="font-bold leading-tight"
               style={{ fontFamily: "var(--font-cormorant)", fontSize: "17px", color: "#2C1F14" }}>
              Katedral Santo Yosef
            </p>
            <p className="text-[11px] uppercase tracking-wider mt-0.5"
               style={{ color: "#B8960C", fontFamily: "var(--font-dm-sans)", fontWeight: 600 }}>
              Portal Pengantin
            </p>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="flex flex-col px-3 pt-4 gap-0.5">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between rounded-lg px-4 py-2.5 text-[13px] transition-all duration-150",
                  isActive ? "user-nav-active" : "user-nav-item"
                )}
                style={{ fontFamily: "var(--font-dm-sans)" }}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    size={17}
                    color={isActive ? "#B8960C" : "#9C8B7A"}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {item.label}
                </div>
                {item.badge ? (
                  <span
                    className="flex items-center justify-center rounded-full text-white font-bold"
                    style={{
                      minWidth: "18px",
                      height: "18px",
                      fontSize: "10px",
                      background: "#8B3A3A",
                      padding: "0 4px",
                    }}
                  >
                    {item.badge}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* ── Bottom ── */}
      <div>
        <div style={{ height: "1px", background: "#E8E0D0" }} />
        <div className="p-3">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 rounded-lg px-4 py-2.5 text-[13px] text-left transition-all hover:bg-[#FAEDED]"
            style={{ color: "#8B3A3A", fontFamily: "var(--font-dm-sans)" }}
          >
            <LogOut size={17} />
            Keluar
          </button>
        </div>
      </div>
    </aside>
  );
}
