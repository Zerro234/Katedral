"use client";

import { useState } from "react";
import NextImage from "next/image";
import { Images } from "lucide-react";
import { Lightbox } from "@/components/galeri/GalleryCard";

interface NewsPhotoGalleryProps {
  images: string[];
  title?: string;
}

export function NewsPhotoGallery({ images, title }: NewsPhotoGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  if (!images || images.length === 0) return null;

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  return (
    <>
      <section className="mt-12 pt-10 border-t border-[#EDE8DF]">
        {/* Section header */}
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(184,150,12,0.12)" }}
          >
            <Images size={18} className="text-[#B8960C]" />
          </div>
          <div>
            <h2
              className="text-xl font-bold text-[#3D2B1F]"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Dokumentasi Foto
            </h2>
            <p className="text-xs text-[#A89880] mt-0.5">
              {images.length} foto
            </p>
          </div>
        </div>

        {/* Photo grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {images.map((url, index) => (
            <button
              key={`${url}-${index}`}
              onClick={() => openLightbox(index)}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-[#EDE8DF] bg-[#F5F0E8] cursor-pointer transition-all duration-300 hover:shadow-lg hover:border-[#B8960C]/30"
            >
              <NextImage
                src={url}
                alt={`Dokumentasi ${index + 1}${title ? ` — ${title}` : ""}`}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-3">
                <span className="inline-flex items-center gap-1.5 text-white text-xs font-semibold bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <Images size={12} />
                  Lihat
                </span>
              </div>

              {/* Photo number */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                {index + 1}
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxOpen && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          title={title ? `Dokumentasi — ${title}` : "Dokumentasi Berita"}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}
