"use client";

import { useState, useMemo } from "react";
import { Search, CalendarDays, MapPin, Share2, Clock, ChevronDown } from "lucide-react";

type Wedding = {
  groomName: string | null;
  brideName: string | null;
  weddingDate: string | null;
  preferredWeddingTime?: string | null;
  couplePhoto: string | null;
};

interface WeddingAnnouncementsClientProps {
  weddings: Wedding[];
}

export function WeddingAnnouncementsClient({ weddings }: WeddingAnnouncementsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [visibleCount, setVisibleCount] = useState(3);

  const displayWeddings = useMemo(() => {
    const sortedWeddings = [...weddings].sort((a, b) => {
      const dateA = a.weddingDate ? new Date(a.weddingDate).getTime() : 0;
      const dateB = b.weddingDate ? new Date(b.weddingDate).getTime() : 0;
      return dateA - dateB; 
    });

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (searchQuery.trim() === "") {
      const upcoming = sortedWeddings.filter((w) => {
        if (!w.weddingDate) return false;
        const d = new Date(w.weddingDate);
        return d.getTime() >= now.getTime();
      });
      return upcoming;
    } else {
      const lowerQuery = searchQuery.toLowerCase();
      const filtered = sortedWeddings.filter((w) => {
        const groomMatch = w.groomName?.toLowerCase().includes(lowerQuery);
        const brideMatch = w.brideName?.toLowerCase().includes(lowerQuery);
        return groomMatch || brideMatch;
      });
      
      return filtered.sort((a, b) => {
        const dateA = a.weddingDate ? new Date(a.weddingDate).getTime() : 0;
        const dateB = b.weddingDate ? new Date(b.weddingDate).getTime() : 0;
        return dateB - dateA; // Descending
      });
    }
  }, [weddings, searchQuery]);

  const visibleWeddings = displayWeddings.slice(0, visibleCount);
  const hasMore = visibleCount < displayWeddings.length;

  const handleLoadMore = () => {
    setVisibleCount((prev) => prev + 5);
  };

  const handleShare = async (groomName: string | null, brideName: string | null) => {
    const text = `Pengumuman Perkawinan Katedral Santo Yosef: ${groomName || "N/A"} & ${brideName || "N/A"}. Mohon doa restunya!`;
    const url = window.location.href;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "Pengumuman Perkawinan",
          text: text,
          url: url,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Fallback: Copy to clipboard
      try {
        await navigator.clipboard.writeText(`${text} ${url}`);
        alert("Tautan berhasil disalin ke clipboard!");
      } catch (err) {
        console.error("Gagal menyalin tautan", err);
      }
    }
  };

  const getAnnouncementBadge = (weddingDate: string | null) => {
    if (!weddingDate) return null;
    const wedDate = new Date(weddingDate);
    const now = new Date();
    const diffTime = wedDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 0) return null; // Already passed
    
    let text = "";
    let colorClass = "";

    if (diffDays > 21) {
      text = "Pengumuman I";
      colorClass = "bg-[#E8F5E9] text-[#2E7D32] border-[#C8E6C9]";
    } else if (diffDays > 14) {
      text = "Pengumuman II";
      colorClass = "bg-[#FFF8E1] text-[#F57F17] border-[#FFECB3]";
    } else {
      text = "Pengumuman III";
      colorClass = "bg-[#FFEBEE] text-[#C62828] border-[#FFCDD2]";
    }

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${colorClass}`}>
        {text}
      </span>
    );
  };

  return (
    <div className="flex flex-col flex-grow w-full h-full">
      {/* Search Bar */}
      <div className="relative group bg-white rounded-full shadow-sm border border-[#EDE8DF] transition-all duration-300 focus-within:shadow-[0_8px_30px_rgb(184,150,12,0.15)] focus-within:border-[#B8960C] mb-8">
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[#9C8B7A] h-5 w-5 group-focus-within:text-[#B8960C] transition-colors" />
        <input
          type="text"
          placeholder="Cari nama mempelai (termasuk yang sudah lewat)..."
          className="w-full pl-12 pr-6 py-3 bg-transparent border-none outline-none text-[#3D2B1F] placeholder:text-[#9C8B7A] placeholder:font-light font-sans text-sm rounded-full"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setVisibleCount(5); // Reset load more when searching
          }}
        />
      </div>

      {/* List View with Scroll */}
      <div className="flex flex-col flex-grow min-h-0">
        {visibleWeddings.length > 0 ? (
          <>
            <div className="overflow-y-auto pr-2 pb-4 space-y-6" style={{ scrollbarWidth: "thin", scrollbarColor: "#B8960C transparent" }}>
              {visibleWeddings.map((item, i) => {
                let dateStr = "Belum ditentukan";
                if (item.weddingDate) {
                  const d = new Date(item.weddingDate);
                  if (!isNaN(d.getTime())) {
                    dateStr = d.toLocaleDateString("id-ID", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });
                  }
                }

                const timeStr = item.preferredWeddingTime || "10:00 WIB";

                return (
                  <li key={i} className="border-b border-[#EDE8DF] pb-5 last:border-0 last:pb-0 relative group">
                    <div className="flex justify-between items-start mb-1">
                      <div className="flex gap-2 items-center flex-wrap">
                        {getAnnouncementBadge(item.weddingDate)}
                      </div>
                      <button 
                        onClick={() => handleShare(item.groomName, item.brideName)}
                        className="text-[#9C8B7A] hover:text-[#B8960C] transition-colors p-1.5 -m-1.5 rounded-full hover:bg-[#FAF7F2]"
                        title="Bagikan Pengumuman"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>

                    <h3 className="text-xl md:text-2xl text-[#3D2B1F] font-bold mt-2 mb-3" style={{ fontFamily: "var(--font-cormorant)" }}>
                      {item.groomName || "N/A"} &amp; {item.brideName || "N/A"}
                    </h3>
                    
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 text-sm text-[#6B6560]">
                      <div className="flex items-center">
                        <CalendarDays className="h-4 w-4 mr-2 text-[#B8960C]" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-[#B8960C]" />
                        <span>{timeStr}</span>
                      </div>
                      <div className="flex items-start">
                        <MapPin className="h-4 w-4 mr-2 text-[#B8960C] shrink-0 mt-0.5" />
                        <span>Katedral Santo Yosef</span>
                      </div>
                    </div>
                  </li>
                );
              })}
            </div>

            {/* Load More Button */}
            {hasMore && (
              <div className="mt-6 flex justify-center flex-shrink-0 pt-2 border-t border-[#EDE8DF]">
                <button 
                  onClick={handleLoadMore}
                  className="flex items-center gap-2 text-sm font-semibold text-[#B8960C] hover:text-[#9A7A00] transition-colors"
                >
                  Tampilkan Lebih Banyak <ChevronDown className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-grow py-20 text-center bg-white rounded-2xl border border-[#EDE8DF] shadow-sm mt-auto mb-0 min-h-[300px]">
            <div className="w-16 h-16 bg-[#FAF7F2] rounded-full flex items-center justify-center mb-4 border border-[#E8E0D0]">
              <Search className="text-[#B8960C] h-6 w-6 opacity-50" />
            </div>
            <h3 className="text-xl font-bold text-[#3D2B1F] mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
              Tidak Ditemukan
            </h3>
            <p className="text-[#6B5744] text-sm max-w-sm font-light">
              {searchQuery.trim() !== ""
                ? "Kami tidak dapat menemukan nama pasangan yang cocok dengan pencarian Anda."
                : "Belum ada pengumuman perkawinan dalam waktu dekat."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
