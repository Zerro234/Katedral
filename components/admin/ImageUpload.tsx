"use client";

import { useRef, useState, useCallback } from "react";
import { Upload, X, Image as ImageIcon, Loader2, Link, Check } from "lucide-react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import getCroppedImg from "@/lib/cropImage";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  required?: boolean;
  placeholder?: string;
  aspectRatio?: number;
  helpText?: string;
}

export default function ImageUpload({
  value,
  onChange,
  label = "Gambar",
  required = false,
  placeholder = "https://example.com/gambar.jpg",
  aspectRatio,
  helpText,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [dragging, setDragging] = useState(false);

  // Cropper states
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const handleFile = async (file: File) => {
    setError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload gagal");
      onChange(data.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload gagal");
    } finally {
      setUploading(false);
      setCropModalOpen(false);
      setImageSrc(null);
    }
  };

  const readFile = (file: File) => {
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.addEventListener("load", () => resolve(reader.result as string), false);
      reader.readAsDataURL(file);
    });
  };

  const processFileSelection = async (file: File) => {
    // If no aspect ratio is provided, we can upload directly without cropping
    if (!aspectRatio) {
      handleFile(file);
      return;
    }

    // Otherwise, open crop modal
    try {
      const imageDataUrl = await readFile(file);
      setImageSrc(imageDataUrl);
      setCropModalOpen(true);
    } catch {
      setError("Gagal membaca file gambar.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFileSelection(file);
    // Reset input so the same file can be selected again if needed
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFileSelection(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleClear = () => {
    onChange("");
    if (inputRef.current) inputRef.current.value = "";
  };

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    
    setUploading(true);
    try {
      const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels, 0);
      if (!croppedFile) throw new Error("Gagal memproses gambar");
      await handleFile(croppedFile);
    } catch (e) {
      console.error(e);
      setError("Gagal memotong gambar");
      setUploading(false);
    }
  };

  const handleCancelCrop = () => {
    setCropModalOpen(false);
    setImageSrc(null);
  };

  return (
    <div>
      {/* Label */}
      <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {helpText && (
        <p className="text-xs text-[#A89880] mb-3 leading-relaxed">{helpText}</p>
      )}

      {/* Mode Toggle */}
      <div className="flex gap-2 mb-3">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
            mode === "upload"
              ? "bg-[#B8960C] text-white border-[#B8960C]"
              : "bg-white text-[#6B6560] border-[#DDD8D0] hover:border-[#B8960C]"
          }`}
        >
          <Upload size={12} /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full border transition-colors ${
            mode === "url"
              ? "bg-[#B8960C] text-white border-[#B8960C]"
              : "bg-white text-[#6B6560] border-[#DDD8D0] hover:border-[#B8960C]"
          }`}
        >
          <Link size={12} /> URL Gambar
        </button>
      </div>

      {/* Upload Mode */}
      {mode === "upload" && !value && (
        <>
          {/* Drop Zone */}
          <div
            onClick={() => !uploading && inputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative flex flex-col items-center justify-center gap-3 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
              dragging
                ? "border-[#B8960C] bg-[#FFF8E1]"
                : "border-[#DDD8D0] bg-[#FAF7F2] hover:border-[#B8960C] hover:bg-[#FFF8E1]"
            } ${uploading && !cropModalOpen ? "opacity-60 cursor-not-allowed" : ""}`}
          >
            {uploading && !cropModalOpen ? (
              <>
                <Loader2 size={32} className="text-[#B8960C] animate-spin" />
                <p className="text-sm font-semibold text-[#6B6560]">Mengupload...</p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 bg-white border border-[#DDD8D0] rounded-full flex items-center justify-center shadow-sm">
                  <ImageIcon size={22} className="text-[#B8960C]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-[#3D2B1F]">
                    Klik untuk pilih foto
                  </p>
                  <p className="text-xs text-[#A89880] mt-1">
                    atau seret & lepas file ke sini
                  </p>
                  <p className="text-xs text-[#A89880]">JPG, PNG, WebP, GIF · Maks. 5MB</p>
                </div>
              </>
            )}
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleInputChange}
          />
        </>
      )}

      {/* URL Mode */}
      {mode === "url" && (
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-11 px-4 border border-[#DDD8D0] rounded-md text-sm focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none bg-white"
        />
      )}

      {/* Error */}
      {error && (
        <p className="mt-2 text-xs text-red-600 font-semibold">⚠ {error}</p>
      )}

      {/* Preview */}
      {value && (
        <div className="mt-3">
          <p className="text-xs text-[#A89880] mb-2 font-medium">Preview Gambar:</p>
          <div className="flex items-start gap-4">
            {/* Photo preview — portrait 3:4 if aspectRatio given */}
            <div
              className="relative group shrink-0 rounded-xl overflow-hidden border border-[#DDD8D0] shadow-sm bg-[#F5F0E8]"
              style={
                aspectRatio
                  ? { width: "120px", height: `${Math.round(120 / aspectRatio)}px` }
                  : { width: "100%", maxHeight: "256px" }
              }
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={value}
                alt="preview"
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
              {/* Overlay Actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-1">
                <button
                  type="button"
                  onClick={() => {
                    setMode("upload");
                    setTimeout(() => inputRef.current?.click(), 0);
                  }}
                  className="w-full px-2 py-1 bg-white text-[#3D2B1F] hover:bg-[#FDF3D0] rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <Upload size={10} /> Ganti
                </button>
                <button
                  type="button"
                  onClick={handleClear}
                  className="w-full px-2 py-1 bg-[#C0392B] text-white hover:bg-[#A93226] rounded text-[10px] font-bold flex items-center justify-center gap-1 transition-colors"
                >
                  <X size={10} /> Hapus
                </button>
              </div>
            </div>

            {/* Info text next to photo */}
            {aspectRatio && (
              <div className="flex flex-col justify-center gap-1 text-xs text-[#6B6560]">
                <p className="font-semibold text-[#3D2B1F]">Foto berhasil dipilih ✓</p>
                <p>Rasio: 3:4 (pas foto)</p>
                <p className="text-[#A89880]">Hover foto untuk<br/>ganti atau hapus</p>
              </div>
            )}
          </div>

          {/* File input kept here so 'Ganti Gambar' can trigger it even if dropzone is hidden */}
          {mode === "upload" && (
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={handleInputChange}
            />
          )}
        </div>
      )}


      {/* Crop Modal */}
      {cropModalOpen && imageSrc && aspectRatio && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col">
            <div className="px-6 py-4 border-b border-[#E8E0D0] flex justify-between items-center bg-[#FAF7F2]">
              <h3 className="font-bold text-[#3D2B1F]">Sesuaikan Gambar</h3>
              <button 
                onClick={handleCancelCrop}
                disabled={uploading}
                className="text-[#9C8B7A] hover:text-[#C0392B] transition-colors disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="relative w-full h-[60vh] bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            
            <div className="p-6 bg-white flex flex-col sm:flex-row gap-4 items-center justify-between border-t border-[#E8E0D0]">
              <div className="w-full sm:w-1/2 flex items-center gap-3">
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
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={handleCancelCrop}
                  disabled={uploading}
                  className="flex-1 sm:flex-none px-4 py-2 text-sm font-bold text-[#6B6560] bg-[#F5F0E8] hover:bg-[#E8E0D0] rounded-lg transition-colors disabled:opacity-50"
                >
                  Batal
                </button>
                <button
                  type="button"
                  onClick={handleApplyCrop}
                  disabled={uploading}
                  className="flex-1 sm:flex-none px-6 py-2 text-sm font-bold text-white bg-[#2D6A4F] hover:bg-[#1f4a37] rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {uploading ? (
                    <><Loader2 size={16} className="animate-spin" /> Memproses...</>
                  ) : (
                    <><Check size={16} /> Terapkan & Upload</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
