import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm"; // <-- Tambahan penting untuk fungsi update
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
      groomName, groomBirthdate, groomReligion, groomOccupation,
      groomPhone, groomBaptismChurch, groomFatherName, groomMotherName,
      brideName, brideBirthdate, brideReligion, brideOccupation,
      bridePhone, brideBaptismChurch, brideFatherName, brideMotherName,
      preferredWeddingDate, preferredWeddingTime, postMarriageAddress, ceremonyType,
      couplePhoto,
    } = body;

    if (!groomName || !brideName || !groomReligion || !brideReligion) {
      return NextResponse.json(
        { error: "Data tidak lengkap. Nama dan agama mempelai wajib diisi." },
        { status: 400 }
      );
    }

    const year = new Date().getFullYear();
    const randomHex = Math.floor(Math.random() * 65535).toString(16).toUpperCase().padStart(4, '0');
    const registrationNumber = `KP-${year}-${randomHex}`;

    await db.transaction(async (tx) => {
      const profileId = nanoid();
      await tx.insert(coupleProfiles).values({
        id: profileId,
        userId: session.user.id,
        registrationNumber,
        groomName, groomBirthdate, groomReligion, groomOccupation,
        groomPhone, groomBaptismChurch, groomFatherName, groomMotherName,
        brideName, brideBirthdate, brideReligion, brideOccupation,
        bridePhone, brideBaptismChurch, brideFatherName, brideMotherName,
        preferredWeddingDate: preferredWeddingDate || null,
        preferredWeddingTime: preferredWeddingTime || null,
        postMarriageAddress: postMarriageAddress || null,
        ceremonyType: ceremonyType || null,
        couplePhoto: couplePhoto || null,
      });

      const applicationId = nanoid();
      await tx.insert(marriageApplications).values({
        id: applicationId,
        coupleProfileId: profileId,
        currentStage: 1,
        weddingDate: null,
      });

      await tx.insert(stageHistory).values({
        id: nanoid(),
        applicationId,
        stageNumber: 1,
        note: "Pendaftaran baru diterima melalui sistem.",
        changedBy: session.user.id,
      });

      const docsToInsert = DEFAULT_DOCUMENTS.map((docName) => ({
        id: nanoid(),
        applicationId,
        documentName: docName,
        isReceived: false,
      }));
      await tx.insert(requiredDocuments).values(docsToInsert);

      await tx.insert(notifications).values({
        id: nanoid(),
        userId: session.user.id,
        message: `Selamat! Pendaftaran awal Anda telah berhasil dengan nomor registrasi ${registrationNumber}. Harap tunggu instruksi selanjutnya.`,
        isRead: false,
      });
    });

    return NextResponse.json({ success: true, registrationNumber }, { status: 201 });
  } catch (error) {
    console.error("API Profil POST Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal server" },
      { status: 500 }
    );
  }
}

// ═══════════════════ FUNGSI BARU UNTUK UPDATE DATA (EDIT) ═══════════════════
export async function PUT(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || session.user.role !== "COUPLE") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id, // ID profil yang akan diupdate
      groomName, groomBirthdate, groomReligion, groomOccupation,
      groomPhone, groomBaptismChurch, groomFatherName, groomMotherName,
      brideName, brideBirthdate, brideReligion, brideOccupation,
      bridePhone, brideBaptismChurch, brideFatherName, brideMotherName,
      preferredWeddingDate, preferredWeddingTime, postMarriageAddress, ceremonyType,
      couplePhoto,
    } = body;

    // Verifikasi bahwa profil tersebut benar-benar milik user yang sedang login
    const existingProfile = await db.select().from(coupleProfiles)
      .where(eq(coupleProfiles.userId, session.user.id)).limit(1);

    if (existingProfile.length === 0 || existingProfile[0].id !== id) {
      return NextResponse.json({ error: "Profil tidak ditemukan atau akses ditolak." }, { status: 404 });
    }

    // Lakukan proses pembaruan (Update) ke database
    await db.update(coupleProfiles)
      .set({
        groomName, groomBirthdate, groomReligion, groomOccupation,
        groomPhone, groomBaptismChurch, groomFatherName, groomMotherName,
        brideName, brideBirthdate, brideReligion, brideOccupation,
        bridePhone, brideBaptismChurch, brideFatherName, brideMotherName,
        preferredWeddingDate: preferredWeddingDate || null,
        preferredWeddingTime: preferredWeddingTime || null,
        postMarriageAddress: postMarriageAddress || null,
        ceremonyType: ceremonyType || null,
        couplePhoto: couplePhoto || null,
      })
      .where(eq(coupleProfiles.id, id));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("API Profil PUT Error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat menyimpan perubahan profil." },
      { status: 500 }
    );
  }
}