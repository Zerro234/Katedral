"use client";

import { useState, useEffect } from "react";
// PERBAIKAN: Facebook dan Twitter dihapus dari import lucide-react
import { Share2, Link as LinkIcon, MessageCircle, X, Check } from "lucide-react";
import { toast } from "sonner";
import { createPortal } from "react-dom";

// --- Komponen Ikon Custom untuk Brand ---
const FacebookIcon = ({ size = 22 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const XBrandIcon = ({ size = 22 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
  </svg>
);
// ----------------------------------------

export function BeritaShareButton({ title, url }: { title: string; url?: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setShareUrl(url || window.location.href);
  }, [url]);

  const handleShareClick = async () => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile && navigator.share) {
      try {
        await navigator.share({
          title: title,
          url: shareUrl,
        });
        return;
      } catch (err: unknown) {
        if ((err as Error).name !== "AbortError") {
          setIsOpen(true);
        }
      }
    } else {
      setIsOpen(true);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Tautan berhasil disalin ke papan klip!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Gagal menyalin tautan.");
    }
  };

  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(title);

  const shareLinks = {
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
  };

  return (
    <>
      <button
        onClick={handleShareClick}
        className="flex items-center gap-2 px-4 py-2 border border-[#DDD8D0] rounded-md text-sm font-bold text-[#6B6560] hover:bg-[#F5F0E8] hover:text-[#3D2B1F] transition-colors"
      >
        <Share2 size={16} /> Bagikan
      </button>

      {isOpen && createPortal(
        <div 
          className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-xs p-6 shadow-2xl transform transition-transform" 
            onClick={e => e.stopPropagation()} 
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-[#3D2B1F]" style={{ fontFamily: "var(--font-cormorant)" }}>
                Bagikan Berita
              </h3>
              <button onClick={() => setIsOpen(false)} className="text-[#9C8B7A] hover:text-[#C0392B] transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {/* WhatsApp */}
              <a href={shareLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-[#25D366] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm">
                  <MessageCircle size={22} />
                </div>
                <span className="text-[10px] font-bold text-[#6B6560]">WhatsApp</span>
              </a>
              
              {/* Facebook */}
              <a href={shareLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm">
                  {/* Memanggil SVG Custom Facebook */}
                  <FacebookIcon size={22} />
                </div>
                <span className="text-[10px] font-bold text-[#6B6560]">Facebook</span>
              </a>

              {/* X / Twitter */}
              <a href={shareLinks.twitter} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-black flex items-center justify-center text-white group-hover:scale-110 transition-transform shadow-sm">
                  {/* Memanggil SVG Custom X (Twitter) */}
                  <XBrandIcon size={22} />
                </div>
                <span className="text-[10px] font-bold text-[#6B6560]">X</span>
              </a>

              {/* Salin Tautan */}
              <button onClick={copyToClipboard} className="flex flex-col items-center gap-2 group">
                <div className="w-12 h-12 rounded-full bg-[#F5F0E8] border border-[#DDD8D0] flex items-center justify-center text-[#3D2B1F] group-hover:scale-110 transition-transform shadow-sm">
                  {copied ? <Check size={22} className="text-green-600" /> : <LinkIcon size={22} />}
                </div>
                <span className="text-[10px] font-bold text-[#6B6560]">
                  {copied ? "Disalin" : "Salin"}
                </span>
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}