"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Bell, Clock, RefreshCw, AlertCircle, CheckCheck, Church } from "lucide-react";
import { cn } from "@/lib/utils";

interface Notif {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface Props {
  initialNotifications: Notif[];
  initialUnreadCount: number;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("id-ID", {
    day: "numeric", month: "long", year: "numeric",
  });
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });
}

function isCancel(message: string) {
  const l = message.toLowerCase();
  return l.includes("dibatalkan") || l.includes("batal") || l.includes("dihentikan");
}

export default function NotifikasiClient({ initialNotifications, initialUnreadCount }: Props) {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  const handleRefresh = async () => {
    setRefreshing(true);
    router.refresh();
    await new Promise((r) => setTimeout(r, 800));
    setLastRefresh(new Date());
    setRefreshing(false);
  };

  useEffect(() => {
    if (initialUnreadCount > 0) {
      // Trigger update for Sidebar and Header badge
      window.dispatchEvent(new Event("notif-read"));
    }
  }, [initialUnreadCount]);

  return (
    <>
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <p className="section-label mb-2">Dasbor Pengantin</p>
          <h1
            className="text-[32px] font-bold leading-tight"
            style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}
          >
            Notifikasi
          </h1>
          <p className="text-[14px] mt-1 flex items-center gap-1.5" style={{ color: "#9C8B7A" }}>
            <Clock size={12} />
            Terakhir diperbarui: {formatTime(lastRefresh.toISOString())}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {initialUnreadCount > 0 && (
            <span
              className="text-white text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wide"
              style={{ background: "#8B3A3A" }}
            >
              {initialUnreadCount} Belum Dibaca
            </span>
          )}
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-semibold border transition-all disabled:opacity-60 hover:border-[#B8960C] hover:text-[#B8960C]"
            style={{
              background: "#FFFFFF",
              borderColor: "#E8E0D0",
              color: "#6B5744",
            }}
          >
            <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
            {refreshing ? "Memperbarui..." : "Refresh"}
          </button>
        </div>
      </div>

      {/* Notification List */}
      <div className="card-sacred overflow-hidden">
        <div>
          {initialNotifications.length === 0 ? (
            <div className="p-16 text-center flex flex-col items-center">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: "#F5F0E8" }}
              >
                <Bell size={28} style={{ color: "#E8E0D0" }} />
              </div>
              <h3
                className="text-xl font-bold mb-2"
                style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}
              >
                Tidak Ada Notifikasi
              </h3>
              <p className="text-[14px]" style={{ color: "#9C8B7A" }}>
                Belum ada pesan dari Sekretariat Paroki.
              </p>
            </div>
          ) : (
            initialNotifications.map((notif, idx) => {
              const isCancelNotif = isCancel(notif.message);
              return (
                <div
                  key={notif.id}
                  className={cn(
                    "flex items-start gap-4 p-5 sm:p-6 transition-colors",
                    idx > 0 && "border-t",
                    isCancelNotif
                      ? "border-l-4"
                      : !notif.isRead
                      ? ""
                      : ""
                  )}
                  style={{
                    borderColor: isCancelNotif ? "#8B3A3A" : "#F0EBE3",
                    background: isCancelNotif
                      ? "#FAEDED"
                      : !notif.isRead
                      ? "#FDFBF8"
                      : "#FFFFFF",
                  }}
                >
                  {/* Icon */}
                  <div className="flex-shrink-0 mt-0.5">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{
                        background: isCancelNotif
                          ? "#FAEDED"
                          : !notif.isRead
                          ? "#FDF3D0"
                          : "#F5F0E8",
                        color: isCancelNotif
                          ? "#8B3A3A"
                          : !notif.isRead
                          ? "#B8960C"
                          : "#9C8B7A",
                      }}
                    >
                      {isCancelNotif ? <AlertCircle size={18} /> : <Bell size={18} />}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-1 mb-1.5">
                      <h4
                        className="text-[14px] font-bold"
                        style={{
                          color: isCancelNotif
                            ? "#8B3A3A"
                            : !notif.isRead
                            ? "#2C1F14"
                            : "#6B5744",
                        }}
                      >
                        {isCancelNotif ? "Pendaftaran Dibatalkan" : "Pembaruan Pendaftaran"}
                      </h4>
                      <span
                        className="text-[11px] flex items-center gap-1 flex-shrink-0"
                        style={{ color: "#9C8B7A" }}
                      >
                        <Clock size={11} />
                        {formatDate(notif.createdAt)} · {formatTime(notif.createdAt)}
                      </span>
                    </div>

                    <p
                      className="text-[13px] leading-relaxed"
                      style={{
                        color: isCancelNotif ? "#7A2A2A" : notif.isRead ? "#6B5744" : "#2C1F14",
                      }}
                    >
                      {notif.message}
                    </p>

                    {notif.isRead && !isCancelNotif && (
                      <span
                        className="inline-flex items-center gap-1 mt-2 text-[11px]"
                        style={{ color: "#9C8B7A" }}
                      >
                        <CheckCheck size={11} /> Sudah dibaca
                      </span>
                    )}
                  </div>

                  {/* Unread dot */}
                  {!notif.isRead && !isCancelNotif && (
                    <div className="flex-shrink-0 self-center hidden sm:block">
                      <span
                        className="w-2.5 h-2.5 rounded-full block"
                        style={{ background: "#B8960C" }}
                      />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
