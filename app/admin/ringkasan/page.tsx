import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  coupleProfiles,
  marriageApplications,
  stageHistory,
  requiredDocuments,
  users,
} from "@/lib/db/schema";
import { desc, eq, and, inArray } from "drizzle-orm";
import { Users, AlertCircle, CalendarHeart, FileCheck, ArrowRight, ChevronRight } from "lucide-react";
import Link from "next/link";
import ActivityListClient from "./ActivityListClient";

const STAGE_NAMES = ["Profil", "KPP", "Dokumen", "Kanonik", "Selesai"];

const STAGE_BADGE: Record<number, { label: string; bg: string; color: string; border: string }> = {
  1: { label: "Tahap 1: Profil",   bg: "#EAF0FA", color: "#2E4E85",  border: "#A8BEDE" },
  2: { label: "Tahap 2: KPP",      bg: "#FDF3D0", color: "#9A7A0A",  border: "#E8D070" },
  3: { label: "Tahap 3: Dokumen",  bg: "#FDF3D0", color: "#9A7A0A",  border: "#E8D070" },
  4: { label: "Tahap 4: Kanonik",  bg: "#F0EAF8", color: "#6A3D96",  border: "#C8A8DE" },
  5: { label: "Tahap 5: Selesai",  bg: "#EAF4ED", color: "#2E6B41",  border: "#A8D5B4" },
  98: { label: "Daftar Ulang",     bg: "#FFF8E1", color: "#B8960C",  border: "#E8D070" },
};

