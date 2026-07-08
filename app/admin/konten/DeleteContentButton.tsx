"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { Trash2, Loader2, AlertTriangle, X } from "lucide-react";

export function DeleteContentButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  const closeModal = useCallback(() => {
    if (!loading) setShowModal(false);
  }, [loading]);

  // Close on Escape key
  useEffect(() => {
    if (!showModal) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeModal();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showModal, closeModal]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  const handleDelete = async () => {
    setLoading(true);
    await fetch(`/api/admin/konten?id=${id}`, { method: "DELETE" });
    setShowModal(false);
    router.refresh();
    setLoading(false);
  };

  const modal = showModal ? createPortal(
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
      onClick={closeModal}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{ animation: "fadeIn 200ms ease-out" }} />

      {/* Modal Content */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl"
        style={{ width: "100%", maxWidth: 460, animation: "scaleIn 200ms ease-out" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={closeModal}
          disabled={loading}
          className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#9C8B7A] hover:bg-[#F5F0E8] hover:text-[#3D2B1F] transition-colors disabled:opacity-50"
        >
          <X size={16} />
        </button>

        {/* Icon & Header */}
        <div className="pt-8 pb-4 px-8 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 border-2 border-red-100 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h3
            className="text-2xl font-bold text-[#3D2B1F] mb-3"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            Hapus Konten?
          </h3>
          <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.6, wordBreak: "break-word" }}>
            Konten yang dihapus <strong style={{ color: "#3D2B1F" }}>tidak dapat dikembalikan</strong>.
          </p>
          <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.6, marginTop: 4 }}>
            Pastikan Anda yakin sebelum melanjutkan.
          </p>
        </div>

        {/* Actions */}
        <div className="px-8 pb-8 pt-4 flex gap-3">
          <button
            onClick={closeModal}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-[#6B6560] bg-[#F5F0E8] hover:bg-[#EDE8DF] transition-colors disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                Menghapus...
              </>
            ) : (
              <>
                <Trash2 size={15} />
                Ya, Hapus
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  ) : null;

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-red-200 rounded text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
      >
        <Trash2 size={13} />
        Hapus
      </button>

      {modal}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  );
}
