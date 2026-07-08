import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  coupleProfiles, 
  marriageApplications
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import PernikahanTableClient from "./PernikahanTableClient";

export default async function AdminPernikahanPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") return null;

  const allApps = await db.select({
    id: marriageApplications.id,
    currentStage: marriageApplications.currentStage,
    weddingDate: marriageApplications.weddingDate,
    regNum: coupleProfiles.registrationNumber,
    groom: coupleProfiles.groomName,
    bride: coupleProfiles.brideName,
    createdAt: marriageApplications.createdAt,
    isReregistration: marriageApplications.isReregistration,
  })
  .from(marriageApplications)
  .leftJoin(coupleProfiles, eq(marriageApplications.coupleProfileId, coupleProfiles.id))
  .orderBy(desc(marriageApplications.createdAt));

  // Serialize dates to strings for client component
  const serialized = allApps.map((a) => ({
    ...a,
    weddingDate: a.weddingDate ? String(a.weddingDate) : null,
    createdAt: a.createdAt ? a.createdAt.toISOString() : null,
    isReregistration: a.isReregistration ?? false,
  }));

  return (
    <div className="space-y-4 max-w-7xl mx-auto page-fade">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 mb-4">
        <div>
          <p className="section-label mb-2">Panel Admin</p>
          <h1 className="text-[32px] font-bold leading-tight" style={{ fontFamily: "var(--font-cormorant)", color: "#2C1F14" }}>
            Data Pernikahan
          </h1>
          <p className="text-[14px] mt-1" style={{ color: "#9C8B7A" }}>Kelola seluruh data pendaftaran calon pengantin.</p>
        </div>
      </div>

      <PernikahanTableClient apps={serialized} />
    </div>
  );
}
