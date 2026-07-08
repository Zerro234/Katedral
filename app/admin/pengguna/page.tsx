import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { desc } from "drizzle-orm";
import { Users, ShieldCheck, UserCheck, UserX } from "lucide-react";

const ROLE_LABEL: Record<string, { label: string; color: string; bg: string }> = {
  ADMIN:  { label: "Admin",           color: "#B8960C", bg: "#FFF8E1" },
  COUPLE: { label: "Calon Pengantin", color: "#2471A3", bg: "#EBF5FB" },
  PRIEST: { label: "Imam / Romo",     color: "#2D6A4F", bg: "#D8F3DC" },
};

export default async function AdminPenggunaPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session || session.user.role !== "ADMIN") return null;

  const allUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(desc(users.createdAt));

  const totalCouple = allUsers.filter((u) => u.role === "COUPLE").length;
  const totalAdmin  = allUsers.filter((u) => u.role === "ADMIN").length;
  const totalPriest = allUsers.filter((u) => u.role === "PRIEST").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-6">
        <h1
          className="text-3xl font-bold text-[#3D2B1F] mb-1"
          style={{ fontFamily: "var(--font-cormorant)" }}
        >
          Kelola Pengguna
        </h1>
        <p className="text-[#6B6560] text-sm">
          Daftar seluruh akun yang terdaftar di sistem.
        </p>
      </div>

      {/* Summary KPI */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#DDD8D0] shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#EBF5FB] flex items-center justify-center flex-shrink-0">
            <Users size={20} className="text-[#2471A3]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-0.5">Calon Pengantin</p>
            <p className="text-2xl font-bold text-[#3D2B1F]">{totalCouple}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#DDD8D0] shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#FFF8E1] flex items-center justify-center flex-shrink-0">
            <ShieldCheck size={20} className="text-[#B8960C]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-0.5">Admin</p>
            <p className="text-2xl font-bold text-[#3D2B1F]">{totalAdmin}</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-[#DDD8D0] shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-full bg-[#D8F3DC] flex items-center justify-center flex-shrink-0">
            <UserCheck size={20} className="text-[#2D6A4F]" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#6B6560] uppercase tracking-wider mb-0.5">Imam / Romo</p>
            <p className="text-2xl font-bold text-[#3D2B1F]">{totalPriest}</p>
          </div>
        </div>
      </div>

      {/* User Table */}
      <div className="bg-white rounded-xl border border-[#DDD8D0] shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-[#EDE8DF] bg-[#FAF7F2] flex items-center justify-between">
          <h2 className="font-bold text-[#3D2B1F] text-sm uppercase tracking-wide">
            Semua Pengguna ({allUsers.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-[#F5F0E8] text-[#6B6560] text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 font-semibold">Pengguna</th>
                <th className="px-6 py-3 font-semibold">Role</th>
                <th className="px-6 py-3 font-semibold">Status Email</th>
                <th className="px-6 py-3 font-semibold">Tanggal Daftar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EDE8DF]">
              {allUsers.map((user) => {
                const roleInfo = ROLE_LABEL[user.role ?? "COUPLE"] ?? ROLE_LABEL.COUPLE;
                const initials = user.name
                  ? user.name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
                  : "?";
                const joinDate = user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("id-ID", {
                      day: "numeric", month: "long", year: "numeric",
                    })
                  : "—";

                return (
                  <tr key={user.id} className="hover:bg-[#FAF7F2] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs flex-shrink-0"
                          style={{ background: roleInfo.color }}
                        >
                          {initials}
                        </div>
                        <div>
                          <p className="font-semibold text-[#3D2B1F]">{user.name}</p>
                          <p className="text-xs text-[#A89880]">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: roleInfo.bg, color: roleInfo.color }}
                      >
                        {roleInfo.label}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.emailVerified ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2D6A4F] bg-[#D8F3DC] px-2 py-1 rounded-full">
                          <UserCheck size={11} /> Terverifikasi
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#C0392B] bg-[#FDECEA] px-2 py-1 rounded-full">
                          <UserX size={11} /> Belum Verifikasi
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-[#6B6560] text-xs">{joinDate}</td>
                  </tr>
                );
              })}
              {allUsers.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-[#A89880]">
                    Belum ada pengguna terdaftar.
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
