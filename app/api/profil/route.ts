import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import {
  coupleProfiles,
  marriageApplications,
  stageHistory,
  requiredDocuments,
  notifications,
} from "@/lib/db/schema";
import { nanoid } from "nanoid";

const DEFAULT_DOCUMENTS = [
  "Surat Baptis Pria",
  "Surat Baptis Wanita",
  "Fotokopi KTP Pria",
  "Fotokopi KTP Wanita",
  "Surat Pengantar Paroki",
  "Surat Keterangan Belum Menikah Pria",
  "Surat Keterangan Belum Menikah Wanita",
  "Akta Kelahiran Pria",
  "Akta Kelahiran Wanita",
  "Foto Pasangan Calon Pengantin",
  "Surat Izin Orang Tua",
];

export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "COUPLE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      // Calon Suami
      groomName,
      groomBirthdate,
      groomReligion,
      groomOccupation,
      groomPhone,
      groomBaptismChurch,
      groomFatherName,
      groomMotherName,
      // Calon Isteri
      brideName,
      brideBirthdate,
      brideReligion,
      brideOccupation,
      bridePhone,
      brideBaptismChurch,
      brideFatherName,
      brideMotherName,
      // Informasi Perkawinan
      preferredWeddingDate,
      preferredWeddingTime,
      postMarriageAddress,
      ceremonyType,
      // Foto
      couplePhoto,
    } = body;

    // Validate required fields
    if (!groomName || !brideName || !groomReligion || !brideReligion) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Nama dan agama mempelai wajib diisi." },
        { status: 400 }
      );
    }

    // Generate random reg number (e.g., KP-2026-4F8A)
    const year = new Date().getFullYear();
    const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
    const registrationNumber = `KP-${year}-${randomHex}`;

    // Execute in transaction
    await db.transaction(async (tx) => {
      // 1. Insert Profile
      const profileId = nanoid();
      await tx.insert(coupleProfiles).values({
        id: profileId,
        userId: session.user.id,
        registrationNumber,
        // Calon Suami
        groomName,
        groomBirthdate,
        groomReligion,
        groomOccupation,
        groomPhone,
        groomBaptismChurch,
        groomFatherName,
        groomMotherName,
        // Calon Isteri
        brideName,
        brideBirthdate,
        brideReligion,
        brideOccupation,
        bridePhone,
        brideBaptismChurch,
        brideFatherName,
        brideMotherName,
        // Informasi Perkawinan
        preferredWeddingDate: preferredWeddingDate || null,
        preferredWeddingTime: preferredWeddingTime || null,
        postMarriageAddress: postMarriageAddress || null,
        ceremonyType: ceremonyType || null,
        // Foto
        couplePhoto: couplePhoto || null,
      });

      // 2. Create Application
      const applicationId = nanoid();
      await tx.insert(marriageApplications).values({
        id: applicationId,
        coupleProfileId: profileId,
        currentStage: 1,
        weddingDate: null,
      });

      // 3. Create initial stage history
      await tx.insert(stageHistory).values({
        id: nanoid(),
        applicationId,
        stageNumber: 1,
        note: "Pendaftaran baru diterima melalui sistem.",
        changedBy: session.user.id, // Set by the user themselves for the initial state
      });

      // 4. Create required documents checklist
      const docsToInsert = DEFAULT_DOCUMENTS.map((docName) => ({
        id: nanoid(),
        applicationId,
        documentName: docName,
        isReceived: false,
      }));
      await tx.insert(requiredDocuments).values(docsToInsert);

      // 5. Send notification
      await tx.insert(notifications).values({
        id: nanoid(),
        userId: session.user.id,
        message: `Selamat! Pendaftaran awal Anda telah berhasil dengan nomor registrasi ${registrationNumber}. Harap tunggu instruksi selanjutnya.`,
        isRead: false,
      });
    });

    return NextResponse.json({ success: true, registrationNumber }, { status: 201 });
  } catch (error) {
    console.error("API Profil Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}
