import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  coupleProfiles, 
  marriageApplications,
  requiredDocuments,
  stageHistory,
  users
} from "@/lib/db/schema";
import { desc, eq } from "drizzle-orm";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import DetailClient from "./DetailClient";

export default async function AdminPernikahanDetailPage({ params }: { params: { id: string } }) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session || session.user.role !== "ADMIN") return null;

  const { id } = await params;

  // Fetch application
  const appRecord = await db.select({
    id: marriageApplications.id,
    currentStage: marriageApplications.currentStage,
    weddingDate: marriageApplications.weddingDate,
    priestId: marriageApplications.priestId,
    isReregistration: marriageApplications.isReregistration,
    previousApplicationId: marriageApplications.previousApplicationId,
    regNum: coupleProfiles.registrationNumber,
    // Calon Suami
    groomName: coupleProfiles.groomName,
    groomBirthdate: coupleProfiles.groomBirthdate,
    groomPhone: coupleProfiles.groomPhone,
    groomBaptismChurch: coupleProfiles.groomBaptismChurch,
    groomReligion: coupleProfiles.groomReligion,
    groomOccupation: coupleProfiles.groomOccupation,
    groomFatherName: coupleProfiles.groomFatherName,
    groomMotherName: coupleProfiles.groomMotherName,
    groomPhoto: coupleProfiles.groomPhoto,
    // Calon Isteri
    brideName: coupleProfiles.brideName,
    brideBirthdate: coupleProfiles.brideBirthdate,
    bridePhone: coupleProfiles.bridePhone,
    brideBaptismChurch: coupleProfiles.brideBaptismChurch,
    brideReligion: coupleProfiles.brideReligion,
    brideOccupation: coupleProfiles.brideOccupation,
    brideFatherName: coupleProfiles.brideFatherName,
    brideMotherName: coupleProfiles.brideMotherName,
    bridePhoto: coupleProfiles.bridePhoto,
    // Informasi Perkawinan
    postMarriageAddress: coupleProfiles.postMarriageAddress,
    ceremonyType: coupleProfiles.ceremonyType,
    preferredWeddingDate: coupleProfiles.preferredWeddingDate,
    preferredWeddingTime: coupleProfiles.preferredWeddingTime,
    // Foto
    couplePhoto: coupleProfiles.couplePhoto,
  })
  .from(marriageApplications)
  .leftJoin(coupleProfiles, eq(marriageApplications.coupleProfileId, coupleProfiles.id))
  .where(eq(marriageApplications.id, id))
  .limit(1);

  if (appRecord.length === 0) {
    return <div>Data tidak ditemukan.</div>;
  }

  const application = appRecord[0];

  // Fetch docs
  const docs = await db.select().from(requiredDocuments)
    .where(eq(requiredDocuments.applicationId, id));

  // Fetch history
  const history = await db.select().from(stageHistory)
    .where(eq(stageHistory.applicationId, id))
    .orderBy(desc(stageHistory.changedAt));

  // Fetch priests for assignment dropdown
  const priests = await db
    .select({ id: users.id, name: users.name, email: users.email })
    .from(users)
    .where(eq(users.role, "PRIEST"));

  // Fetch previous application data (if daftar ulang)
  let previousApp: {
    regNum: string | null;
    createdAt: Date | null;
    canceledAt: Date | null;
    cancelReason: string | null;
  } | null = null;

  if (application.isReregistration && application.previousApplicationId) {
    const prevAppRecord = await db.select({
      regNum: coupleProfiles.registrationNumber,
      createdAt: marriageApplications.createdAt,
    })
    .from(marriageApplications)
    .leftJoin(coupleProfiles, eq(marriageApplications.coupleProfileId, coupleProfiles.id))
    .where(eq(marriageApplications.id, application.previousApplicationId))
    .limit(1);

    if (prevAppRecord[0]) {
      // Fetch cancellation entry from stage_history (stage = 99)
      const cancelHistory = await db.select()
        .from(stageHistory)
        .where(eq(stageHistory.applicationId, application.previousApplicationId))
        .orderBy(desc(stageHistory.changedAt))
        .limit(1);
      
      const cancelEntry = cancelHistory.find(h => h.stageNumber === 99) ?? cancelHistory[0];
      previousApp = {
        regNum: prevAppRecord[0].regNum ?? null,
        createdAt: prevAppRecord[0].createdAt ?? null,
        canceledAt: cancelEntry?.changedAt ?? null,
        cancelReason: cancelEntry?.note ?? null,
      };
    }
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Header & Breadcrumb */}
      <div className="mb-6 border-b border-[#DDD8D0] pb-6">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/admin/pernikahan" className="flex items-center gap-1.5 px-3 py-1.5 border border-[#DDD8D0] rounded-full text-xs font-semibold text-[#6B6560] hover:bg-[#FAF7F2] transition-colors">
            <ArrowLeft size={14} /> Kembali
          </Link>
          <span className="text-xs text-[#A89880] uppercase tracking-wider font-semibold">
            Ringkasan / Daftar Pernikahan / Detail
          </span>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#3D2B1F] mb-2" style={{ fontFamily: "var(--font-cormorant)" }}>
              {application.regNum} · {application.groomName?.split(" ")[0]} & {application.brideName?.split(" ")[0]}
            </h1>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center px-3 py-1 bg-[#FFF8E1] text-[#B8960C] text-xs font-bold uppercase rounded-full tracking-wider border border-[#B8960C]/20">
                {application.currentStage === 99 ? "DIBATALKAN" : `Tahap ${application.currentStage}`}
              </div>
              {application.isReregistration && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase rounded-full tracking-wider border border-blue-200">
                  🔄 Daftar Ulang
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Client Component */}
      <DetailClient
        application={application}
        docs={docs}
        history={history}
        priests={priests}
        previousApp={previousApp}
      />

    </div>
  );
}
