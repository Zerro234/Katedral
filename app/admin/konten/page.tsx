import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { contents } from "@/lib/db/schema";
import { desc, asc, eq } from "drizzle-orm";
import Link from "next/link";
import { PlusCircle, Pencil, Newspaper, CalendarDays } from "lucide-react";
import { DeleteContentButton } from "./DeleteContentButton";
import { FilterKonten } from "./FilterKonten";

const TYPE_LABELS: Record<string, { label: string; color: string }> = {
  NEWS: { label: "Berita", color: "bg-[#EBF5FB] text-[#2471A3]" },
  MASS_SCHEDULE: { label: "Jadwal Misa", color: "bg-[#D8F3DC] text-[#2D6A4F]" },
  ANNOUNCEMENT: { label: "Pengumuman", color: "bg-[#FFF8E1] text-[#B8960C]" },
  GALLERY: { label: "Galeri", color: "bg-[#F4F6F7] text-[#5D6D7E]" },
};

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AdminKontenPage(props: Props) {
  const searchParams = await props.searchParams;
  const filterType = typeof searchParams.type === 'string' ? searchParams.type : 'ALL';
  const sortDate = typeof searchParams.sort === 'string' ? searchParams.sort : 'desc';

  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return null;

  const allContents = await db.select()
    .from(contents)
    .where(filterType !== 'ALL' ? eq(contents.type, filterType) : undefined)
    .orderBy(sortDate === 'asc' ? asc(contents.createdAt) : desc(contents.createdAt));

  // Note: we fetch counts separately to show total stats regardless of active filters
  const allForStats = await db.select().from(contents);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#3D2B1F] mb-1" style={{ fontFamily: "var(--font-cormorant)" }}>
            Kelola Konten Publik
          </h1>
          <p className="text-[#6B6560] text-sm">Tambah, ubah, atau hapus berita dan jadwal misa yang tampil di halaman publik.</p>
        </div>
        <Link
          href="/admin/konten/tambah"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#B8960C] text-white font-bold text-sm rounded-md hover:bg-[#9A7A00] transition-colors shadow-sm"
        >
          <PlusCircle size={18} />
          Tambah Konten Baru
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#DDD8D0] shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-[#EBF5FB] text-[#2471A3] rounded-full flex items-center justify-center">
            <Newspaper size={20} />
          </div>
          <div>
            <p className="text-xs text-[#A89880] uppercase font-bold tracking-wider">Total Berita</p>
            <p className="text-2xl font-bold text-[#3D2B1F]">{allForStats.filter(c => c.type === "NEWS").length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#DDD8D0] shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-[#D8F3DC] text-[#2D6A4F] rounded-full flex items-center justify-center">
            <CalendarDays size={20} />
          </div>
          <div>
            <p className="text-xs text-[#A89880] uppercase font-bold tracking-wider">Jadwal Misa</p>
            <p className="text-2xl font-bold text-[#3D2B1F]">{allForStats.filter(c => c.type === "MASS_SCHEDULE").length}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#DDD8D0] shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 bg-[#FFF8E1] text-[#B8960C] rounded-full flex items-center justify-center">
            <PlusCircle size={20} />
          </div>
          <div>
            <p className="text-xs text-[#A89880] uppercase font-bold tracking-wider">Total Konten</p>
            <p className="text-2xl font-bold text-[#3D2B1F]">{allForStats.length}</p>
          </div>
        </div>
      </div>

      <FilterKonten />

      {/* Table */}
      <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-[#F5F0E8] text-[#6B6560] text-xs uppercase tracking-wider border-b border-[#EDE8DF]">
              <tr>
                <th className="px-6 py-4 font-semibold">Judul Konten</th>
                <th className="px-6 py-4 font-semibold">Tipe</th>
                <th className="px-6 py-4 font-semibold">Info Tambahan</th>
                <th className="px-6 py-4 font-semibold">Dipublikasikan</th>
                <th className="px-6 py-4 font-semibold text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE8DF]">
              {allContents.map((item) => {
                const typeInfo = TYPE_LABELS[item.type || "NEWS"] || { label: item.type, color: "bg-gray-100 text-gray-600" };
                return (
                  <tr key={item.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-[#3D2B1F] max-w-xs truncate">{item.title}</p>
                      <p className="text-[#A89880] text-xs mt-0.5 font-mono">/berita/{item.slug?.slice(0, 20)}...</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2.5 py-1 text-[10px] font-bold uppercase rounded-full ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-[#6B6560] text-xs">
                      {item.eventDate && <span className="block">📅 {item.eventDate}</span>}
                      {item.location && <span className="block">📍 {item.location}</span>}
                      {!item.eventDate && !item.location && <span className="text-[#C0C0C0] italic">—</span>}
                    </td>
                    <td className="px-6 py-4 text-[#6B6560] text-xs">
                      {item.createdAt ? new Date(item.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/admin/konten/${item.id}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-[#B8960C] rounded text-xs font-bold text-[#B8960C] hover:bg-[#FFF8E1] transition-colors"
                        >
                          <Pencil size={13} /> Edit
                        </Link>
                        <DeleteContentButton id={item.id} />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {allContents.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#6B6560]">
                    Belum ada konten. Klik &quot;Tambah Konten Baru&quot; untuk memulai.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
