import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { coupleProfiles, marriageApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { ProfileForm } from "../profile-form"; 

export const dynamic = "force-dynamic";

export default async function EditProfilPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return redirect("/masuk");

  // 1. Ambil data profil pasangan saat ini
  const profileRecord = await db.select().from(coupleProfiles)
    .where(eq(coupleProfiles.userId, session.user.id)).limit(1);
  const profile = profileRecord[0];

  if (!profile) {
    return redirect("/dasbor/profil"); // Jika belum punya profil, tolak akses
  }

  // 2. Ambil data pendaftaran untuk mengecek tahap (Stage)
  const appRecord = await db.select().from(marriageApplications)
    .where(eq(marriageApplications.coupleProfileId, profile.id)).limit(1);
  const application = appRecord[0];

  // KEAMANAN GANDA: Tolak akses jika user memaksa masuk ke URL edit namun sudah lewat Tahap 1
  if (application && application.currentStage > 1) {
    return redirect("/dasbor/profil");
  }

  return (
    <div className="max-w-4xl mx-auto page-fade">
      {/* Panggil formulir yang sudah ada, tapi berikan data lama & beri tahu ini mode Edit */}
      <ProfileForm initialData={profile} isEdit={true} />
    </div>
  );
}