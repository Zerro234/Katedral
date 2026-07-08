"use client";

import {
  Bell,
  Menu,
  Home,
  FileText,
  User,
  LogOut,
  LayoutDashboard,
  BookOpen,
  Settings,
  Church,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface HeaderBarProps {
  title: string;
}

export function HeaderBar({ title }: HeaderBarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

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

  const handleLogout = async () => {
    await authClient.signOut();
    router.push("/masuk");
  };

  const isAdmin = pathname.startsWith("/admin");

  const adminNavItems = [
    { icon: LayoutDashboard, label: "Ringkasan",       href: "/admin/ringkasan" },
    { icon: FileText,        label: "Data Pernikahan", href: "/admin/pernikahan" },
    { icon: BookOpen,        label: "Kelola Konten",   href: "/admin/konten" },
    { icon: Settings,        label: "Pengaturan",      href: "/admin/pengaturan" },
  ];

  const coupleNavItems = [
    { icon: Home,     label: "Beranda",    href: "/dasbor/beranda" },
    { icon: FileText, label: "Dokumen",    href: "/dasbor/dokumen" },
    { icon: Bell,     label: "Notifikasi", href: "/dasbor/notifikasi", badge: notifCount },
    { icon: User,     label: "Profil Saya", href: "/dasbor/profil" },
  ];

  const activeNavItems = isAdmin ? adminNavItems : coupleNavItems;
  const subtitle = isAdmin ? "Panel Administrasi" : "Portal Pengantin";

  const MobileNavLink = ({
    item,
  }: {
    item: (typeof activeNavItems)[0];
  }) => {
    const isActive = pathname.startsWith(item.href);
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        onClick={() => setOpen(false)}
        className={cn(
          "flex items-center justify-between rounded-lg px-4 py-2.5 text-[13px] transition-all duration-150",
          isActive ? "user-nav-active" : "user-nav-item"
        )}
        style={{ fontFamily: "var(--font-dm-sans)" }}
      >
        <div className="flex items-center gap-3">
          <Icon size={17} color={isActive ? "#B8960C" : "#9C8B7A"} />
          {item.label}
        </div>
        {"badge" in item && (item as { badge?: number }).badge ? (
          <span
            className="flex items-center justify-center rounded-full text-white font-bold"
            style={{ minWidth: 18, height: 18, fontSize: 10, background: "#8B3A3A", padding: "0 4px" }}
          >
            {(item as { badge?: number }).badge}
          </span>
        ) : null}
      </Link>
    );
  };

  return (
    <header
      className="flex items-center justify-between flex-shrink-0 z-10"
      style={{
        height: "58px",
        background: "#FFFFFF",
        borderBottom: "1px solid #E8E0D0",
        padding: "0 20px",
        boxShadow: "0 1px 4px rgba(44,31,20,0.05)",
      }}
    >
      {/* Left: Mobile menu + Page title */}
      <div className="flex items-center gap-3">
        {/* Mobile Sheet Trigger */}
        <div className="md:hidden">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
              className="p-2 -ml-2 rounded-lg transition-colors hover:bg-[#F5F0E8]"
              style={{ color: "#2C1F14" }}
            >
              <Menu size={22} />
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-[260px] p-0 border-r"
              style={{ background: "#FFFFFF", borderColor: "#E8E0D0" }}
            >
              <div className="flex flex-col h-full justify-between">
                <div>
                  {/* Mobile Sidebar Header */}
                  <Link
                    href="/"
                    className="flex flex-col items-center gap-2 px-6 pt-7 pb-6 hover:bg-[#FAF7F2] transition-colors"
                    style={{ borderBottom: "1px solid #E8E0D0" }}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center shadow-md"
                      style={{ background: "#B8960C" }}
                    >
                      <Church size={22} color="#FFFFFF" />
                    </div>
                    <div className="text-center">
                      <p
                        className="font-bold leading-tight"
                        style={{
                          fontFamily: "var(--font-cormorant)",
                          fontSize: "17px",
                          color: "#2C1F14",
                        }}
                      >
                        Katedral Santo Yosef
                      </p>
                      <p
                        className="text-[11px] uppercase tracking-wider mt-0.5"
                        style={{
                          color: "#B8960C",
                          fontFamily: "var(--font-dm-sans)",
                          fontWeight: 600,
                        }}
                      >
                        {subtitle}
                      </p>
                    </div>
                  </Link>

                  {/* Mobile Nav */}
                  <nav className="flex flex-col px-3 pt-4 gap-0.5">
                    {activeNavItems.map((item) => (
                      <MobileNavLink key={item.href} item={item} />
                    ))}
                  </nav>
                </div>

                {/* Mobile Logout */}
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
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Page Title */}
        <h1
          style={{
            fontFamily: "var(--font-cormorant)",
            fontSize: "20px",
            color: "#2C1F14",
            fontWeight: 700,
            margin: 0,
            lineHeight: 1,
          }}
        >
          {title}
        </h1>
      </div>

      {/* Right: Notification bell */}
      <div className="flex items-center gap-2">
        {/* Bell with badge */}
        <Link
          href={isAdmin ? "#" : "/dasbor/notifikasi"}
          className="relative p-2 rounded-lg transition-colors hover:bg-[#F5F0E8]"
          style={{ color: "#6B5744" }}
        >
          <Bell size={20} />
          {notifCount > 0 && (
            <span
              className="absolute top-1 right-1 flex items-center justify-center rounded-full text-white font-bold"
              style={{
                minWidth: "16px",
                height: "16px",
                fontSize: "9px",
                background: "#8B3A3A",
                padding: "0 3px",
              }}
            >
              {notifCount}
            </span>
          )}
        </Link>
      </div>
    </header>
  );
}
