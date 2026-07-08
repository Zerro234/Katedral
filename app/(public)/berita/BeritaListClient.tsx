"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { CalendarDays, Church, ArrowLeft, ArrowRight, Tag } from "lucide-react";
import { cn } from "@/lib/utils";

type NewsItem = {
  id: string;
  title: string;
  slug: string | null;
  body: string | null;
  imageUrl: string | null;
  createdAt: Date | null;
  category: string | null;
};

function SafeImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
  const [error, setError] = useState(false);

  if (error) return null;

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
      loading="lazy"
    />
  );
}


/** Strip HTML tags and decode common entities for plain-text card preview */
function stripHtml(html: string | null): string {
  if (!html) return "";
  return html
    .replace(/<[^>]+>/g, " ")       // remove all HTML tags
    .replace(/&nbsp;/g, " ")         // decode &nbsp;
    .replace(/&amp;/g, "&")          // decode &amp;
    .replace(/&lt;/g, "<")           // decode &lt;
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")            // collapse extra whitespace
    .trim();
}

export default function BeritaListClient({ allNews }: { allNews: NewsItem[] }) {
  const [activeCategory, setActiveCategory] = useState<string>("Semua Berita");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Kategori hardcoded sesuai kesepakatan agar stabil dan tidak terpengaruh data kotor
  const categories = ["Semua Berita", "Berita Paroki", "Pengumuman"];

  // Filter + pagination
  const { filteredNews, totalPages } = useMemo(() => {
    const filtered = allNews.filter((news) => {
      if (activeCategory === "Semua Berita") return true;
      return news.category?.trim() === activeCategory;
    });
    return {
      filteredNews: filtered,
      totalPages: Math.ceil(filtered.length / itemsPerPage),
    };
  }, [allNews, activeCategory]);

  const paginatedNews = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredNews.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredNews, currentPage]);

  const handleCategoryClick = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
    window.scrollTo({ top: 300, behavior: "smooth" });
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 300, behavior: "smooth" });
    }
  };

  return (
    <>
      {/* ── Filter Category Tabs ── */}
      <div className="flex flex-wrap gap-2 mb-10 pb-6" style={{ borderBottom: "1px solid #E8E0D0" }}>
        {categories.map((category) => {
          const isActive = activeCategory === category;
          return (
            <button
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={cn(
                "px-5 py-2 text-[13px] font-semibold rounded-full transition-all duration-200",
                isActive
                  ? "text-white shadow-sm"
                  : "border text-[#6B5744] hover:bg-[#F5F0E8] hover:border-[#B8960C]/40"
              )}
              style={{
                background: isActive ? "#2C1F14" : "#FFFFFF",
                borderColor: isActive ? "transparent" : "#E8E0D0",
                border: isActive ? "none" : "1px solid #E8E0D0",
              }}
            >
              {category}
            </button>
          );
        })}
      </div>

      {/* ── Result count ── */}
      <div className="mb-8 flex items-center justify-between">
        <p className="text-[13px]" style={{ color: "#9C8B7A" }}>
          Menampilkan{" "}
          <span className="font-semibold" style={{ color: "#2C1F14" }}>
            {filteredNews.length}
          </span>{" "}
          berita
          {activeCategory !== "Semua Berita" && (
            <>
              {" "}dalam kategori{" "}
              <span className="font-semibold" style={{ color: "#B8960C" }}>
                {activeCategory}
              </span>
            </>
          )}
        </p>
        {totalPages > 1 && (
          <p className="text-[12px]" style={{ color: "#9C8B7A" }}>
            Halaman {currentPage} dari {totalPages}
          </p>
        )}
      </div>

      {/* ── News Grid ── */}
      {paginatedNews.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
          {paginatedNews.map((news, idx) => (
            <Link
              href={`/berita/${news.slug}`}
              key={news.id}
              className="group block h-full"
              style={{ animationDelay: `${idx * 40}ms` }}
            >
              <article className="card-sacred h-full flex flex-col overflow-hidden">
                {/* Thumbnail */}
                <div
                  className="relative overflow-hidden flex-shrink-0"
                  style={{ height: "200px", background: "#F5F0E8" }}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-[#F5F0E8] z-0">
                    <Church size={40} style={{ color: "#D5C6AF", marginBottom: "8px" }} />
                    <span className="text-xs font-medium uppercase tracking-wider text-center" style={{ color: "#A89880" }}>Katedral Santo Yosef</span>
                  </div>
                  {news.imageUrl && (
                    <SafeImage
                      src={news.imageUrl}
                      alt={news.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 z-10"
                    />
                  )}

                  {/* Category Badge over image */}
                  {news.category && (
                    <div className="absolute top-3 left-3 z-20">
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: "#B8960C", color: "#FFFFFF" }}
                      >
                        <Tag size={8} />
                        {news.category}
                      </span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <h3
                    className="font-bold text-[17px] mb-2.5 leading-snug transition-colors duration-200 group-hover:text-[#B8960C] line-clamp-2"
                    style={{
                      fontFamily: "var(--font-cormorant)",
                      color: "#2C1F14",
                    }}
                  >
                    {news.title}
                  </h3>
                  <p
                    className="text-[13px] leading-relaxed line-clamp-3 flex-1 mb-5"
                    style={{ color: "#6B5744" }}
                  >
                    {stripHtml(news.body)}
                  </p>

                  {/* Footer */}
                  <div
                    className="flex items-center justify-between pt-4 mt-auto"
                    style={{ borderTop: "1px solid #E8E0D0" }}
                  >
                    <div
                      className="flex items-center gap-1.5 text-[11px] font-medium"
                      style={{ color: "#9C8B7A" }}
                    >
                      <CalendarDays size={12} />
                      <span>
                        {new Date(news.createdAt || new Date()).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <span
                      className="text-[12px] font-bold transition-all group-hover:underline"
                      style={{ color: "#B8960C" }}
                    >
                      Baca →
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div
          className="text-center py-24 rounded-xl"
          style={{
            background: "#FFFFFF",
            border: "1px solid #E8E0D0",
          }}
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
            style={{ background: "#F5F0E8" }}
          >
            <Church size={32} style={{ color: "#E8E0D0" }} />
          </div>
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}
          >
            Belum Ada Berita
          </h3>
          <p className="text-[14px]" style={{ color: "#9C8B7A" }}>
            Tidak ada berita untuk kategori{" "}
            <strong style={{ color: "#B8960C" }}>{activeCategory}</strong>.
          </p>
          {activeCategory !== "Semua Berita" && (
            <button
              onClick={() => handleCategoryClick("Semua Berita")}
              className="mt-6 px-6 py-2.5 text-[13px] font-semibold rounded-full text-white transition-colors hover:opacity-90"
              style={{ background: "#B8960C" }}
            >
              Lihat Semua Berita
            </button>
          )}
        </div>
      )}

      {/* ── Pagination Controls ── */}
      {totalPages > 1 && (
        <div className="mt-14 flex justify-center items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
            style={{
              background: "#FFFFFF",
              borderColor: "#E8E0D0",
              color: "#6B5744",
            }}
          >
            <ArrowLeft size={16} />
          </button>

          {/* Page Numbers */}
          {Array.from({ length: totalPages }).map((_, i) => {
            const page = i + 1;
            const isCurrentPage = currentPage === page;
            const isVisible =
              page === 1 ||
              page === totalPages ||
              (page >= currentPage - 1 && page <= currentPage + 1);
            const isEllipsis =
              (page === currentPage - 2 && page > 1) ||
              (page === currentPage + 2 && page < totalPages);

            if (isVisible) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className="w-10 h-10 rounded-lg font-semibold text-[14px] flex items-center justify-center border transition-all"
                  style={{
                    background: isCurrentPage ? "#2C1F14" : "#FFFFFF",
                    color: isCurrentPage ? "#FFFFFF" : "#6B5744",
                    borderColor: isCurrentPage ? "#2C1F14" : "#E8E0D0",
                  }}
                >
                  {page}
                </button>
              );
            }
            if (isEllipsis) {
              return (
                <span key={page} className="w-10 text-center text-[14px]" style={{ color: "#9C8B7A" }}>
                  …
                </span>
              );
            }
            return null;
          })}

          {/* Next */}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-10 h-10 rounded-lg flex items-center justify-center border transition-all disabled:opacity-40"
            style={{
              background: "#FFFFFF",
              borderColor: "#E8E0D0",
              color: "#6B5744",
            }}
          >
            <ArrowRight size={16} />
          </button>
        </div>
      )}
    </>
  );
}
