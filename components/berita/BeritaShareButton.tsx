"use client";

import { Share2 } from "lucide-react";
import { toast } from "sonner";

export function BeritaShareButton({ title, url }: { title: string; url?: string }) {
  const handleShare = async () => {
    const shareUrl = url || window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          url: shareUrl,
        });
      } catch (err: unknown) {
        // user cancelled or error
        if ((err as Error).name !== "AbortError") {
          toast.error("Gagal membagikan tautan.");
        }
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Tautan berhasil disalin ke papan klip!");
      } catch (err) {
        toast.error("Gagal menyalin tautan.");
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 px-4 py-2 border border-[#DDD8D0] rounded-md text-sm font-bold text-[#6B6560] hover:bg-[#F5F0E8] hover:text-[#3D2B1F] transition-colors"
    >
      <Share2 size={16} /> Bagikan
    </button>
  );
}
