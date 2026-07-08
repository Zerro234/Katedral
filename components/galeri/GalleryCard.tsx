"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import NextImage from "next/image";
import {
  X, ChevronLeft, ChevronRight, Download,
  Link2, Share2, Check, Images,
} from "lucide-react";

// ── Types ───────────────────────────────────────────────────────────────────

interface GalleryPhoto {
  id: string;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  images?: string[];
  createdAt: Date | string | null;
}

interface GalleryCardProps {
  photo: GalleryPhoto;
}

// ── Lightbox (Modern two-column layout) ─────────────────────────────────────

interface LightboxProps {
  images: string[];
  initialIndex: number;
  title?: string;
  onClose: () => void;
}

export function Lightbox({ images, initialIndex, title, onClose }: LightboxProps) {
  const [current, setCurrent] = useState(initialIndex);
  const [copied, setCopied] = useState(false);

  const prev = useCallback(
    () => setCurrent((i) => (i - 1 + images.length) % images.length),
    [images.length]
  );
  const next = useCallback(
    () => setCurrent((i) => (i + 1) % images.length),
    [images.length]
  );

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(images[current]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard not available
    }
  };

  const handleShare = async () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: title || "Foto Galeri Katedral Santo Yosef",
          url: images[current],
        });
      } catch {
        // share cancelled or failed
      }
    }
  };

  const canShare = typeof navigator !== "undefined" && !!navigator.share;

  const filename = (title || "foto-katedral")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  return createPortal(
    <div
      className="fixed inset-0 h-screen w-screen z-[9999] flex"
      style={{ background: "rgba(28, 12, 0, 0.97)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      {/* ── LEFT: Photo area ──────────────────────────────────────────── */}
      <div
        className="flex-1 relative flex items-center justify-center overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Prev arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            aria-label="Foto sebelumnya"
            className="absolute left-4 z-20 w-12 h-12 rounded-full flex items-center justify-center text-[#FAF7F2] transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "rgba(184,150,12,0.15)", border: "1px solid rgba(184,150,12,0.3)" }}
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* Main photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={images[current]}
          src={images[current]}
          alt={title || "Foto galeri Katedral Santo Yosef"}
          className="max-w-[calc(100%-6rem)] max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
          style={{ animation: "lbFadeIn 0.25s ease" }}
          draggable={false}
        />

        {/* Next arrow */}
        {images.length > 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            aria-label="Foto berikutnya"
            className="absolute right-4 z-20 w-12 h-12 rounded-full flex items-center justify-center text-[#FAF7F2] transition-all duration-200 hover:scale-105 active:scale-95"
            style={{ background: "rgba(184,150,12,0.15)", border: "1px solid rgba(184,150,12,0.3)" }}
          >
            <ChevronRight size={24} />
          </button>
        )}

        {/* Mobile top bar */}
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-3 md:hidden"
             style={{ background: "linear-gradient(to bottom, rgba(28,12,0,0.8), transparent)" }}>
          <span className="text-[#E8DDD0] text-sm font-medium">
            {current + 1} / {images.length}
          </span>
          <div className="flex items-center gap-2">
            {canShare && (
              <button
                onClick={(e) => { e.stopPropagation(); handleShare(); }}
                className="w-9 h-9 rounded-full flex items-center justify-center text-[#E8DDD0] transition-colors"
                style={{ background: "rgba(184,150,12,0.15)" }}
              >
                <Share2 size={16} />
              </button>
            )}
            <a
              href={`/api/public/galeri/download?url=${encodeURIComponent(images[current])}&filename=${encodeURIComponent(filename)}`}
              download
              onClick={(e) => e.stopPropagation()}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#E8DDD0] transition-colors"
              style={{ background: "rgba(184,150,12,0.15)" }}
            >
              <Download size={16} />
            </a>
            <button
              onClick={(e) => { e.stopPropagation(); onClose(); }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-[#E8DDD0] transition-colors"
              style={{ background: "rgba(184,150,12,0.15)" }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Mobile bottom: thumbnail dots */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-1.5 md:hidden">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={(e) => { e.stopPropagation(); setCurrent(i); }}
                className={`rounded-full transition-all duration-200 ${
                  i === current
                    ? "w-5 h-2 bg-[#B8960C]"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── RIGHT: Info panel (desktop only) ──────────────────────────── */}
      <div
        className="hidden md:flex w-[300px] lg:w-[320px] flex-col shrink-0"
        style={{ background: "#1A0F05", borderLeft: "1px solid rgba(184,150,12,0.2)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5"
             style={{ borderBottom: "1px solid rgba(184,150,12,0.15)" }}>
          <div className="min-w-0">
            {title && (
              <h3 className="text-[#FAF7F2] font-semibold text-base leading-snug line-clamp-2"
                style={{ fontFamily: "var(--font-cormorant)" }}>
                {title}
              </h3>
            )}
            <p className="text-[#A89880] text-xs mt-1.5 flex items-center gap-1.5">
              <Images size={12} />
              {current + 1} dari {images.length} foto
            </p>
          </div>
          <button
            onClick={onClose}
            className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[#A89880] hover:text-[#FAF7F2] transition-colors"
            style={{ background: "rgba(184,150,12,0.1)", border: "1px solid rgba(184,150,12,0.2)" }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Action buttons */}
        <div className="p-4 space-y-2"
             style={{ borderBottom: "1px solid rgba(184,150,12,0.15)" }}>
          <button
            onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-[#E8DDD0] hover:text-[#FAF7F2]"
            style={{ background: "rgba(184,150,12,0.08)" }}
            onMouseEnter={e => (e.currentTarget.style.background = "rgba(184,150,12,0.18)")}
            onMouseLeave={e => (e.currentTarget.style.background = "rgba(184,150,12,0.08)")}
          >
            {copied
              ? <Check size={15} className="text-green-400 shrink-0" />
              : <Link2 size={15} className="shrink-0" />
            }
            {copied ? "Tautan disalin!" : "Salin Tautan Foto"}
          </button>

          {canShare && (
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-[#E8DDD0] hover:text-[#FAF7F2]"
              style={{ background: "rgba(184,150,12,0.08)" }}
              onMouseEnter={e => (e.currentTarget.style.background = "rgba(184,150,12,0.18)")}
              onMouseLeave={e => (e.currentTarget.style.background = "rgba(184,150,12,0.08)")}
            >
              <Share2 size={15} className="shrink-0" />
              Bagikan
            </button>
          )}

          <a
            href={`/api/public/galeri/download?url=${encodeURIComponent(images[current])}&filename=${encodeURIComponent(filename)}`}
            download
            onClick={(e) => e.stopPropagation()}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors text-[#E8DDD0]"
            style={{ background: "rgba(184,150,12,0.08)" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(184,150,12,0.25)"; e.currentTarget.style.color = "#B8960C"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(184,150,12,0.08)"; e.currentTarget.style.color = "#E8DDD0"; }}
          >
            <Download size={15} className="shrink-0" />
            Unduh Foto
          </a>
        </div>

        {/* Thumbnail grid */}
        {images.length > 1 && (
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <p className="text-[#A89880] text-[11px] uppercase tracking-wider font-semibold mb-3">
              Semua Foto Album
            </p>
            <div className="grid grid-cols-3 gap-1.5">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    i === current
                      ? "border-[#B8960C] shadow-[0_0_0_1px_#B8960C]"
                      : "border-transparent opacity-50 hover:opacity-90 hover:border-white/30"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={img}
                    alt={`Foto ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  {i === current && (
                    <div className="absolute inset-0 bg-[#B8960C]/10" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes lbFadeIn {
          from { opacity: 0; transform: scale(0.96); }
          to   { opacity: 1; transform: scale(1); }
        }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(184,150,12,0.3); border-radius: 2px; }
      `}</style>
    </div>,
    document.body
  );
}

// ── Gallery Card ─────────────────────────────────────────────────────────────

export function GalleryCard({ photo }: GalleryCardProps) {
  const allImages: string[] = (() => {
    if (photo.images && photo.images.length > 0) return photo.images;
    if (photo.imageUrl) return [photo.imageUrl];
    return [];
  })();

  const [cardIndex, setCardIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const dateStr = photo.createdAt
    ? new Date(photo.createdAt).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  const filename = (photo.title || "foto-katedral")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

  const cardPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCardIndex((i) => (i - 1 + allImages.length) % allImages.length);
  };
  const cardNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCardIndex((i) => (i + 1) % allImages.length);
  };

  if (allImages.length === 0) return null;

  return (
    <>
      <div className="group relative bg-white rounded-2xl overflow-hidden border border-[#EDE8DF] shadow-sm hover:shadow-xl transition-all duration-300">

        {/* ── Thumbnail area — consistent 4:3 ratio ── */}
        <div
          className="relative aspect-[4/3] overflow-hidden cursor-pointer"
          onClick={() => setLightboxOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <NextImage
            key={allImages[cardIndex]}
            src={allImages[cardIndex]}
            alt={photo.title || "Foto Galeri Katedral"}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            style={{ animation: "cardFadeIn 0.15s ease" }}
            loading="lazy"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            draggable={false}
          />

          {/* Hover overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
              <Images size={13} />
              Lihat Foto
            </span>
          </div>

          {/* Photo count badge */}
          {allImages.length > 1 && (
            <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
              {cardIndex + 1} / {allImages.length}
            </div>
          )}

          {/* Carousel arrows (on hover, multiple photos) */}
          {allImages.length > 1 && (
            <>
              <button
                onClick={cardPrev}
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={cardNext}
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 backdrop-blur-sm flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
              >
                <ChevronRight size={16} />
              </button>
            </>
          )}

          {/* Dot indicators */}
          {allImages.length > 1 && allImages.length <= 10 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={(e) => { e.stopPropagation(); setCardIndex(i); }}
                  className={`rounded-full transition-all duration-200 ${
                    i === cardIndex
                      ? "w-4 h-1.5 bg-white"
                      : "w-1.5 h-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Caption bar ── */}
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            {photo.title && (
              <p className="text-sm font-semibold text-[#3D2B1F] line-clamp-1">
                {photo.title}
              </p>
            )}
            {dateStr && (
              <p className="text-xs text-[#A89880] mt-0.5">{dateStr}</p>
            )}
          </div>
          <a
            href={`/api/public/galeri/download?url=${encodeURIComponent(allImages[cardIndex])}&filename=${encodeURIComponent(filename)}`}
            download={`${filename}.jpg`}
            onClick={(e) => e.stopPropagation()}
            title="Unduh foto ini"
            className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FAF7F2] border border-[#EDE8DF] text-[#B8960C] text-xs font-bold hover:bg-[#B8960C] hover:text-white hover:border-[#B8960C] transition-all duration-200"
          >
            <Download size={12} />
            Unduh
          </a>
        </div>
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={allImages}
          initialIndex={cardIndex}
          title={photo.title || undefined}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      <style>{`
        @keyframes cardFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
      `}</style>
    </>
  );
}
