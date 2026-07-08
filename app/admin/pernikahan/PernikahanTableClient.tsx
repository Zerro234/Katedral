"use client";

import { useState, useMemo } from "react";
import { ArrowRight, Search, Filter, X, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

const STAGE_NAMES = ["Pengisian Profil", "KPP", "Pemberkasan", "Kanonik", "Selesai"];
const STAGE_BADGE: Record<number, { bg: string; color: string; border: string }> = {
  1: { bg: "#EAF0FA", color: "#2E4E85", border: "#A8BEDE" },
  2: { bg: "#FDF3D0", color: "#9A7A0A", border: "#E8D070" },
  3: { bg: "#FDF3D0", color: "#9A7A0A", border: "#E8D070" },
  4: { bg: "#F0EAF8", color: "#6A3D96", border: "#C8A8DE" },
  5: { bg: "#EAF4ED", color: "#2E6B41", border: "#A8D5B4" },
  98: { bg: "#FFF8E1", color: "#B8960C", border: "#E8D070" },
};

type App = {
  id: string;
  currentStage: number | null;
  weddingDate: string | null;
  regNum: string | null;
  groom: string | null;
  bride: string | null;
  createdAt: string | null;
  isReregistration: boolean;
};

const FILTER_OPTIONS = [
  { label: "Semua Tahap", val: "all" },
  { label: "Tahap 1 – Profil", val: "1" },
  { label: "Tahap 2 – KPP", val: "2" },
  { label: "Tahap 3 – Pemberkasan", val: "3" },
  { label: "Tahap 4 – Kanonik", val: "4" },
  { label: "Tahap 5 – Selesai", val: "5" },
  { label: "Dibatalkan", val: "99" },
  { label: "🔄 Daftar Ulang", val: "reregistration" },
];

export const columns: ColumnDef<App>[] = [
  {
    accessorKey: "regNum",
    header: ({ column }) => (
      <button 
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
        className="flex items-center gap-1 uppercase text-[11px] font-semibold text-[#9C8B7A] tracking-wider outline-none"
      >
        No. Registrasi &amp; Pasangan <ArrowUpDown className="w-3 h-3 ml-1" />
      </button>
    ),
    cell: ({ row }) => {
      const app = row.original;
      return (
        <div>
          <p className="font-bold text-[12px] mb-0.5" style={{ color: "#B8960C", fontFamily: "var(--font-geist-mono)" }}>
            {app.regNum || "—"}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-medium" style={{ color: "#2C1F14" }}>
              {app.groom} &amp; {app.bride}
            </p>
            {app.isReregistration && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
                    style={{ background: "#EAF0FA", color: "#2E4E85", border: "1px solid #A8BEDE" }}>
                🔄 Daftar Ulang
              </span>
            )}
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "currentStage",
    header: ({ column }) => (
      <button 
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
        className="flex items-center gap-1 uppercase text-[11px] font-semibold text-[#9C8B7A] tracking-wider outline-none"
      >
        Tahap Saat Ini <ArrowUpDown className="w-3 h-3 ml-1" />
      </button>
    ),
    cell: ({ row }) => {
      const s = row.original.currentStage ?? 1;
      const badge = s === 99
        ? { bg: "#FAEDED", color: "#8B3A3A", border: "#E8AAAA" }
        : STAGE_BADGE[s] ?? STAGE_BADGE[1];
      
      let label = `Tahap ${s}: ${STAGE_NAMES[s - 1]}`;
      if (s === 99) label = "Dibatalkan";
      if (s === 98) label = "Daftar Ulang";
      
      return (
        <span className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase rounded-full"
              style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}>
          {label}
        </span>
      );
    }
  },
  {
    accessorKey: "weddingDate",
    header: ({ column }) => (
      <button 
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
        className="flex items-center gap-1 uppercase text-[11px] font-semibold text-[#9C8B7A] tracking-wider outline-none"
      >
        Rencana Pemberkatan <ArrowUpDown className="w-3 h-3 ml-1" />
      </button>
    ),
    cell: ({ row }) => {
      const val = row.original.weddingDate;
      return (
        <span className="text-[13px]" style={{ color: "#6B5744" }}>
          {val
            ? new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
            : <span style={{ color: "#D4CAC0", fontStyle: "italic" }}>Belum ditentukan</span>}
        </span>
      );
    }
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <button 
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")} 
        className="flex items-center gap-1 uppercase text-[11px] font-semibold text-[#9C8B7A] tracking-wider outline-none"
      >
        Terdaftar Pada <ArrowUpDown className="w-3 h-3 ml-1" />
      </button>
    ),
    cell: ({ row }) => {
      const val = row.original.createdAt;
      return (
        <span className="text-[13px]" style={{ color: "#9C8B7A" }}>
          {val ? new Date(val).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—"}
        </span>
      );
    }
  },
  {
    id: "actions",
    header: () => <div className="text-right text-[11px] font-semibold text-[#9C8B7A] uppercase tracking-wider">Aksi</div>,
    cell: ({ row }) => {
      return (
        <div className="text-right">
          <Link href={`/admin/pernikahan/${row.original.id}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-[12px] font-bold border transition-all hover:bg-[#FDF3D0]"
            style={{ color: "#B8960C", borderColor: "#E8D070" }}>
            Kelola <ArrowRight size={13} />
          </Link>
        </div>
      );
    }
  }
];

export default function PernikahanTableClient({ apps }: { apps: App[] }) {
  const [search, setSearch] = useState("");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [showFilter, setShowFilter] = useState(false);
  const [sorting, setSorting] = useState<SortingState>([]);

  // We maintain the existing custom filter logic
  const filtered = useMemo(() => {
    return apps.filter((app) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        (app.groom ?? "").toLowerCase().includes(q) ||
        (app.bride ?? "").toLowerCase().includes(q) ||
        (app.regNum ?? "").toLowerCase().includes(q);
      const matchStage =
        stageFilter === "all" ||
        (stageFilter === "reregistration" ? app.isReregistration : stageFilter === "99" ? app.currentStage === 99 : String(app.currentStage) === stageFilter);
      return matchSearch && matchStage;
    });
  }, [apps, search, stageFilter]);

  const table = useReactTable({
    data: filtered,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  const hasFilter = search || stageFilter !== "all";
  const activeFilterLabel = FILTER_OPTIONS.find((o) => o.val === stageFilter)?.label ?? "Filter";

  return (
    <>
      {/* Toolbar */}
      <div className="card-sacred relative z-20 p-4 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between mb-4">
        {/* Search */}
        <div className="relative flex-1 md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2" size={15} style={{ color: "#9C8B7A" }} />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama atau no. registrasi..."
            className="w-full h-10 pl-9 pr-9 text-[13px] rounded-lg outline-none transition-all input-gold"
            style={{ border: "1px solid #E8E0D0", background: "#FDFBF8", color: "#2C1F14" }}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: "#9C8B7A" }}>
              <X size={13} />
            </button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          {/* Filter Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowFilter(!showFilter)}
              className="flex items-center gap-2 px-4 h-10 rounded-lg text-[13px] font-semibold border transition-all outline-none"
              style={{
                background: stageFilter !== "all" ? "#B8960C" : "#FFFFFF",
                color: stageFilter !== "all" ? "#FFFFFF" : "#6B5744",
                borderColor: stageFilter !== "all" ? "#B8960C" : "#E8E0D0",
              }}
            >
              <Filter size={14} />
              {stageFilter !== "all" ? activeFilterLabel : "Filter Tahap"}
            </button>

            {showFilter && (
              <div className="absolute right-0 top-full mt-1.5 rounded-xl shadow-lg z-30 w-52 py-1.5 overflow-hidden"
                   style={{ background: "#FFFFFF", border: "1px solid #E8E0D0" }}>
                {FILTER_OPTIONS.map((opt) => (
                  <button key={opt.val} onClick={() => { setStageFilter(opt.val); setShowFilter(false); }}
                    className="w-full text-left px-4 py-2.5 text-[13px] transition-colors hover:bg-[#F5F0E8] outline-none"
                    style={{ color: stageFilter === opt.val ? "#B8960C" : "#2C1F14", fontWeight: stageFilter === opt.val ? 700 : 400 }}>
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset */}
          {hasFilter && (
            <button onClick={() => { setSearch(""); setStageFilter("all"); }}
              className="flex items-center gap-1.5 px-3 h-10 rounded-lg text-[12px] font-bold border transition-all outline-none"
              style={{ background: "#FAEDED", color: "#8B3A3A", borderColor: "#E8AAAA" }}>
              <X size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="card-sacred overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader style={{ background: "#F5F0E8", borderBottom: "1px solid #E8E0D0" }}>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="border-b-[#E8E0D0] hover:bg-transparent">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead key={header.id} className="h-12 px-6">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </TableHead>
                    )
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-b-[#F0EBE3] hover:bg-[#FDFBF8]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-6 py-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-32 text-center text-[14px] text-[#9C8B7A]">
                    {apps.length === 0 ? "Belum ada data pendaftaran pernikahan." : `Tidak ada hasil untuk pencarian ini.`}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Pagination Controls */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-[#F0EBE3] bg-[#FDFBF8]">
          <div className="text-[12px] text-[#9C8B7A]">
            Menampilkan <span className="font-bold text-[#2C1F14]">{table.getRowModel().rows.length}</span> baris di halaman ini
            (dari total <span className="font-bold text-[#2C1F14]">{table.getFilteredRowModel().rows.length}</span> data yang cocok).
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="text-[#6B5744] border-[#E8E0D0] h-8 text-xs font-semibold hover:bg-[#F5F0E8] hover:text-[#2C1F14]"
            >
              Sebelumnya
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="text-[#6B5744] border-[#E8E0D0] h-8 text-xs font-semibold hover:bg-[#F5F0E8] hover:text-[#2C1F14]"
            >
              Selanjutnya
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
