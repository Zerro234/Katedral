"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Save, Plus, Trash2, Images, ArrowUp, ArrowDown, X, AlertTriangle } from "lucide-react";
import ImageUpload from "@/components/admin/ImageUpload";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";
import { toast } from "sonner";
import { createPortal } from "react-dom";

const CONTENT_TYPES = [
  { value: "NEWS", label: "Berita / Artikel" },
  { value: "MASS_SCHEDULE", label: "Jadwal Misa" },
  { value: "ANNOUNCEMENT", label: "Pengumuman" },
  { value: "GALLERY", label: "Foto Galeri" },
];

type ContentItem = {
  id: string;
  title: string | null;
  type: string | null;
  body: string | null;
  eventDate: string | null;
  eventEndDate: string | null;
  location: string | null;
  imageUrl: string | null;
  category: string | null;
};

// Parse body to extract gallery images & caption (GALLERY type)
function parseGalleryBody(body: string | null, imageUrl: string | null): { images: string[]; caption: string } {
  try {
    const parsed = JSON.parse(body ?? "{}");
    const images: string[] = Array.isArray(parsed.images) ? parsed.images.filter(Boolean) : [];
    // ensure primary imageUrl is included
    if (imageUrl && !images.includes(imageUrl)) images.unshift(imageUrl);
    return { images, caption: parsed.caption || "" };
  } catch {
    // body is plain text
    return {
      images: imageUrl ? [imageUrl] : [],
      caption: body || "",
    };
  }
}

// Parse body for NEWS/ANNOUNCEMENT: supports JSON { html, images } or legacy plain HTML
function parseNewsBody(body: string | null): { html: string; images: string[] } {
  if (!body) return { html: "", images: [] };
  try {
    const parsed = JSON.parse(body);
    if (parsed && typeof parsed === "object" && "html" in parsed) {
      return {
        html: parsed.html || "",
        images: Array.isArray(parsed.images) ? parsed.images.filter(Boolean) : [],
      };
    }
    return { html: body, images: [] };
  } catch {
    return { html: body, images: [] };
  }
}

