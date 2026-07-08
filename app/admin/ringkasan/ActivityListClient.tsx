"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronRight, X } from "lucide-react";

type HistoryItem = {
  id: string;
  stage: number | null;
  note: string | null;
  createdAt: Date | null;
  userName: string | null;
};

export default function ActivityListClient({ history }: { history: HistoryItem[] }) {
  const [showModal, setShowModal] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const displayedHistory = history.slice(0, 6);

  return (
    <div className="card-sacred h-full flex flex-col overflow-hidden">
      <div
        className="px-5 py-4 flex justify-between items-center"
        style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}
      >
        <h3
          className="font-bold text-[15px]"
          style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}
        >
          Aktivitas Terbaru
        </h3>
        {history.length > 6 && (
          <button
            onClick={() => setShowModal(true)}
            className="text-[12px] font-bold flex items-center gap-0.5 hover:underline"
            style={{ color: "#B8960C" }}
          >
            Lihat Semua <ChevronRight size={13} />
          </button>
        )}
      </div>

      <div className="p-5 flex-1 overflow-y-auto">
        {displayedHistory.length === 0 ? (
          <p className="text-center text-[13px] py-8" style={{ color: "#9C8B7A" }}>
            Belum ada aktivitas.
          </p>
        ) : (
          <div className="relative pl-5" style={{ borderLeft: "2px solid #E8E0D0" }}>
            {displayedHistory.map((hist, i) => (
              <div key={i} className="relative mb-6 last:mb-0">
                <div
                  className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2"
                  style={{
                    background: "#B8960C",
                    borderColor: "#FFFFFF",
                    boxShadow: "0 0 0 2px #E8E0D0",
                  }}
                />
                <p className="text-[11px] mb-1" style={{ color: "#9C8B7A" }}>
                  {new Date(hist.createdAt || new Date()).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
                <p className="text-[13px] font-semibold mb-0.5" style={{ color: "#2C1F14" }}>
                  {hist.userName}
                </p>
                <p className="text-[12px] leading-relaxed" style={{ color: "#6B5744" }}>
                  {hist.note}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Lihat Semua Aktivitas (menggunakan Portal agar tidak terpotong parent) */}
      {showModal && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[85vh]">
            <div className="bg-[#FDFBF8] px-6 py-4 flex items-center justify-between border-b border-[#E8E0D0]">
              <h3 className="font-bold text-[18px]" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
                Semua Aktivitas
              </h3>
              <button 
                onClick={() => setShowModal(false)}
                className="text-[#9C8B7A] hover:text-[#3D2B1F] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="relative pl-5" style={{ borderLeft: "2px solid #E8E0D0" }}>
                {history.map((hist, i) => (
                  <div key={i} className="relative mb-6 last:mb-0">
                    <div
                      className="absolute -left-[21px] top-1.5 w-3 h-3 rounded-full border-2"
                      style={{
                        background: "#B8960C",
                        borderColor: "#FFFFFF",
                        boxShadow: "0 0 0 2px #E8E0D0",
                      }}
                    />
                    <p className="text-[11px] mb-1" style={{ color: "#9C8B7A" }}>
                      {new Date(hist.createdAt || new Date()).toLocaleString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="text-[13px] font-semibold mb-0.5" style={{ color: "#2C1F14" }}>
                      {hist.userName}
                    </p>
                    <p className="text-[13px] leading-relaxed" style={{ color: "#6B5744" }}>
                      {hist.note}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
