"use client";

import { MapPin, CalendarDays, Star } from "lucide-react";

type MassItem = {
  id: string;
  title: string;
  category: string | null;
  body: string | null;
  location: string | null;
  eventDate: string | null;
};

type ScheduleRow = { label: string; time: string; subtitle?: string; key: string };

const ScheduleList = ({ rows }: { rows: ScheduleRow[] }) => (
  <ul className="space-y-6">
    {rows.length > 0 ? rows.map((g) => (
      <li key={g.key} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 group">
        <div className="flex flex-col">
          <span className="font-medium text-[#6B6560] group-hover:text-[#3D2B1F] transition-colors">{g.label}</span>
          {g.subtitle && <span className="text-xs text-[#9C8B7A]">{g.subtitle}</span>}
        </div>
        <span className="font-semibold text-[#B8960C] bg-[#FFF8E1] px-4 py-1.5 rounded-full text-sm w-fit whitespace-nowrap">
          {g.time}
        </span>
      </li>
    )) : (
      <li className="text-[#9C8B7A] italic text-sm">Belum ada jadwal.</li>
    )}
  </ul>
);

export default function JadwalMisaClient({ masses }: { masses: MassItem[] }) {
  const massesHarian = masses.filter(m => m.category?.endsWith("::Harian"));
  const massesKhusus = masses.filter(m => m.category?.endsWith("::Khusus"));

  // Extract day name from category prefix (could be "Senin" or a date string)
  const getDayName = (rawStr: string | null | undefined): string => {
    if (!rawStr) return "";
    const prefix = rawStr.split("::")[0];
    const dateObj = new Date(prefix);
    if (!isNaN(dateObj.getTime())) {
      return ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][dateObj.getDay()];
    }
    return prefix;
  };

  // Build per-mass row: { day, time, title }
  const harianRows = massesHarian.map(m => ({
    day: getDayName(m.category),
    time: m.eventDate || "",
    title: m.title,
  }));

  // --- Misa Harian (Senin–Jumat) ---
  const weekdays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"];
  const weekdayRows = harianRows.filter(r => weekdays.includes(r.day));

  // Group by time, collect days for each time
  const weekdayByTime = new Map<string, { days: string[]; titles: Set<string> }>();
  for (const r of weekdayRows) {
    const existing = weekdayByTime.get(r.time);
    if (existing) {
      if (!existing.days.includes(r.day)) existing.days.push(r.day);
      existing.titles.add(r.title);
    } else {
      weekdayByTime.set(r.time, { days: [r.day], titles: new Set([r.title]) });
    }
  }

  const harianSchedule: ScheduleRow[] = [];
  for (const [time, { days, titles }] of weekdayByTime) {
    // Sort days by weekday order
    days.sort((a, b) => weekdays.indexOf(a) - weekdays.indexOf(b));
    let label: string;
    if (days.length === 5) {
      label = "Senin – Jumat";
    } else if (days.length > 1) {
      label = days.join(", ");
    } else {
      label = days[0];
    }
    // If titles are not all generic "Misa Harian", show the specific one
    const titleArr = Array.from(titles).filter(t => t !== "Misa Harian");
    const subtitle = titleArr.length > 0 ? titleArr.join(", ") : undefined;
    harianSchedule.push({ label, time: `${time} WIB`, subtitle, key: `h-${time}-${label}` });
  }

  // --- Misa Mingguan (Sabtu & Minggu) ---
  const weekendRows = harianRows.filter(r => ["Sabtu", "Minggu"].includes(r.day));
  const mingguanSchedule: ScheduleRow[] = [];

  // Sabtu
  const sabtuMasses = weekendRows.filter(r => r.day === "Sabtu");
  if (sabtuMasses.length > 0) {
    const time = sabtuMasses.map(r => r.time).join(" & ");
    mingguanSchedule.push({ label: "Sabtu", time: `${time} WIB`, key: "sabtu" });
  }

  // Minggu — split pagi/sore
  const mingguMasses = weekendRows.filter(r => r.day === "Minggu");
  if (mingguMasses.length > 0) {
    const pagi = mingguMasses.filter(r => {
      const h = parseInt(r.time.split(/[:.]/)[0]);
      return h < 12;
    });
    const sore = mingguMasses.filter(r => {
      const h = parseInt(r.time.split(/[:.]/)[0]);
      return h >= 12;
    });

    if (pagi.length > 0) {
      mingguanSchedule.push({
        label: "Minggu Pagi",
        time: `${pagi.map(r => r.time).join(" & ")} WIB`,
        key: "minggu-pagi",
      });
    }
    if (sore.length > 0) {
      mingguanSchedule.push({
        label: "Minggu Sore",
        time: `${sore.map(r => r.time).join(" & ")} WIB`,
        key: "minggu-sore",
      });
    }
    if (pagi.length === 0 && sore.length === 0) {
      mingguanSchedule.push({
        label: "Minggu",
        time: `${mingguMasses.map(r => r.time).join(" & ")} WIB`,
        key: "minggu",
      });
    }
  }



  return (
    <div className="space-y-12">

      {/* ═══════════════ JADWAL REGULER ═══════════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 bg-white rounded-2xl shadow-sm border border-[#EDE8DF] overflow-hidden">

        {/* Misa Harian */}
        <div className="p-8 md:p-12 border-b md:border-b-0 md:border-r border-[#EDE8DF] relative">
          <div className="absolute top-0 left-0 w-1 h-full bg-[#B8960C]/20" />
          <h3 className="text-2xl md:text-3xl text-[#3D2B1F] mb-8 font-bold" style={{ fontFamily: "var(--font-cormorant)" }}>
            Misa Harian
          </h3>
          <ScheduleList rows={harianSchedule} />
        </div>

        {/* Misa Mingguan */}
        <div className="p-8 md:p-12 relative">
          <div className="absolute top-0 right-0 w-1 h-full bg-[#B8960C]" />
          <h3 className="text-2xl md:text-3xl text-[#3D2B1F] mb-8 font-bold" style={{ fontFamily: "var(--font-cormorant)" }}>
            Misa Mingguan
          </h3>
          <ScheduleList rows={mingguanSchedule} />
        </div>
      </div>

      {/* ═══════════════ MISA KHUSUS ═══════════════ */}
      {massesKhusus.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#FDF3D0" }}>
              <Star size={16} style={{ color: "#B8960C" }} />
            </div>
            <h3 className="text-2xl font-bold text-[#3D2B1F]" style={{ fontFamily: "var(--font-cormorant)" }}>
              Misa Khusus
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {massesKhusus.map((m) => {
              const prefix = m.category?.split("::")[0] || "";
              const dateObj = new Date(prefix);
              const dateStr = !isNaN(dateObj.getTime())
                ? dateObj.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
                : null;

              return (
                <div key={m.id} className="bg-white rounded-xl p-6 border-2 border-[#B8960C]/20 shadow-sm hover:border-[#B8960C]/50 hover:shadow-md transition-all duration-300 group">
                  {dateStr && (
                    <p className="text-xs font-bold text-[#B8960C] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <CalendarDays size={12} /> {dateStr}
                    </p>
                  )}
                  <div className="flex items-baseline gap-3 mb-3">
                    <span className="text-3xl font-bold text-[#3D2B1F] shrink-0" style={{ fontFamily: "var(--font-cormorant)" }}>
                      {m.eventDate || "--:--"}
                    </span>
                    <span className="text-xs text-[#9C8B7A] font-semibold">WIB</span>
                  </div>
                  <h4 className="font-bold text-[15px] text-[#3D2B1F] mb-1.5 group-hover:text-[#B8960C] transition-colors">
                    {m.title}
                  </h4>
                  {m.body && (
                    <p className="text-xs text-[#6B5744] mb-3 line-clamp-2">{m.body}</p>
                  )}
                  {m.location && (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#9C8B7A]">
                      <MapPin size={12} className="text-[#B8960C]" /> {m.location}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