export default async function AdminRingkasanPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return null;

  const allApps = await db
    .select({
      id: marriageApplications.id,
      currentStage: marriageApplications.currentStage,
      weddingDate: marriageApplications.weddingDate,
      regNum: coupleProfiles.registrationNumber,
      groom: coupleProfiles.groomName,
      bride: coupleProfiles.brideName,
      createdAt: marriageApplications.createdAt,
    })
    .from(marriageApplications)
    .leftJoin(coupleProfiles, eq(marriageApplications.coupleProfileId, coupleProfiles.id))
    .orderBy(desc(marriageApplications.createdAt));

  const activeApps = allApps.filter((a) => a.currentStage !== 99);
  const totalAktif = activeApps.length;
  const menungguTindakan = activeApps.filter((a) => a.currentStage === 1).length;

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const pemberkatanBulanIni = allApps.filter((a) => {
    if (!a.weddingDate) return false;
    const date = new Date(a.weddingDate);
    return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
  }).length;

  let perluVerifikasi = 0;
  if (activeApps.length > 0) {
    const activeIds = activeApps.map((a) => a.id);
    const pendingDocs = await db
      .select({ applicationId: requiredDocuments.applicationId })
      .from(requiredDocuments)
      .where(and(inArray(requiredDocuments.applicationId, activeIds), eq(requiredDocuments.isReceived, false)));
    perluVerifikasi = new Set(pendingDocs.map((d) => d.applicationId)).size;
  }

  const recentHistory = await db
    .select({
      id: stageHistory.id,
      stage: stageHistory.stageNumber,
      note: stageHistory.note,
      createdAt: stageHistory.changedAt,
      userName: users.name,
    })
    .from(stageHistory)
    .leftJoin(users, eq(stageHistory.changedBy, users.id))
    .orderBy(desc(stageHistory.changedAt))
    .limit(100);

  const todayStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const kpis = [
    {
      label: "Total Pendaftar",
      value: totalAktif,
      icon: Users,
      iconBg: "#F5F0E8",
      iconColor: "#2C1F14",
      valuColor: "#2C1F14",
    },
    {
      label: "Baru / Tahap 1",
      value: menungguTindakan,
      icon: AlertCircle,
      iconBg: "#FDF3D0",
      iconColor: "#B8960C",
      valuColor: "#B8960C",
    },
    {
      label: "Pemberkatan Bulan Ini",
      value: pemberkatanBulanIni,
      icon: CalendarHeart,
      iconBg: "#EAF0FA",
      iconColor: "#4A6FA5",
      valuColor: "#4A6FA5",
    },
    {
      label: "Perlu Verifikasi",
      value: perluVerifikasi,
      icon: FileCheck,
      iconBg: "#EAF4ED",
      iconColor: "#4A7C59",
      valuColor: "#4A7C59",
    },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-fade">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-6">
        <div>
          <p className="section-label mb-2">Panel Admin</p>
          <h1
            className="text-[32px] font-bold leading-tight"
            style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}
          >
            Ringkasan Pendaftaran
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "#9C8B7A" }}>
            {todayStr}
          </p>
        </div>
        <Link
          href="/admin/pernikahan"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold text-white transition-all hover:opacity-90"
          style={{ background: "#B8960C" }}
        >
          Lihat Semua Data <ArrowRight size={15} />
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="card-sacred p-5 flex items-center gap-4"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: kpi.iconBg }}
              >
                <Icon size={22} style={{ color: kpi.iconColor }} />
              </div>
              <div>
                <p
                  className="text-[11px] font-bold uppercase tracking-wider mb-1.5"
                  style={{ color: "#9C8B7A" }}
                >
                  {kpi.label}
                </p>
                <p
                  className="text-[28px] font-bold leading-none"
                  style={{ fontFamily: "var(--font-cormorant)", color: kpi.valuColor }}
                >
                  {kpi.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Main Content: Table + Timeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 pt-2">

        {/* Pendaftaran Terbaru Table */}
        <div className="lg:col-span-2">
          <div className="card-sacred overflow-hidden">
            <div
              className="px-5 py-4 flex justify-between items-center"
              style={{ borderBottom: "1px solid #E8E0D0", background: "#FDFBF8" }}
            >
              <h3
                className="font-bold text-[15px]"
                style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}
              >
                Pendaftaran Terbaru
              </h3>
              <Link
                href="/admin/pernikahan"
                className="text-[12px] font-bold flex items-center gap-0.5 hover:underline"
                style={{ color: "#B8960C" }}
              >
                Lihat Semua <ChevronRight size={13} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] whitespace-nowrap">
                <thead>
                  <tr style={{ background: "#F5F0E8" }}>
                    <th
                      className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider"
                      style={{ color: "#9C8B7A" }}
                    >
                      Pasangan
                    </th>
                    <th
                      className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider"
                      style={{ color: "#9C8B7A" }}
                    >
                      Tahap
                    </th>
                    <th
                      className="px-5 py-3 font-semibold text-[11px] uppercase tracking-wider"
                      style={{ color: "#9C8B7A" }}
                    >
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {allApps.slice(0, 5).map((app) => {
                    const badge = app.currentStage === 99
                      ? { label: "Dibatalkan", bg: "#FAEDED", color: "#7A2A2A", border: "#E8AAAA" }
                      : STAGE_BADGE[app.currentStage ?? 1] ?? STAGE_BADGE[1];
                    return (
                      <tr
                        key={app.id}
                        className="border-t transition-colors hover:bg-[#FDFBF8]"
                        style={{ borderColor: "#F0EBE3" }}
                      >
                        <td className="px-5 py-3.5">
                          <p
                            className="font-bold text-[12px] mb-0.5"
                            style={{ color: "#B8960C", fontFamily: "var(--font-geist-mono)" }}
                          >
                            {app.regNum || "—"}
                          </p>
                          <p className="font-medium" style={{ color: "#2C1F14" }}>
                            {app.groom?.split(" ")[0]} &amp; {app.bride?.split(" ")[0]}
                          </p>
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className="inline-flex px-2.5 py-1 text-[10px] font-bold uppercase rounded-full"
                            style={{ background: badge.bg, color: badge.color, border: `1px solid ${badge.border}` }}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <Link
                            href={`/admin/pernikahan/${app.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-[12px] font-semibold border transition-all hover:bg-[#FDF3D0]"
                            style={{ color: "#B8960C", borderColor: "#E8D070" }}
                          >
                            Detail <ArrowRight size={11} />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                  {allApps.length === 0 && (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-10 text-center text-[13px]"
                        style={{ color: "#9C8B7A" }}
                      >
                        Belum ada data pendaftaran.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Aktivitas Timeline */}
        <div>
          <ActivityListClient history={recentHistory} />
        </div>
      </div>
    </div>
  );
}
