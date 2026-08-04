import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { db } from "@/lib/db";
import { eq, like } from "drizzle-orm"; // <-- 'like' digunakan untuk mencari nomor berurutan
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

    // ═══════════════════ LOGIKA BARU: NOMOR REGISTRASI BERURUTAN ═══════════════════
    
    // 1. Dapatkan tanggal hari ini secara aman di zona waktu WIB (Asia/Jakarta)
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Jakarta',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
    const parts = formatter.formatToParts(new Date());
    const y = parts.find(p => p.type === 'year')?.value;
    const m = parts.find(p => p.type === 'month')?.value;
    const d = parts.find(p => p.type === 'day')?.value;
    const dateStr = `${y}${m}${d}`; // Hasil: 20260804

    const prefix = `KP-${dateStr}-`;

    // 2. Hitung berapa pendaftar yang sudah ada di database pada tanggal yang sama
    const todayRegistrations = await db.select({ id: coupleProfiles.id })
      .from(coupleProfiles)
      .where(like(coupleProfiles.registrationNumber, `${prefix}%`));

    // 3. Buat nomor urut baru (+1 dari total pendaftar hari ini)
    const sequence = todayRegistrations.length + 1;
    const sequenceStr = String(sequence).padStart(3, '0'); // Format urutan jadi 001, 002, dst

    // 4. Gabungkan menjadi format final: KP-20260804-001
    const registrationNumber = `${prefix}${sequenceStr}`;

    // ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════ FUNGSI UPDATE DATA (EDIT) ═══════════════════
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
      id,
      groomName, groomBirthdate, groomReligion, groomOccupation,
      groomPhone, groomBaptismChurch, groomFatherName, groomMotherName,
      brideName, brideBirthdate, brideReligion, brideOccupation,
      bridePhone, brideBaptismChurch, brideFatherName, brideMotherName,
      preferredWeddingDate, preferredWeddingTime, postMarriageAddress, ceremonyType,
      couplePhoto,
    } = body;

    const existingProfile = await db.select().from(coupleProfiles)
      .where(eq(coupleProfiles.userId, session.user.id)).limit(1);

    if (existingProfile.length === 0 || existingProfile[0].id !== id) {
      return NextResponse.json({ error: "Profil tidak ditemukan atau akses ditolak." }, { status: 404 });
    }

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