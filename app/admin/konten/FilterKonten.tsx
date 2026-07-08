"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";

export function FilterKonten() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentType = searchParams.get("type") || "ALL";
  const currentSort = searchParams.get("sort") || "desc";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6 bg-white p-4 rounded-xl border border-[#DDD8D0] shadow-sm">
      <div className="flex-1">
        <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-1.5">
          Filter Tipe Konten
        </label>
        <select
          value={currentType}
          onChange={(e) => updateFilters("type", e.target.value)}
          className="w-full h-10 px-3 border border-[#DDD8D0] rounded-md text-sm bg-[#FAF7F2] focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none"
        >
          <option value="ALL">Semua Konten</option>
          <option value="NEWS">Berita / Artikel</option>
          <option value="MASS_SCHEDULE">Jadwal Misa</option>
          <option value="ANNOUNCEMENT">Pengumuman</option>
          <option value="GALLERY">Foto Galeri</option>
        </select>
      </div>

      <div className="flex-1">
        <label className="block text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-1.5">
          Urutkan Tanggal Dibuat
        </label>
        <select
          value={currentSort}
          onChange={(e) => updateFilters("sort", e.target.value)}
          className="w-full h-10 px-3 border border-[#DDD8D0] rounded-md text-sm bg-[#FAF7F2] focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none"
        >
          <option value="desc">Terbaru (Paling Atas)</option>
          <option value="asc">Terlama (Paling Atas)</option>
        </select>
      </div>
    </div>
  );
}
