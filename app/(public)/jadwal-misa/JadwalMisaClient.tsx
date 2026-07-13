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
      <li key={g.key} className="flex flex-row justify-between items-center w-full gap-4 group">
        <div className="flex flex-col">
          <span className="font-medium text-[#6B6560] group-hover:text-[#3D2B1F] transition-colors">{g.label}</span>
          {g.subtitle && <span className="text-xs text-[#9C8B7A]">{g.subtitle}</span>}
        </div>
        <span className="font-semibold text-[#B8960C] bg-[#FFF8E1] px-4 py-1.5 rounded-full text-sm whitespace-nowrap">
          {g.time}
        </span>
      </li>
    )) : (
      <li className="text-[#9C8B7A] italic text-sm">Belum ada jadwal.</li>
    )}
  </ul>
);

export default function JadwalMisaClient({ masses }: { masses: MassItem[] }) {
  const getDayName = (rawStr: string | null | undefined): string => {
    if (!rawStr) return "";
    const prefix = rawStr.split("::")[0];
    const dateObj = new Date(prefix);
    if (!isNaN(dateObj.getTime())) {
      return ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"][dateObj.getDay()];
    }
    return prefix;
  };

  // --- MISA KHUSUS ---
  const massesKhusus = masses.filter(m => 
    m.category?.endsWith("::Misa Khusus") || m.category?.endsWith("::Khusus")
  );

  // --- MISA HARIAN (Senin–Jumat) ---
  const rawHarian = masses.filter(m => 
    m.category?.endsWith("::Misa Harian") || 
    (m.category?.endsWith("::Harian") && !["Sabtu", "Minggu"].includes(getDayName(m.category)))
  );

  const harianRows = rawHarian.map(m => {
    let day = getDayName(m.category);
    let isFromTitle = false;
    if (!day) {
      day = m.title || "Setiap Hari";
      isFromTitle = true;
    }
    return {
      day,
      time: m.eventDate || "",
      title: isFromTitle ? "" : (m.title || ""),
    };
  });

  const harianByTime = new Map<string, { days: string[]; titles: Set<string> }>();
  for (const r of harianRows) {
    const existing = harianByTime.get(r.time);
    if (existing) {
      if (!existing.days.includes(r.day)) existing.days.push(r.day);
      if (r.title) existing.titles.add(r.title);
    } else {
      harianByTime.set(r.time, { days: [r.day], titles: new Set(r.title ? [r.title] : []) });
    }
  }

  const harianSchedule: ScheduleRow[] = [];
  const weekdays = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu", "Minggu"];
  for (const [time, { days, titles }] of harianByTime) {
    days.sort((a, b) => {
      const idxA = weekdays.indexOf(a);
      const idxB = weekdays.indexOf(b);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      return 0;
    });

    let label = days.join(", ");
    if (days.length === 5 && days.every(d => ["Senin", "Selasa", "Rabu", "Kamis", "Jumat"].includes(d))) {
      label = "Senin – Jumat";
    }

    const titleArr = Array.from(titles).filter(t => t !== "Misa Harian" && t !== "Misa Harian / Umum" && t !== label);
    const subtitle = titleArr.length > 0 ? titleArr.join(", ") : undefined;

    harianSchedule.push({ label, time: `${time} WIB`, subtitle, key: `h-${time}-${label}` });
  }

  // --- MISA MINGGUAN (Sabtu & Minggu) ---
  const rawMingguan = masses.filter(m => 
    m.category?.endsWith("::Misa Mingguan") || 
    (m.category?.endsWith("::Harian") && ["Sabtu", "Minggu"].includes(getDayName(m.category)))
  );

  const mingguanRows = rawMingguan.map(m => {
    let day = getDayName(m.category);
    let isFromTitle = false;
    if (!day) {
      day = m.title || "Minggu";
      isFromTitle = true;
    }
    return {
      day,
      time: m.eventDate || "",
      title: isFromTitle ? "" : (m.title || ""),
    };
  });

  const mingguanByLabel = new Map<string, { times: string[]; titles: Set<string> }>();
  for (const r of mingguanRows) {
    let label = r.day;
    if (label === "Minggu") {
      const h = parseInt(r.time.split(/[:.]/)[0]);
      if (!isNaN(h)) {
        if (h < 12) label = "Minggu Pagi";
        else label = "Minggu Sore";
      }
    }

    const existing = mingguanByLabel.get(label);
    if (existing) {
      if (!existing.times.includes(r.time)) existing.times.push(r.time);
      if (r.title) existing.titles.add(r.title);
    } else {
      mingguanByLabel.set(label, { times: [r.time], titles: new Set(r.title ? [r.title] : []) });
    }
  }

  const mingguanSchedule: ScheduleRow[] = [];
  for (const [label, { times, titles }] of mingguanByLabel) {
    times.sort();
    const timeStr = times.join(" & ");
    const titleArr = Array.from(titles).filter(t => t !== "Misa Mingguan" && t !== "Misa Harian / Umum" && t !== label);
    const subtitle = titleArr.length > 0 ? titleArr.join(", ") : undefined;

    mingguanSchedule.push({ label, time: `${timeStr} WIB`, subtitle, key: `m-${label}` });
  }

  mingguanSchedule.sort((a, b) => {
    const order = ["Sabtu", "Minggu Pagi", "Minggu", "Minggu Sore"];
    let idxA = order.findIndex(o => a.label.includes(o));
    let idxB = order.findIndex(o => b.label.includes(o));
    if (idxA === -1) idxA = 99;
    if (idxB === -1) idxB = 99;
    return idxA - idxB;
  });

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