export default function EditKontenClient({ content }: { content: ContentItem }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const initMassDay = content.type === "MASS_SCHEDULE" && content.category ? content.category.split("::")[0] : "Minggu";
  const initMassType = content.type === "MASS_SCHEDULE" && content.category ? content.category.split("::")[1] || "Harian" : "Harian";

  // Determine initial body text and images based on content type
  const isNewsOrAnnouncement = content.type === "NEWS" || content.type === "ANNOUNCEMENT";
  const initNewsBody = isNewsOrAnnouncement ? parseNewsBody(content.body) : { html: "", images: [] };
  const initGallery = content.type === "GALLERY" ? parseGalleryBody(content.body, content.imageUrl) : { images: [], caption: "" };

  const [form, setForm] = useState({
    id: content.id,
    title: content.title || "",
    type: content.type || "NEWS",
    body: isNewsOrAnnouncement ? initNewsBody.html : (content.body || ""),
    eventDate: content.eventDate || "",
    eventEndDate: content.eventEndDate || "",
    location: content.location || "",
    imageUrl: content.imageUrl || "",
    category: content.category || "",
    massDay: initMassDay,
    massType: initMassType,
  });

  // ── Gallery/Photo multi-image state ─────────────────────────────────────────
  const [galleryImages, setGalleryImages] = useState<string[]>(
    content.type === "GALLERY" ? initGallery.images : initNewsBody.images
  );
  const [galleryCaption, setGalleryCaption] = useState(initGallery.caption);

  // Multi-upload & Cropping states
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadingCount, setUploadingCount] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Cropper states
  const [cropperOpen, setCropperOpen] = useState(false);
  const [cropTargetIdx, setCropTargetIdx] = useState<number | null>(null);
  const [cropImageSrc, setCropImageSrc] = useState<string>("");
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [cropAspectRatio, setCropAspectRatio] = useState<number | undefined>(undefined);
  const [originalAspect, setOriginalAspect] = useState<number | undefined>(undefined);

  // Drag and drop sorting states
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [dragOverIdx, setDragOverIdx] = useState<number | null>(null);

  // Max photos warning modal state
  const [showMaxPhotosModal, setShowMaxPhotosModal] = useState(false);
  const [maxPhotosModalMsg, setMaxPhotosModalMsg] = useState("");

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOverItem = (e: React.DragEvent, index: number) => {
    e.preventDefault();
  };

  const handleDragEnd = (e: React.DragEvent, targetIdx: number) => {
    e.preventDefault();
    setDragOverIdx(null);
    if (draggedIdx === null || draggedIdx === targetIdx) return;

    setGalleryImages(prev => {
      const next = [...prev];
      const draggedItem = next[draggedIdx];
      next.splice(draggedIdx, 1);
      next.splice(targetIdx, 0, draggedItem);
      return next;
    });
    setDraggedIdx(null);
  };

  const removePhoto = (idx: number) => setGalleryImages(prev => prev.filter((_, i) => i !== idx));
  const moveUp = (idx: number) => {
    if (idx === 0) return;
    setGalleryImages(prev => { const a = [...prev]; [a[idx - 1], a[idx]] = [a[idx], a[idx - 1]]; return a; });
  };
  const moveDown = (idx: number) => {
    setGalleryImages(prev => {
      if (idx >= prev.length - 1) return prev;
      const a = [...prev]; [a[idx], a[idx + 1]] = [a[idx + 1], a[idx]]; return a;
    });
  };

  const uploadFile = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload gagal");
    return data.url;
  };

  const processFiles = async (files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter(file => {
      if (!file.type.startsWith("image/")) {
        toast.error(`File ${file.name} bukan gambar.`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`File ${file.name} terlalu besar (maksimal 5MB).`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    const remainingSlots = 10 - galleryImages.length;
    if (remainingSlots <= 0) {
      setMaxPhotosModalMsg("Maksimal 10 foto. Album Anda sudah penuh (10/10). Hapus beberapa foto terlebih dahulu jika ingin mengunggah foto baru.");
      setShowMaxPhotosModal(true);
      return;
    }

    if (validFiles.length > remainingSlots) {
      setMaxPhotosModalMsg(`Maksimal 10 foto. Hanya ${remainingSlots} foto pertama yang akan diunggah.`);
      setShowMaxPhotosModal(true);
    }

    const filesToUpload = validFiles.slice(0, remainingSlots);
    setUploadingCount(prev => prev + filesToUpload.length);

    for (const file of filesToUpload) {
      try {
        const url = await uploadFile(file);
        setGalleryImages(prev => [...prev, url]);
      } catch (err) {
        toast.error(`Gagal mengunggah ${file.name}: ${err instanceof Error ? err.message : "Error"}`);
      } finally {
        setUploadingCount(prev => Math.max(0, prev - 1));
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
    }
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const payload: Record<string, string> = { ...form };
      if (payload.type === "MASS_SCHEDULE") {
        payload.category = `${payload.massDay}::${payload.massType}`;
      } else if (payload.type === "NEWS") {
        payload.category = "Berita Paroki";
        if (!payload.imageUrl && galleryImages.length > 0) {
          payload.imageUrl = galleryImages[0];
        }
        if (galleryImages.length > 0) {
          payload.body = JSON.stringify({ html: form.body, images: galleryImages });
        }
      } else if (payload.type === "ANNOUNCEMENT") {
        payload.category = "Pengumuman";
        if (!payload.imageUrl && galleryImages.length > 0) {
          payload.imageUrl = galleryImages[0];
        }
        if (galleryImages.length > 0) {
          payload.body = JSON.stringify({ html: form.body, images: galleryImages });
        }
      } else if (payload.type === "GALLERY") {
        payload.imageUrl = galleryImages[0] || "";
        payload.body = JSON.stringify({ images: galleryImages, caption: galleryCaption });
      }

      const res = await fetch("/api/admin/konten", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan perubahan.");

      router.push("/admin/konten");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Terjadi kesalahan.");
    } finally {
      setLoading(false);
    }
  };

  const isMassSchedule = form.type === "MASS_SCHEDULE";
  const isGallery = form.type === "GALLERY";
  const isNews = form.type === "NEWS";
  const isAnnouncement = form.type === "ANNOUNCEMENT";
  const showPhotoUploader = isGallery || isNews || isAnnouncement;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm p-8 space-y-6">
      
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 font-medium">
          {error}
        </div>
      )}

      {/* Tipe Konten */}
      <div>
        <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">Tipe Konten</label>
        <div className="flex flex-wrap gap-3">
          {CONTENT_TYPES.map(ct => (
            <button key={ct.value} type="button"
              onClick={() => setForm(prev => ({ ...prev, type: ct.value }))}
              className={`px-5 py-2.5 rounded-md text-sm font-bold border-2 transition-colors ${
                form.type === ct.value
                  ? "bg-[#B8960C] border-[#B8960C] text-white"
                  : "bg-white border-[#DDD8D0] text-[#6B6560] hover:border-[#B8960C] hover:text-[#B8960C]"
              }`}
            >{ct.label}</button>
          ))}
        </div>
      </div>

      {/* Pengumuman Fields */}
      {form.type === "ANNOUNCEMENT" && (
        <div className="space-y-5 p-5 bg-[#F5F0E8] rounded-lg border border-[#EDE8DF]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">
                Tanggal Acara <span className="text-[#A89880] font-normal">(Opsional)</span>
              </label>
              <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange}
                className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm bg-white focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">
                Tampilkan Sampai <span className="text-red-500">*</span>
              </label>
              <input type="date" name="eventEndDate" value={form.eventEndDate} onChange={handleChange} required
                className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm bg-white focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">
              Lokasi <span className="text-[#A89880] font-normal">(Opsional)</span>
            </label>
            <input type="text" name="location" value={form.location} onChange={handleChange}
              placeholder="cth: Gereja Katedral, Aula Paroki"
              className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm bg-white focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none" />
          </div>
        </div>
      )}

      {/* Judul */}
      <div>
        <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">Judul <span className="text-red-500">*</span></label>
        <input type="text" name="title" value={form.title} onChange={handleChange} required
          className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none" />
      </div>

      {/* Jadwal Misa Fields */}
      {isMassSchedule && (
        <div className="space-y-5 p-5 bg-[#F5F0E8] rounded-lg border border-[#EDE8DF]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">Tanggal</label>
              <input type="date" name="massDay" value={form.massDay} onChange={handleChange}
                className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm bg-white focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">Jenis Misa</label>
              <select name="massType" value={form.massType} onChange={handleChange}
                className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm bg-white focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none">
                <option value="Harian">Misa Harian / Umum</option>
                <option value="Khusus">Misa Khusus (Hari Raya / Acara Khusus)</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">Waktu (Jam)</label>
              <input type="time" name="eventDate" value={form.eventDate} onChange={handleChange}
                className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm bg-white focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none" />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">Lokasi</label>
              <input type="text" name="location" value={form.location} onChange={handleChange}
                placeholder="cth: Gereja Utama" className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm bg-white focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none" />
            </div>
          </div>
        </div>
      )}

      {/* Isi Konten — hidden for gallery */}
      {!isGallery && (
        <div>
          <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">
            {isMassSchedule ? "Keterangan Tambahan" : "Isi Konten / Artikel"}
          </label>
          <textarea name="body" value={form.body} onChange={handleChange} rows={8}
            className="w-full px-4 py-3 border border-[#DDD8D0] rounded-md text-sm focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none resize-y" />
        </div>
      )}

      {/* URL Gambar Cover (News/Announcement only, not Gallery) */}
      {!isGallery && !isMassSchedule && (
        <ImageUpload
          label="Gambar Cover (Opsional)"
          value={form.imageUrl}
          onChange={(url) => setForm(prev => ({ ...prev, imageUrl: url }))}
          aspectRatio={4/3}
          helpText="Disarankan resolusi 800x600 px (Rasio 4:3) agar gambar sampul pas saat ditampilkan."
        />
      )}

      {/* ── PHOTO UPLOADER — Gallery, News, Announcement ───────────────────── */}
      {showPhotoUploader && (
        <div className="p-5 bg-[#F5F0E8] rounded-lg border border-[#EDE8DF] space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Images size={16} className="text-[#B8960C]" />
              <h3 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider">
                {isGallery ? "Foto Album" : "Dokumentasi Foto"} ({galleryImages.length}/10)
              </h3>
              {!isGallery && (
                <span className="text-[10px] text-[#A89880] font-normal ml-1">(Opsional)</span>
              )}
            </div>
            {isGallery && galleryImages.length === 0 && (
              <span className="text-xs text-red-500 font-semibold">Minimal 1 foto diperlukan</span>
            )}
          </div>

          {/* Thumbnail grid with controls */}
          {(galleryImages.length > 0 || uploadingCount > 0) && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {galleryImages.map((url, idx) => (
                <div
                  key={`${url}-${idx}`}
                  draggable
                  onDragStart={(e) => handleDragStart(e, idx)}
                  onDragOver={(e) => handleDragOverItem(e, idx)}
                  onDragEnter={(e) => { e.preventDefault(); setDragOverIdx(idx); }}
                  onDragLeave={() => setDragOverIdx(null)}
                  onDrop={(e) => handleDragEnd(e, idx)}
                  onDragEnd={() => { setDraggedIdx(null); setDragOverIdx(null); }}
                  className={`relative group rounded-xl overflow-hidden border-2 bg-[#FAF7F2] aspect-[4/3] shadow-sm cursor-grab active:cursor-grabbing transition-all duration-200 ${
                    draggedIdx === idx ? "opacity-40" : ""
                  } ${
                    dragOverIdx === idx ? "border-[#B8960C] scale-105 shadow-md z-10" : "border-[#DDD8D0]"
                  }`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt={`foto ${idx + 1}`} className="w-full h-full object-cover pointer-events-none" />

                  {/* Primary badge — only for Gallery */}
                  {idx === 0 && isGallery && (
                    <span className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-[#B8960C] text-white text-[9px] font-bold rounded-full shadow">
                      ★ Utama
                    </span>
                  )}

                  {/* Action overlay */}
                  <div className={`absolute inset-0 bg-black/50 opacity-0 transition-opacity flex flex-col items-center justify-center gap-2 p-2 ${
                    draggedIdx === null ? "group-hover:opacity-100" : "pointer-events-none"
                  }`}>
                    {/* Move up/down */}
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveUp(idx); }}
                        disabled={idx === 0}
                        title="Pindah ke kiri"
                        className="w-7 h-7 rounded-md bg-white/90 text-[#3D2B1F] flex items-center justify-center hover:bg-[#B8960C] hover:text-white transition-colors disabled:opacity-30"
                      >
                        <ArrowUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); moveDown(idx); }}
                        disabled={idx === galleryImages.length - 1}
                        title="Pindah ke kanan"
                        className="w-7 h-7 rounded-md bg-white/90 text-[#3D2B1F] flex items-center justify-center hover:bg-[#B8960C] hover:text-white transition-colors disabled:opacity-30"
                      >
                        <ArrowDown size={12} />
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCropTargetIdx(idx);
                          setCropImageSrc(url);
                          setCropperOpen(true);
                          setZoom(1);
                          setCrop({ x: 0, y: 0 });
                        }}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-[#3D2B1F] text-[10px] font-bold hover:bg-[#FDF3D0] transition-colors"
                      >
                        ✂️ Crop
                      </button>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removePhoto(idx); }}
                        title="Hapus foto ini"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition-colors"
                      >
                        <Trash2 size={10} /> Hapus
                      </button>
                    </div>
                  </div>

                  {/* Index number */}
                  <span className="absolute bottom-1.5 right-1.5 w-5 h-5 rounded-full bg-black/60 text-white text-[9px] font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                </div>
              ))}

              {/* Uploading placeholders */}
              {Array.from({ length: uploadingCount }).map((_, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden border-2 border-dashed border-[#B8960C]/40 bg-[#FFF8E1] aspect-[4/3] flex flex-col items-center justify-center gap-2">
                  <Loader2 className="w-8 h-8 text-[#B8960C] animate-spin" />
                  <span className="text-[11px] font-bold text-[#B8960C]">Mengunggah...</span>
                </div>
              ))}
            </div>
          )}

          {/* Hint text */}
          {galleryImages.length > 0 && (
            <p className="text-[11px] text-[#A89880]">
              💡 Seret (drag) foto untuk mengubah urutan · Klik ✂️ Crop untuk edit foto.
            </p>
          )}

          {/* Success Banner when 10 photos are reached */}
          {galleryImages.length === 10 && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-center shadow-sm">
              <p className="text-sm font-bold text-green-800">
                🎉 {isGallery ? "Album" : "Dokumentasi foto"} telah penuh (10/10 foto).
              </p>
              <p className="text-xs text-green-600 mt-1">
                Klik tombol <strong>Simpan Perubahan</strong> di bawah untuk menyimpan.
              </p>
            </div>
          )}

          {/* Add photo panel */}
          {galleryImages.length < 10 && (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => !loading && fileInputRef.current?.click()}
              className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                dragging
                  ? "border-[#B8960C] bg-[#FFF8E1]"
                  : "border-[#DDD8D0] bg-white hover:border-[#B8960C] hover:bg-[#FFF8E1]"
              }`}
            >
              <div className="w-12 h-12 bg-[#FAF7F2] border border-[#DDD8D0] rounded-full flex items-center justify-center shadow-sm">
                <Images size={22} className="text-[#B8960C]" />
              </div>
              <div className="text-center text-xs">
                <p className="text-sm font-bold text-[#3D2B1F]">
                  Klik untuk pilih foto
                </p>
                <p className="text-[#A89880] mt-1">
                  atau seret & lepas file ke sini (Bisa pilih banyak sekaligus, maks 10)
                </p>
                <p className="text-[#A89880]">JPG, PNG, WebP, GIF · Maks. 5MB per file</p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}

          {/* Caption — only for Gallery type */}
          {isGallery && (
            <div className="pt-2 border-t border-[#DDD8D0]">
              <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">
                Keterangan Album <span className="font-normal text-[#A89880]">(Opsional)</span>
              </label>
              <input
                type="text"
                value={galleryCaption}
                onChange={(e) => setGalleryCaption(e.target.value)}
                placeholder="cth: Perayaan Natal 2024 di Katedral Santo Yosef"
                className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm bg-white focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none"
              />
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 pt-4 border-t border-[#EDE8DF]">
        <Link href="/admin/konten"
          className="px-6 py-2.5 bg-white border border-[#DDD8D0] rounded-md text-sm font-bold text-[#6B6560] hover:bg-[#FAF7F2] transition-colors">
          Batal
        </Link>
        <button type="submit" disabled={loading || (isGallery && galleryImages.length === 0)}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#B8960C] text-white font-bold text-sm rounded-md hover:bg-[#9A7A00] transition-colors shadow-sm disabled:opacity-60">
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Simpan Perubahan
        </button>
      </div>

      {/* Crop Modal */}
      {cropperOpen && cropImageSrc && cropTargetIdx !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#E8E0D0] flex justify-between items-center bg-[#FAF7F2]">
              <h3 className="font-bold text-[#3D2B1F]">Sesuaikan Gambar</h3>
              <button 
                type="button"
                onClick={() => setCropperOpen(false)}
                className="text-[#9C8B7A] hover:text-[#C0392B] transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full h-[50vh] bg-black">
              <Cropper
                image={cropImageSrc}
                crop={crop}
                zoom={zoom}
                aspect={cropAspectRatio}
                onCropChange={setCrop}
                onCropComplete={(_c, px) => setCroppedAreaPixels(px)}
                onZoomChange={setZoom}
                onMediaLoaded={(mediaSize) => {
                  setOriginalAspect(mediaSize.naturalWidth / mediaSize.naturalHeight);
                }}
              />
            </div>
            
            <div className="p-6 bg-white flex flex-col gap-4 border-t border-[#E8E0D0]">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                {/* Aspect Ratio Selector */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#6B6560]">Aspek Rasio:</span>
                  <div className="flex gap-1">
                    {[
                      { label: "Bebas", value: undefined, isFull: false },
                      { label: "Penuh (Full)", value: originalAspect, isFull: true },
                      { label: "4:3", value: 4/3, isFull: false },
                      { label: "16:9", value: 16/9, isFull: false },
                      { label: "1:1", value: 1, isFull: false }
                    ].map(opt => (
                      <button
                        key={opt.label}
                        type="button"
                        onClick={() => {
                          setCropAspectRatio(opt.value);
                          if (opt.isFull) {
                            setZoom(1);
                            setCrop({ x: 0, y: 0 });
                          }
                        }}
                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                          cropAspectRatio === opt.value
                            ? "bg-[#B8960C] text-white border-[#B8960C]"
                            : "bg-[#F5F0E8] text-[#6B6560] border-transparent hover:border-[#DDD8D0]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Zoom Slider */}
                <div className="w-full sm:w-1/3 flex items-center gap-3">
                  <span className="text-xs font-bold text-[#6B6560]">Zoom</span>
                  <input
                    type="range"
                    value={zoom}
                    min={1}
                    max={3}
                    step={0.1}
                    aria-labelledby="Zoom"
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full accent-[#B8960C]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setCropperOpen(false)}
                  className="px-4 py-2 text-sm font-bold text-[#6B6560] bg-[#F5F0E8] hover:bg-[#E8E0D0] rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!cropImageSrc || !croppedAreaPixels || cropTargetIdx === null) return;
                    setLoading(true);
                    try {
                      const croppedFile = await getCroppedImg(cropImageSrc, croppedAreaPixels, 0);
                      if (!croppedFile) throw new Error("Gagal memproses gambar");
                      const url = await uploadFile(croppedFile);
                      setGalleryImages(prev => {
                        const next = [...prev];
                        next[cropTargetIdx] = url;
                        return next;
                      });
                      setCropperOpen(false);
                    } catch (e) {
                      console.error(e);
                      toast.error("Gagal memotong gambar.");
                    } finally {
                      setLoading(false);
                    }
                  }}
                  className="px-6 py-2 text-sm font-bold text-white bg-[#2D6A4F] hover:bg-[#1f4a37] rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  Terapkan Crop
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Max Photos Warning Modal */}
      {showMaxPhotosModal && createPortal(
        <div
          className="fixed inset-0 flex items-center justify-center p-4"
          style={{ zIndex: 99999 }}
          onClick={() => setShowMaxPhotosModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" style={{ animation: "fadeIn 200ms ease-out" }} />
          <div
            className="relative bg-white rounded-2xl shadow-2xl"
            style={{ width: "100%", maxWidth: 460, animation: "scaleIn 200ms ease-out" }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowMaxPhotosModal(false)}
              className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center text-[#9C8B7A] hover:bg-[#F5F0E8] hover:text-[#3D2B1F] transition-colors"
            >
              <X size={16} />
            </button>
            <div className="pt-8 pb-4 px-8 text-center">
              <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-100 flex items-center justify-center mx-auto mb-5">
                <AlertTriangle size={28} className="text-amber-500" />
              </div>
              <h3
                className="text-2xl font-bold text-[#3D2B1F] mb-3"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                Batas Foto Tercapai
              </h3>
              <p style={{ fontSize: 14, color: "#6B6560", lineHeight: 1.6 }}>
                {maxPhotosModalMsg}
              </p>
            </div>
            <div className="px-8 pb-8 pt-4">
              <button
                onClick={() => setShowMaxPhotosModal(false)}
                className="w-full px-4 py-3 rounded-xl text-sm font-bold text-white bg-[#B8960C] hover:bg-[#9A7A00] transition-colors"
              >
                Mengerti
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </form>
  );
}
