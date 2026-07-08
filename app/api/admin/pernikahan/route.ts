import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  marriageApplications,
  requiredDocuments,
  stageHistory,
  notifications,
  coupleProfiles,
  users
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { headers } from "next/headers";
import {
  sendStageAdvanceEmail,
  sendCancellationEmail,
  sendCeremonyScheduleEmail,
  sendStage4AdminSopEmail,
  sendRollbackStageEmail,
} from "@/lib/email";

const STAGE_NAMES = [
  "Pengisian Profil",
  "KPP",
  "Pemberkasan Dokumen",
  "Kanonik",
  "Selesai (Menunggu Pemberkatan)"
];

export async function POST(req: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminId = session.user.id;
    const body = await req.json();
    const { action, applicationId } = body;

    if (!applicationId) return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });

    const now = new Date();

    // Fetch app to get profileId to get userId
    const apps = await db.select().from(marriageApplications).where(eq(marriageApplications.id, applicationId)).limit(1);
    if (apps.length === 0) return NextResponse.json({ error: "Application not found" }, { status: 404 });
    const app = apps[0];

    const profiles = await db.select().from(coupleProfiles).where(eq(coupleProfiles.id, app.coupleProfileId)).limit(1);
    const coupleUserId = profiles[0]?.userId;
    const coupleProfile = profiles[0];

    // Fetch couple's email for Resend
    let coupleEmail = "";
    let coupleName = "";
    if (coupleUserId) {
      const userRecord = await db.select({ email: users.email, name: users.name })
        .from(users).where(eq(users.id, coupleUserId)).limit(1);
      coupleEmail = userRecord[0]?.email || "";
      coupleName = userRecord[0]?.name || "";
    }

    if (action === "TOGGLE_DOC") {
      const { docId, isReceived } = body;
      await db.update(requiredDocuments)
        .set({ isReceived, receivedAt: isReceived ? now : null })
        .where(eq(requiredDocuments.id, docId));
      return NextResponse.json({ success: true });
    }

    if (action === "ADVANCE_STAGE") {
      const newStage = (app.currentStage || 1) + 1;
      if (newStage > 5) return NextResponse.json({ error: "Already at max stage" }, { status: 400 });

      // Stage 5 Validation
      if (newStage === 5) {
        if (!app.priestId || !app.weddingDate) {
          return NextResponse.json({ error: "missing_requirements_for_stage_5" }, { status: 400 });
        }
      }

      await db.update(marriageApplications)
        .set({ currentStage: newStage, updatedAt: now })
        .where(eq(marriageApplications.id, applicationId));

      let note = `Pendaftaran Anda telah dinaikkan ke Tahap ${newStage}: ${STAGE_NAMES[newStage - 1]}.`;
      if (newStage === 5) {
        note = "Selamat! Semua dokumen sudah lengkap dan tahap sudah selesai. Silakan bersiap untuk pemberkatan nikah. Tuhan memberkati.";
      }

      // Log history
      await db.insert(stageHistory).values({
        id: nanoid(),
        applicationId,
        stageNumber: newStage,
        note,
        changedBy: adminId,
        changedAt: now
      });

      // Notify user (in-app)
      if (coupleUserId) {
        await db.insert(notifications).values({
          id: nanoid(),
          userId: coupleUserId,
          message: note,
          isRead: false,
          createdAt: now
        });

        // Stage 4 specific notification
        if (newStage === 4) {
          await db.insert(notifications).values({
            id: nanoid(),
            userId: coupleUserId,
            message: "Penyelidikan Kanonik sedang berlangsung. Setelah tahap ini dinyatakan selesai oleh pihak gereja, calon pengantin akan diarahkan untuk mengikuti proses administratif berikut: Pembayaran Administrasi, Pengumuman Gereja (3 Minggu), dan Gladi Bersih. Informasi jadwal dan ketentuan akan disampaikan oleh Admin Sekretariat.",
            isRead: false,
            createdAt: now
          });
        }
      }

      // Send email
      if (coupleEmail && coupleProfile) {
        sendStageAdvanceEmail({
          to: coupleEmail,
          name: coupleName,
          regNum: coupleProfile.registrationNumber || "",
          newStage,
          stageName: STAGE_NAMES[newStage - 1],
          note,
        }).catch(console.error);

        if (newStage === 4) {
          sendStage4AdminSopEmail({
            to: coupleEmail,
            name: coupleName,
            regNum: coupleProfile.registrationNumber || "",
          }).catch(console.error);
        }
      }

      return NextResponse.json({ success: true, newStage });
    }

    if (action === "ROLLBACK_STAGE") {
      const { note } = body;
      const currentStage = app.currentStage || 1;
      if (currentStage <= 1 || currentStage > 5) {
        return NextResponse.json({ error: "Invalid stage for rollback" }, { status: 400 });
      }

      const newStage = currentStage - 1;
      const rollbackNote = `Tahap dikembalikan dari Tahap ${currentStage} ke Tahap ${newStage}. Alasan: ${note}`;

      await db.update(marriageApplications)
        .set({ currentStage: newStage, updatedAt: now })
        .where(eq(marriageApplications.id, applicationId));

      // Log history
      await db.insert(stageHistory).values({
        id: nanoid(),
        applicationId,
        stageNumber: newStage,
        note: rollbackNote,
        changedBy: adminId,
        changedAt: now
      });

      // Notify user (in-app)
      if (coupleUserId) {
        await db.insert(notifications).values({
          id: nanoid(),
          userId: coupleUserId,
          message: `Pendaftaran Anda dikembalikan ke Tahap ${newStage} (${STAGE_NAMES[newStage - 1]}). Silakan periksa informasi dari Admin Sekretariat.`,
          isRead: false,
          createdAt: now
        });
      }

      // Send email
      if (coupleEmail && coupleProfile) {
        sendRollbackStageEmail({
          to: coupleEmail,
          name: coupleName,
          regNum: coupleProfile.registrationNumber || "",
          newStage,
          stageName: STAGE_NAMES[newStage - 1],
          reason: note,
        }).catch(console.error);
      }

      return NextResponse.json({ success: true, newStage });
    }

    if (action === "SEND_NOTE") {
      const { note } = body;
      
      // Log history without changing stage
      await db.insert(stageHistory).values({
        id: nanoid(),
        applicationId,
        stageNumber: app.currentStage,
        note,
        changedBy: adminId,
        changedAt: now
      });

      // Notify user
      if (coupleUserId) {
        await db.insert(notifications).values({
          id: nanoid(),
          userId: coupleUserId,
          message: `Pesan baru dari sekretariat: "${note}"`,
          isRead: false,
          createdAt: now
        });
      }

      return NextResponse.json({ success: true });
    }

    if (action === "APPROVE_REREGISTRATION") {
      // 1. Revert old app to 99 (Archived)
      await db.update(marriageApplications)
        .set({ currentStage: 99, updatedAt: now })
        .where(eq(marriageApplications.id, applicationId));

      // 2. Create new app at stage 1
      const newAppId = nanoid();
      await db.insert(marriageApplications).values({
        id: newAppId,
        coupleProfileId: app.coupleProfileId,
        currentStage: 1,
        isReregistration: true,
        previousApplicationId: app.id,
        createdAt: now,
        updatedAt: now,
      });

      // 3. Create default documents
      const DEFAULT_DOCUMENTS = [
        "Surat Permohonan Menikah (dari Ketua Umat)",
        "Fotokopi Surat Baptis Terbaru",
        "Fotokopi KTP & KK",
        "Pas Foto Berdampingan 4x6 (3 lembar)",
        "Sertifikat Kursus Persiapan Perkawinan (KPP)",
        "Fotokopi Akta Kelahiran",
        "Surat Keterangan Belum Pernah Menikah (Kelurahan)",
        "Surat Izin Orang Tua (jika di bawah umur)",
        "Surat Keterangan Kematian/Cerai (jika pernah menikah)",
        "Surat Keterangan Dokter (Bebas HIV/AIDS & Narkoba)",
        "Fotokopi Surat Ganti Nama (jika ada)"
      ];
      const docValues = DEFAULT_DOCUMENTS.map((name) => ({
        id: nanoid(),
        applicationId: newAppId,
        documentName: name,
        isReceived: false,
      }));
      await db.insert(requiredDocuments).values(docValues);

      // 4. Log history for new app
      await db.insert(stageHistory).values({
        id: nanoid(),
        applicationId: newAppId,
        stageNumber: 1,
        note: "Pendaftaran ulang disetujui. Formulir baru telah dibuat.",
        changedBy: adminId,
        changedAt: now
      });

      // 5. Notify user
      if (coupleUserId) {
        await db.insert(notifications).values({
          id: nanoid(),
          userId: coupleUserId,
          message: "Pengajuan daftar ulang Anda telah disetujui! Formulir pendaftaran baru telah dibuat, silakan lengkapi kembali dokumen Anda.",
          isRead: false,
          createdAt: now
        });
      }

      return NextResponse.json({ success: true, newAppId });
    }

    if (action === "CANCEL_APPLICATION") {
      const { note } = body;
      const cancelNote = `Pendaftaran dibatalkan: ${note}`;
      
      await db.update(marriageApplications)
        .set({ currentStage: 99, updatedAt: now })
        .where(eq(marriageApplications.id, applicationId));

      // Log history
      await db.insert(stageHistory).values({
        id: nanoid(),
        applicationId,
        stageNumber: 99,
        note: cancelNote,
        changedBy: adminId,
        changedAt: now
      });

      // Notify user (in-app)
      if (coupleUserId) {
        await db.insert(notifications).values({
          id: nanoid(),
          userId: coupleUserId,
          message: cancelNote,
          isRead: false,
          createdAt: now
        });
      }

      // Send cancellation email
      if (coupleEmail && coupleProfile) {
        sendCancellationEmail({
          to: coupleEmail,
          name: coupleName,
          regNum: coupleProfile.registrationNumber || "",
          reason: note,
        }).catch(console.error);
      }

      return NextResponse.json({ success: true });
    }

    if (action === "SET_WEDDING_DATE") {
      const { weddingDate } = body;
      await db.update(marriageApplications)
        .set({ weddingDate: weddingDate || null, updatedAt: now })
        .where(eq(marriageApplications.id, applicationId));

      // Notify couple (in-app)
      if (coupleUserId && weddingDate) {
        const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
          weekday: "long", day: "numeric", month: "long", year: "numeric",
        });
        const timeStr = weddingDate.includes("T") ? ` pukul ${weddingDate.substring(11, 16)} WIB` : "";
        await db.insert(notifications).values({
          id: nanoid(),
          userId: coupleUserId,
          message: `🎉 Jadwal Pemberkatan Anda telah ditetapkan: ${dateStr}${timeStr}. Selamat!`,
          isRead: false,
          createdAt: now,
        });
      }

      // Send ceremony email
      if (coupleEmail && coupleProfile && weddingDate) {
        sendCeremonyScheduleEmail({
          to: coupleEmail,
          name: coupleName,
          regNum: coupleProfile.registrationNumber || "",
          weddingDate,
        }).catch(console.error);
      }

      return NextResponse.json({ success: true });
    }

    if (action === "ASSIGN_PRIEST") {
      const { priestId } = body;
      await db.update(marriageApplications)
        .set({ priestId: priestId || null, updatedAt: now })
        .where(eq(marriageApplications.id, applicationId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("Admin API Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
