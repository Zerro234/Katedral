"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, X, Send, ArrowUpCircle, ArrowDownCircle, Trash2, UserCheck, CalendarDays, History, Calendar as CalendarIcon, AlertTriangle, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { id as localeId } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const STAGE_NAMES = ["Pengisian Profil", "Kursus KPP", "Pemberkasan Dokumen", "Penyelidikan Kanonik", "Pemberkatan Nikah"];

type PreviousApp = {
  regNum: string | null;
  createdAt: Date | null;
  canceledAt: Date | null;
  cancelReason: string | null;
} | null;

export default function DetailClient({ 
  application, 
  docs, 
  history,
  priests,
  previousApp,
}: { 
  application: Record<string, string | number | null | undefined | boolean>;
  docs: Array<{ id: string, documentName: string | null, isReceived: boolean | null, receivedAt: Date | null }>;
  history: Array<{ stageNumber: number | null, note: string | null, changedAt: Date | null }>;
  priests: Array<{ id: string, name: string, email: string }>;
  previousApp: PreviousApp;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [selectedPriest, setSelectedPriest] = useState<string>(
    (application.priestId as string) || ""
  );
  const [loadingPriest, setLoadingPriest] = useState(false);

  // Ceremony Date/Time State
  // weddingDate is stored as "YYYY-MM-DDTHH:mm" in the DB
  const existingDate = (application.weddingDate as string) || "";
  const [dateObj, setDateObj] = useState<Date | undefined>(
    existingDate ? new Date(existingDate.substring(0, 10)) : undefined
  );
  const ceremonyDate = dateObj ? format(dateObj, "yyyy-MM-dd") : "";
  const [ceremonyTime, setCeremonyTime] = useState(
    existingDate && existingDate.includes("T") ? existingDate.substring(11, 16) : ""
  );
  const [loadingCeremony, setLoadingCeremony] = useState(false);
  
  // Cancel Modal State
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceLoading, setAdvanceLoading] = useState(false);

  // Rollback Stage Modal State
  const [showRollbackModal, setShowRollbackModal] = useState(false);
  const [rollbackReason, setRollbackReason] = useState("");
  const [rollbackLoading, setRollbackLoading] = useState(false);

  // Approve Reregistration Modal State  
  const [showApproveReregModal, setShowApproveReregModal] = useState(false);
  const [approveReregLoading, setApproveReregLoading] = useState(false);

  // Local docs state for optimistic UI
  const [localDocs, setLocalDocs] = useState(docs);

  // Download ZIP State
  const [loadingZip, setLoadingZip] = useState(false);

  const handleDownloadZip = async () => {
    setLoadingZip(true);
    try {
      const JSZip = (await import("jszip")).default;
      const { saveAs } = await import("file-saver");
      
      const zip = new JSZip();
      const coupleName = `${application.groomName?.toString().replace(/\s+/g, '_') || 'Pria'}_dan_${application.brideName?.toString().replace(/\s+/g, '_') || 'Wanita'}`;
      
      // Prioritize couplePhoto, fallback to legacy photos
      if (application.couplePhoto) {
        const response = await fetch(application.couplePhoto as string);
        const blob = await response.blob();
        zip.file(`Foto_Pasangan_${coupleName}.jpg`, blob);
      } else {
        if (application.groomPhoto) {
          const response = await fetch(application.groomPhoto as string);
          const blob = await response.blob();
          zip.file(`Foto_Pria_${application.groomName?.toString().replace(/\s+/g, '_') || 'TanpaNama'}.jpg`, blob);
        }
        if (application.bridePhoto) {
          const response = await fetch(application.bridePhoto as string);
          const blob = await response.blob();
          zip.file(`Foto_Wanita_${application.brideName?.toString().replace(/\s+/g, '_') || 'TanpaNama'}.jpg`, blob);
        }
      }
      
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `Foto_Pernikahan_${coupleName}.zip`);
    } catch (error) {
      console.error("Gagal mendownload ZIP:", error);
      toast.error("Terjadi kesalahan saat mengunduh foto ZIP. Mungkin masalah koneksi atau hak akses CORS.");
    } finally {
      setLoadingZip(false);
    }
  };

  const handleToggleDoc = async (docId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    
    // Optimistic update
    setLocalDocs(prev => prev.map(d => d.id === docId ? { ...d, isReceived: newStatus } : d));
    
    // Background API call
    try {
      await fetch("/api/admin/pernikahan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "TOGGLE_DOC", applicationId: application.id, docId, isReceived: newStatus })
      });
      router.refresh();
    } catch (error) {
      console.error("Gagal update dokumen:", error);
      // Revert if failed
      setLocalDocs(docs);
      toast.error("Gagal menyimpan status dokumen");
    }
  };

  const handleAdvanceStage = async () => {
    setAdvanceLoading(true);
    await fetch("/api/admin/pernikahan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ADVANCE_STAGE", applicationId: application.id })
    });
    setShowAdvanceModal(false);
    router.refresh();
    setAdvanceLoading(false);
    toast.success(`Berhasil dinaikkan ke Tahap ${Math.min(5, (application.currentStage as number) + 1)}!`);
  };

  const handleRollbackStage = async () => {
    if (!rollbackReason.trim()) return;
    setRollbackLoading(true);
    await fetch("/api/admin/pernikahan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ROLLBACK_STAGE", applicationId: application.id, note: rollbackReason })
    });
    setShowRollbackModal(false);
    setRollbackReason("");
    router.refresh();
    setRollbackLoading(false);
    toast.success(`Berhasil dikembalikan ke Tahap ${(application.currentStage as number) - 1}.`);
  };

  const handleSendNote = async () => {
    if (!note.trim()) return;
    setLoading(true);
    await fetch("/api/admin/pernikahan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "SEND_NOTE", applicationId: application.id, note })
    });
    setNote("");
    router.refresh();
    setLoading(false);
    toast.success("Catatan berhasil dikirim ke dasbor pasangan!");
  };

  const handleCancelApplication = async () => {
    if (!cancelReason.trim()) return;
    
    setLoading(true);
    await fetch("/api/admin/pernikahan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "CANCEL_APPLICATION", applicationId: application.id, note: cancelReason })
    });
    setShowCancelModal(false);
    setCancelReason("");
    router.refresh();
    setLoading(false);
  };

  const handleApproveReregistration = async () => {
    setApproveReregLoading(true);
    await fetch("/api/admin/pernikahan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "APPROVE_REREGISTRATION", applicationId: application.id })
    });
    setShowApproveReregModal(false);
    router.refresh();
    setApproveReregLoading(false);
    toast.success("Daftar ulang disetujui! Formulir baru telah dibuat.");
  };

  const handleAssignPriest = async () => {
    setLoadingPriest(true);
    await fetch("/api/admin/pernikahan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "ASSIGN_PRIEST",
        applicationId: application.id,
        priestId: selectedPriest || null,
      }),
    });
    router.refresh();
    setLoadingPriest(false);
  };

  const handleSetCeremony = async () => {
    if (!ceremonyDate) return;
    setLoadingCeremony(true);
    const weddingDate = ceremonyTime
      ? `${ceremonyDate}T${ceremonyTime}`
      : ceremonyDate;
    await fetch("/api/admin/pernikahan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "SET_WEDDING_DATE",
        applicationId: application.id,
        weddingDate,
      }),
    });
    router.refresh();
    setLoadingCeremony(false);
  };

  const isCanceled = application.currentStage === 99 || application.currentStage === 98;
  const allDocsReceived = localDocs.length > 0 && localDocs.every((d) => d.isReceived);
  const isStage3PendingDocs = application.currentStage === 3 && !allDocsReceived;
  const isMissingStage5Requirements = application.currentStage === 4 && (!application.priestId || !application.weddingDate);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Kolom Kiri: Profil & Dokumen */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Kartu Data Pasangan */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#EDE8DF] flex items-center justify-between">
            <h3 className="font-bold text-[#3D2B1F] uppercase tracking-wide text-sm">Data Mempelai</h3>
            {(application.couplePhoto || application.groomPhoto || application.bridePhoto) && (
              <button
                onClick={handleDownloadZip}
                disabled={loadingZip}
                className="flex items-center gap-2 text-xs font-bold text-white bg-[#2D6A4F] px-3 py-1.5 rounded hover:bg-[#1f4a37] transition-colors disabled:opacity-50"
              >
                {loadingZip ? "Menyiapkan ZIP..." : "⬇ Download ZIP Foto"}
              </button>
            )}
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-[#B8960C] mb-4 border-b border-[#EDE8DF] pb-2">Calon Suami</h4>
              <div className="space-y-3 text-sm">
                <div><span className="block text-xs text-[#A89880] uppercase">Nama</span> <span className="font-medium text-[#3D2B1F]">{application.groomName}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Tgl Lahir</span> <span className="font-medium text-[#3D2B1F]">{application.groomBirthdate || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Agama</span> <span className="font-medium text-[#3D2B1F]">{application.groomReligion || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Pekerjaan</span> <span className="font-medium text-[#3D2B1F]">{application.groomOccupation || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Telepon</span> <span className="font-medium text-[#3D2B1F]">{application.groomPhone || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Paroki Asal</span> <span className="font-medium text-[#3D2B1F]">{application.groomBaptismChurch || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Nama Ayah</span> <span className="font-medium text-[#3D2B1F]">{application.groomFatherName || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Nama Ibu</span> <span className="font-medium text-[#3D2B1F]">{application.groomMotherName || "—"}</span></div>
              </div>
            </div>
            <div>
              <h4 className="font-bold text-[#B8960C] mb-4 border-b border-[#EDE8DF] pb-2">Calon Isteri</h4>
              <div className="space-y-3 text-sm">
                <div><span className="block text-xs text-[#A89880] uppercase">Nama</span> <span className="font-medium text-[#3D2B1F]">{application.brideName}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Tgl Lahir</span> <span className="font-medium text-[#3D2B1F]">{application.brideBirthdate || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Agama</span> <span className="font-medium text-[#3D2B1F]">{application.brideReligion || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Pekerjaan</span> <span className="font-medium text-[#3D2B1F]">{application.brideOccupation || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Telepon</span> <span className="font-medium text-[#3D2B1F]">{application.bridePhone || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Paroki Asal</span> <span className="font-medium text-[#3D2B1F]">{application.brideBaptismChurch || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Nama Ayah</span> <span className="font-medium text-[#3D2B1F]">{application.brideFatherName || "—"}</span></div>
                <div><span className="block text-xs text-[#A89880] uppercase">Nama Ibu</span> <span className="font-medium text-[#3D2B1F]">{application.brideMotherName || "—"}</span></div>
              </div>
            </div>
          </div>
        </div>

        {/* Kartu Informasi Perkawinan */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#EDE8DF]">
            <h3 className="font-bold text-[#3D2B1F] uppercase tracking-wide text-sm">Informasi Perkawinan</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {application.preferredWeddingDate && (
              <div><span className="block text-xs text-[#A89880] uppercase">Preferensi Tanggal Pemberkatan</span> <span className="font-medium text-[#3D2B1F]">{new Date(application.preferredWeddingDate as string).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></div>
            )}
            {application.preferredWeddingTime && (
              <div><span className="block text-xs text-[#A89880] uppercase">Preferensi Jam</span> <span className="font-medium text-[#3D2B1F]">{application.preferredWeddingTime} WIB</span></div>
            )}
          </div>
          {/* Foto Pasangan */}
          {(application.couplePhoto || application.groomPhoto) && (
            <div className="px-6 pb-6">
              <span className="block text-xs text-[#A89880] uppercase mb-2">Foto Pasangan</span>
              <a href={(application.couplePhoto || application.groomPhoto) as string} target="_blank" rel="noreferrer">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={(application.couplePhoto || application.groomPhoto) as string} alt="Foto Pasangan" className="max-w-xs rounded-lg border border-[#DDD8D0] shadow-sm" />
              </a>
              <a href={(application.couplePhoto || application.groomPhoto) as string} download className="text-xs text-[#2D6A4F] hover:underline mt-1 block">⬇ Download</a>
            </div>
          )}
        </div>

        {/* Kartu Dokumen */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#EDE8DF] flex justify-between items-center">
            <h3 className="font-bold text-[#3D2B1F] uppercase tracking-wide text-sm">Dokumen Persyaratan</h3>
            <span className="text-xs font-bold text-[#2D6A4F] bg-[#D8F3DC] px-2 py-1 rounded">
              {localDocs.filter(d => d.isReceived).length} / {localDocs.length} Diterima
            </span>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {localDocs.map((doc) => (
                <button 
                  key={doc.id}
                  onClick={() => handleToggleDoc(doc.id, doc.isReceived ?? false)}
                  className={`flex items-center justify-between p-3 rounded border transition-colors text-left ${
                    doc.isReceived 
                      ? "bg-[#D8F3DC]/30 border-[#2D6A4F]/30 hover:bg-[#D8F3DC]/50" 
                      : "bg-[#F5F0E8] border-[#DDD8D0] hover:bg-[#EDE8DF]"
                  }`}
                >
                  <span className={`text-sm font-medium ${doc.isReceived ? "text-[#2D6A4F]" : "text-[#6B6560]"}`}>
                    {doc.documentName}
                  </span>
                  {doc.isReceived ? (
                    <Check size={18} className="text-[#2D6A4F]" />
                  ) : (
                    <X size={18} className="text-[#A89880]" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Kolom Kanan: Aksi & Riwayat */}
      <div className="lg:col-span-1 space-y-6">
        
        {/* Approve Daftar Ulang (Hanya muncul jika stage 98) */}
        {application.currentStage === 98 && (
          <div className="bg-[#FFF8E1] rounded-xl border border-[#E8D070] shadow-sm overflow-hidden p-6 text-center">
            <h3 className="text-xs font-bold text-[#9A7A0A] uppercase tracking-wider mb-2">Persetujuan Daftar Ulang</h3>
            <p className="text-[#3D2B1F] text-sm mb-6">
              Pasangan ini telah mengajukan pendaftaran ulang. Setujui untuk mengarsipkan pendaftaran ini dan membuat formulir baru di Tahap 1.
            </p>
            
            <button 
              disabled={loading}
              onClick={() => setShowApproveReregModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B8960C] text-white font-bold rounded-md hover:bg-[#9A7A00] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              <Check size={18} />
              Terima & Buat Formulir Baru
            </button>
          </div>
        )}
        
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden p-6 text-center">
          <h3 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-2">Manajemen Tahap</h3>
          <div className="text-[#3D2B1F] text-sm mb-6">
            Tahap saat ini: 
            <div className="mt-1 font-bold">
              {application.currentStage === 99 ? (
                <span className="text-red-600">DIBATALKAN</span>
              ) : application.currentStage === 98 ? (
                <span className="text-[#B8960C]">MENUNGGU KONFIRMASI DAFTAR ULANG</span>
              ) : (
                <span className="text-[#B8960C]">Tahap {application.currentStage} — {STAGE_NAMES[(application.currentStage as number) - 1]}</span>
              )}
            </div>
          </div>
          
          {isStage3PendingDocs && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 font-bold text-center">
              ⚠ Validasi semua dokumen terlebih dahulu sebelum naik ke Tahap 4.
            </div>
          )}

          {isMissingStage5Requirements && (
            <div className="mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded-md text-xs text-red-600 font-bold text-center">
              ⚠ Penugasan Romo dan Tanggal Pemberkatan harus ditentukan terlebih dahulu sebelum masuk ke Tahap 5.
            </div>
          )}
          
          <button 
            disabled={loading || Number(application.currentStage ?? 0) >= 5 || isCanceled || isStage3PendingDocs || isMissingStage5Requirements}
            onClick={() => setShowAdvanceModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#B8960C] text-white font-bold rounded-md hover:bg-[#9A7A00] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-3"
          >
            <ArrowUpCircle size={18} />
            Naikkan ke Tahap {Math.min(5, (application.currentStage as number) + 1)}
          </button>

          {!isCanceled && (application.currentStage as number) > 1 && (application.currentStage as number) <= 5 && (
            <button 
              disabled={loading || isCanceled}
              onClick={() => setShowRollbackModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#DDD8D0] text-[#6B6560] font-bold rounded-md hover:bg-[#FAF7F2] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed mb-3"
            >
              <ArrowDownCircle size={18} />
              Kembalikan ke Tahap {(application.currentStage as number) - 1}
            </button>
          )}

          <button 
            disabled={loading || isCanceled}
            onClick={() => setShowCancelModal(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-[#C0392B] text-[#C0392B] font-bold rounded-md hover:bg-[#FDECEA] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={18} />
            Batalkan Pendaftaran
          </button>
        </div>

        {/* Penugasan Romo */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden p-6">
          <h3 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-3 flex items-center gap-2">
            <UserCheck size={14} /> Penugasan Romo
          </h3>
          {application.priestId && (
            <div className="mb-3 px-3 py-2 bg-[#FFF8E1] rounded-md border border-[#B8960C]/20">
              <p className="text-[10px] font-bold text-[#A89880] uppercase tracking-wider mb-0.5">Ditugaskan</p>
              <p className="font-bold text-[#3D2B1F] text-sm">
                {priests.find((p) => p.id === application.priestId)?.name || "Romo Ditugaskan"}
              </p>
            </div>
          )}
          {priests.length === 0 ? (
            <p className="text-xs text-[#A89880]">Belum ada imam terdaftar di sistem.</p>
          ) : (
            <div className="space-y-3">
              <Select
                value={selectedPriest || "unassigned"}
                onValueChange={(val: string | null) => val && setSelectedPriest(val === "unassigned" ? "" : val)}
                disabled={loadingPriest || isCanceled}
              >
                <SelectTrigger className="w-full bg-white h-10 border-[#DDD8D0] focus:ring-[#B8960C]">
                  <SelectValue>
                    {selectedPriest
                      ? priests.find((p) => p.id === selectedPriest)?.name || "— Belum Ditugaskan —"
                      : "— Belum Ditugaskan —"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">— Belum Ditugaskan —</SelectItem>
                  {priests.map((p) => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                onClick={handleAssignPriest}
                disabled={loadingPriest || isCanceled}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#3D2B1F] text-white font-bold text-sm rounded-md hover:bg-[#2C1F14] transition-colors disabled:opacity-50"
              >
                <UserCheck size={15} />
                {loadingPriest ? "Menyimpan..." : "Simpan Penugasan"}
              </button>
            </div>
          )}
        </div>

        {/* Jadwal Pemberkatan */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden p-6">
          <h3 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-3 flex items-center gap-2">
            <CalendarDays size={14} /> Jadwal Pemberkatan
          </h3>
          {application.weddingDate && (
            <div className="mb-3 px-3 py-2 bg-[#FFF8E1] rounded-md border border-[#B8960C]/20">
              <p className="text-[10px] font-bold text-[#A89880] uppercase tracking-wider mb-0.5">Terjadwal</p>
              <p className="font-bold text-[#3D2B1F] text-sm">
                {new Date(application.weddingDate as string).toLocaleDateString("id-ID", {
                  weekday: "long", day: "numeric", month: "long", year: "numeric",
                })}
                {(application.weddingDate as string).includes("T") && (
                  <span className="text-[#B8960C] ml-1">
                    · {(application.weddingDate as string).substring(11, 16)} WIB
                  </span>
                )}
              </p>
            </div>
          )}
          <div className="space-y-2">
            <div>
              <label className="block text-[10px] font-bold text-[#6B6560] uppercase tracking-wider mb-1">Tanggal</label>
              <Popover>
                <PopoverTrigger
                  disabled={isCanceled}
                  className={cn(
                    "flex items-center w-full justify-start text-left font-normal bg-white border border-[#DDD8D0] h-10 px-3 rounded-md text-sm outline-none focus:border-[#B8960C]",
                    !dateObj && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateObj ? format(dateObj, "PPP", { locale: localeId }) : <span>Pilih Tanggal</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-50" align="start">
                  <Calendar
                    mode="single"
                    selected={dateObj}
                    onSelect={setDateObj}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-[#6B6560] uppercase tracking-wider mb-1">Jam (opsional)</label>
              <input
                type="time"
                value={ceremonyTime}
                onChange={(e) => setCeremonyTime(e.target.value)}
                disabled={isCanceled}
                className="w-full h-10 px-3 border border-[#DDD8D0] rounded-md text-sm focus:border-[#B8960C] outline-none disabled:opacity-50 bg-white"
              />
            </div>
            <button
              onClick={handleSetCeremony}
              disabled={loadingCeremony || !ceremonyDate || isCanceled}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-[#2D6A4F] text-white font-bold text-sm rounded-md hover:bg-[#1D4A35] transition-colors disabled:opacity-50"
            >
              <CalendarDays size={15} />
              {loadingCeremony ? "Menyimpan..." : "Simpan Jadwal"}
            </button>
          </div>
        </div>

        {/* Kirim Catatan */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden p-6">
          <h3 className="text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-4">Kirim Catatan ke Dasbor Pasangan</h3>
          <textarea 
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={loading}
            placeholder="Ketik pesan..."
            className="w-full h-24 p-3 border border-[#DDD8D0] rounded-md text-sm mb-3 focus:border-[#B8960C] focus:ring-1 focus:ring-[#B8960C] outline-none resize-none"
          />
          <button 
            disabled={loading || !note.trim()}
            onClick={handleSendNote}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white border-2 border-[#B8960C] text-[#B8960C] font-bold rounded-md hover:bg-[#FFF8E1] transition-colors disabled:opacity-50"
          >
            <Send size={16} />
            Kirim Catatan
          </button>
        </div>

        {/* Riwayat */}
        <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
          <div className="bg-[#FAF7F2] px-5 py-3 border-b border-[#EDE8DF]">
            <h3 className="font-bold text-[#3D2B1F] uppercase tracking-wide text-xs">Riwayat Pendaftaran</h3>
          </div>
          <div className="p-5 max-h-[300px] overflow-y-auto">
            <div className="space-y-4">
              {history.map((h, i) => (
                <div key={i} className="pb-4 border-b border-[#EDE8DF] last:border-0 last:pb-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-[10px] font-bold text-[#B8960C] uppercase tracking-wider">
                      Tahap {h.stageNumber}
                    </span>
                    <span className="text-[10px] text-[#A89880]">
                      {h.changedAt ? new Date(h.changedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }) : '-'}
                    </span>
                  </div>
                  <p className="text-xs text-[#3D2B1F]">{h.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FDECEA] px-6 py-4 border-b border-[#C0392B]/20 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#C0392B]/10 flex items-center justify-center">
                  <Trash2 size={16} className="text-[#C0392B]" />
                </div>
                <h3 className="font-bold text-[#C0392B]">Konfirmasi Pembatalan</h3>
              </div>
              <button 
                onClick={() => setShowCancelModal(false)}
                disabled={loading}
                className="text-[#9C8B7A] hover:text-[#3D2B1F] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[#3D2B1F] text-sm mb-4">
                Tindakan ini akan menghentikan proses pendaftaran pernikahan pasangan ini secara permanen. Pengantin akan menerima notifikasi di dasbor mereka.
              </p>
              <label className="block mb-2 text-xs font-bold text-[#6B6560] uppercase tracking-wider">Alasan Pembatalan (Wajib)</label>
              <textarea 
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Misal: Mempelai mengundurkan diri secara sepihak..."
                className="w-full h-24 p-3 border border-[#DDD8D0] rounded-md text-sm mb-6 focus:border-[#C0392B] focus:ring-1 focus:ring-[#C0392B] outline-none resize-none"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  disabled={loading}
                  className="px-4 py-2 bg-white border border-[#DDD8D0] text-[#6B6560] font-bold rounded-md hover:bg-[#FAF7F2] transition-colors"
                >
                  Kembali
                </button>
                <button 
                  onClick={handleCancelApplication}
                  disabled={loading || !cancelReason.trim()}
                  className="px-4 py-2 bg-[#C0392B] text-white font-bold rounded-md hover:bg-[#A93226] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                  {loading ? "Memproses..." : "Ya, Batalkan Pendaftaran"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Advance Stage Modal */}
      {showAdvanceModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FFF8E1] px-6 py-4 border-b border-[#F0E6D2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B8960C]/10 flex items-center justify-center">
                  <ArrowUpCircle size={16} className="text-[#B8960C]" />
                </div>
                <h3 className="font-bold text-[#3D2B1F]">Konfirmasi Naikkan Tahap</h3>
              </div>
              <button 
                onClick={() => setShowAdvanceModal(false)}
                disabled={advanceLoading}
                className="text-[#9C8B7A] hover:text-[#3D2B1F] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[#3D2B1F] text-sm mb-2">
                Yakin ingin menaikkan tahap dari <strong>Tahap {application.currentStage} ({STAGE_NAMES[(application.currentStage as number) - 1]})</strong> ke <strong>Tahap {Math.min(5, (application.currentStage as number) + 1)} ({STAGE_NAMES[Math.min(4, (application.currentStage as number))]})</strong>?
              </p>
              <p className="text-[#6B6560] text-sm mb-6">
                Pasangan akan menerima notifikasi mengenai perubahan tahap ini di dasbor mereka.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowAdvanceModal(false)}
                  disabled={advanceLoading}
                  className="px-4 py-2 bg-white border border-[#DDD8D0] text-[#6B6560] font-bold rounded-md hover:bg-[#FAF7F2] transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleAdvanceStage}
                  disabled={advanceLoading}
                  className="px-4 py-2 bg-[#B8960C] text-white font-bold rounded-md hover:bg-[#9A7A00] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {advanceLoading ? <Loader2 size={15} className="animate-spin" /> : <ArrowUpCircle size={15} />}
                  {advanceLoading ? "Memproses..." : "Ya, Naikkan Tahap"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Rollback Stage Modal */}
      {showRollbackModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FAF7F2] px-6 py-4 border-b border-[#EDE8DF] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#3D2B1F]/10 flex items-center justify-center">
                  <ArrowDownCircle size={16} className="text-[#3D2B1F]" />
                </div>
                <h3 className="font-bold text-[#3D2B1F]">Konfirmasi Kembalikan Tahap</h3>
              </div>
              <button 
                onClick={() => setShowRollbackModal(false)}
                disabled={rollbackLoading}
                className="text-[#9C8B7A] hover:text-[#3D2B1F] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[#3D2B1F] text-sm mb-4">
                Anda akan mengembalikan pendaftaran ini dari <strong>Tahap {application.currentStage}</strong> ke <strong>Tahap {(application.currentStage as number) - 1} ({STAGE_NAMES[(application.currentStage as number) - 2]})</strong>.
              </p>
              <label className="block mb-2 text-xs font-bold text-[#6B6560] uppercase tracking-wider">Alasan Pengembalian (Wajib)</label>
              <textarea 
                value={rollbackReason}
                onChange={(e) => setRollbackReason(e.target.value)}
                placeholder="Misal: Dokumen baptis belum lengkap..."
                className="w-full h-24 p-3 border border-[#DDD8D0] rounded-md text-sm mb-6 focus:border-[#3D2B1F] focus:ring-1 focus:ring-[#3D2B1F] outline-none resize-none"
                autoFocus
              />
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowRollbackModal(false)}
                  disabled={rollbackLoading}
                  className="px-4 py-2 bg-white border border-[#DDD8D0] text-[#6B6560] font-bold rounded-md hover:bg-[#FAF7F2] transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleRollbackStage}
                  disabled={rollbackLoading || !rollbackReason.trim()}
                  className="px-4 py-2 bg-[#3D2B1F] text-white font-bold rounded-md hover:bg-[#2C1F14] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {rollbackLoading ? <Loader2 size={15} className="animate-spin" /> : <ArrowDownCircle size={15} />}
                  {rollbackLoading ? "Memproses..." : "Ya, Kembalikan Tahap"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Approve Reregistration Modal */}
      {showApproveReregModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-[#FFF8E1] px-6 py-4 border-b border-[#F0E6D2] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#B8960C]/10 flex items-center justify-center">
                  <AlertTriangle size={16} className="text-[#B8960C]" />
                </div>
                <h3 className="font-bold text-[#3D2B1F]">Konfirmasi Daftar Ulang</h3>
              </div>
              <button 
                onClick={() => setShowApproveReregModal(false)}
                disabled={approveReregLoading}
                className="text-[#9C8B7A] hover:text-[#3D2B1F] transition-colors"
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-[#3D2B1F] text-sm mb-2">
                Terima pengajuan daftar ulang untuk pasangan ini?
              </p>
              <p className="text-[#6B6560] text-sm mb-6">
                Tindakan ini akan mengarsipkan pendaftaran saat ini dan membuat <strong>formulir pendaftaran baru di Tahap 1</strong>. Pasangan akan mendapat notifikasi untuk melengkapi dokumen dari awal.
              </p>
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={() => setShowApproveReregModal(false)}
                  disabled={approveReregLoading}
                  className="px-4 py-2 bg-white border border-[#DDD8D0] text-[#6B6560] font-bold rounded-md hover:bg-[#FAF7F2] transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleApproveReregistration}
                  disabled={approveReregLoading}
                  className="px-4 py-2 bg-[#B8960C] text-white font-bold rounded-md hover:bg-[#9A7A00] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {approveReregLoading ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                  {approveReregLoading ? "Memproses..." : "Ya, Terima & Buat Baru"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ====== RIWAYAT PENDAFTARAN SEBELUMNYA ====== */}
      {previousApp && (
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl overflow-hidden">
          <div className="bg-blue-100 px-6 py-4 border-b border-blue-200 flex items-center gap-3">
            <History size={18} className="text-blue-700" />
            <h3 className="font-bold text-blue-800 uppercase tracking-wide text-sm">
              Riwayat Pendaftaran Sebelumnya
            </h3>
            <span className="ml-auto text-[10px] font-bold bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Daftar Ulang
            </span>
          </div>
          <div className="p-6">
            <p className="text-sm text-blue-700 mb-4">
              Pasangan ini pernah memiliki pendaftaran sebelumnya yang dibatalkan.
            </p>
            <div className="bg-white border border-blue-100 rounded-lg overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-blue-50 text-blue-600 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold">No. Registrasi Lama</th>
                    <th className="px-4 py-3 text-left font-semibold">Tgl. Daftar</th>
                    <th className="px-4 py-3 text-left font-semibold">Tgl. Dibatalkan</th>
                    <th className="px-4 py-3 text-left font-semibold">Alasan Pembatalan</th>
                    <th className="px-4 py-3 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-blue-50">
                    <td className="px-4 py-4 font-bold text-[#B8960C]">
                      {previousApp.regNum ?? "—"}
                    </td>
                    <td className="px-4 py-4 text-[#6B6560]">
                      {previousApp.createdAt
                        ? new Date(previousApp.createdAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-4 text-[#6B6560]">
                      {previousApp.canceledAt
                        ? new Date(previousApp.canceledAt).toLocaleDateString("id-ID", {
                            day: "numeric", month: "long", year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-4 text-[#3D2B1F] italic max-w-xs">
                      &ldquo;{previousApp.cancelReason ?? "Tidak ada keterangan"}&rdquo;
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex px-2 py-1 bg-[#FDECEA] text-[#C0392B] text-[10px] font-bold uppercase rounded-full border border-red-200">
                        DIBATALKAN
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
