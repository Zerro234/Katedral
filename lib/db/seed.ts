/**
 * Seed Script — Katedral Santo Yosef
 * 
 * Jalankan dengan: npx tsx lib/db/seed.ts
 * 
 * Data yang dibuat:
 * - 1 Admin (admin@katedral.id / admin123)
 * - 2 Priest (rm.antonius@katedral.id, rm.benediktus@katedral.id)
 * - 3 Couple dengan profil mempelai + 11 dokumen default masing-masing
 * - 5 Konten berita
 * - 6 Jadwal misa Minggu
 */

import { loadEnvConfig } from "@next/env";
const projectDir = process.cwd();
loadEnvConfig(projectDir);

import { db } from "./index";
import { auth } from "../auth";
import {
  users,
  accounts,
  coupleProfiles,
  marriageApplications,
  stageHistory,
  requiredDocuments,
  notifications,
  contents,
} from "./schema";
import { nanoid } from "nanoid";

// 11 dokumen default yang wajib disiapkan
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
  "Pas Foto (Berdampingan)",
  "Surat Izin Orang Tua",
];

async function seed() {
  console.log("🌱 Memulai seeding database...\n");

  // Get password hasher from Better Auth context
  const ctx = await auth.$context;
  const hashPassword = ctx.password.hash;

  // Hash passwords
  const adminPassword = await hashPassword("admin123");
  const priestPassword = await hashPassword("priest123");
  const couplePassword = await hashPassword("couple123");

  const now = new Date();

  // ============================================
  // 1. SEED USERS
  // ============================================
  console.log("👤 Membuat akun pengguna...");

  const adminId = nanoid();
  const priest1Id = nanoid();
  const priest2Id = nanoid();
  const couple1Id = nanoid();
  const couple2Id = nanoid();
  const couple3Id = nanoid();

  // Insert users
  await db.insert(users).values([
    {
      id: adminId,
      name: "Administrator Katedral",
      email: "admin@katedral.id",
      emailVerified: true,
      role: "ADMIN",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: priest1Id,
      name: "Rm. Antonius Wijaya, SCJ",
      email: "rm.antonius@katedral.id",
      emailVerified: true,
      role: "PRIEST",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: priest2Id,
      name: "Rm. Benediktus Sapto, SCJ",
      email: "rm.benediktus@katedral.id",
      emailVerified: true,
      role: "PRIEST",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: couple1Id,
      name: "Antonius Budi",
      email: "antonius.budi@gmail.com",
      emailVerified: true,
      role: "COUPLE",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: couple2Id,
      name: "Yohanes Pratama",
      email: "yohanes.pratama@gmail.com",
      emailVerified: true,
      role: "COUPLE",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: couple3Id,
      name: "Paulus Hendarto",
      email: "paulus.hendarto@gmail.com",
      emailVerified: true,
      role: "COUPLE",
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ============================================
  // 2. SEED ACCOUNTS (credential accounts for password login)
  // ============================================
  console.log("🔑 Membuat akun kredensial...");

  await db.insert(accounts).values([
    {
      id: nanoid(),
      userId: adminId,
      accountId: adminId,
      providerId: "credential",
      password: adminPassword,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      userId: priest1Id,
      accountId: priest1Id,
      providerId: "credential",
      password: priestPassword,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      userId: priest2Id,
      accountId: priest2Id,
      providerId: "credential",
      password: priestPassword,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      userId: couple1Id,
      accountId: couple1Id,
      providerId: "credential",
      password: couplePassword,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      userId: couple2Id,
      accountId: couple2Id,
      providerId: "credential",
      password: couplePassword,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      userId: couple3Id,
      accountId: couple3Id,
      providerId: "credential",
      password: couplePassword,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ============================================
  // 3. SEED COUPLE PROFILES
  // ============================================
  console.log("💑 Membuat profil mempelai...");

  const profile1Id = nanoid();
  const profile2Id = nanoid();
  const profile3Id = nanoid();

  await db.insert(coupleProfiles).values([
    {
      id: profile1Id,
      userId: couple1Id,
      registrationNumber: "KP-2026-0001",
      groomName: "Antonius Budi Santoso",
      groomBirthdate: "1995-03-15",
      groomPhone: "081234567890",
      groomBaptismChurch: "Gereja Katedral Santo Yosef Pontianak",
      brideName: "Maria Susanti Dewi",
      brideBirthdate: "1997-07-22",
      bridePhone: "081234567891",
      brideBaptismChurch: "Gereja St. Theresia Banjarmasin",
      createdAt: now,
    },
    {
      id: profile2Id,
      userId: couple2Id,
      registrationNumber: "KP-2026-0002",
      groomName: "Yohanes Pratama Putra",
      groomBirthdate: "1994-11-08",
      groomPhone: "082345678901",
      groomBaptismChurch: "Gereja St. Paulus Banjarmasin",
      brideName: "Cecilia Anggraini",
      brideBirthdate: "1996-05-30",
      bridePhone: "082345678902",
      brideBaptismChurch: "Gereja Katedral Santo Yosef Pontianak",
      createdAt: now,
    },
    {
      id: profile3Id,
      userId: couple3Id,
      registrationNumber: "KP-2026-0003",
      groomName: "Paulus Hendarto Wijaya",
      groomBirthdate: "1993-01-25",
      groomPhone: "083456789012",
      groomBaptismChurch: "Gereja Katedral Santo Yosef Pontianak",
      brideName: "Theresia Putri Maharani",
      brideBirthdate: "1995-12-10",
      bridePhone: "083456789013",
      brideBaptismChurch: "Gereja St. Ignatius Palangkaraya",
      createdAt: now,
    },
  ]);

  // ============================================
  // 4. SEED MARRIAGE APPLICATIONS
  // ============================================
  console.log("💒 Membuat pengajuan pernikahan...");

  const app1Id = nanoid();
  const app2Id = nanoid();
  const app3Id = nanoid();

  await db.insert(marriageApplications).values([
    {
      id: app1Id,
      coupleProfileId: profile1Id,
      priestId: priest1Id,
      currentStage: 3,
      weddingDate: "2026-08-15",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: app2Id,
      coupleProfileId: profile2Id,
      priestId: priest2Id,
      currentStage: 2,
      weddingDate: "2026-09-20",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: app3Id,
      coupleProfileId: profile3Id,
      priestId: null,
      currentStage: 1,
      weddingDate: null,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  // ============================================
  // 5. SEED STAGE HISTORY
  // ============================================
  console.log("📊 Membuat riwayat tahap...");

  const stageHistoryValues = [
    // Couple 1 - sudah sampai tahap 3
    { id: nanoid(), applicationId: app1Id, stageNumber: 1, note: "Pendaftaran diterima", changedBy: adminId, changedAt: new Date("2026-01-15") },
    { id: nanoid(), applicationId: app1Id, stageNumber: 2, note: "KPP telah dilaksanakan", changedBy: adminId, changedAt: new Date("2026-02-20") },
    { id: nanoid(), applicationId: app1Id, stageNumber: 3, note: "Silakan lengkapi dokumen persyaratan", changedBy: adminId, changedAt: new Date("2026-03-10") },
    // Couple 2 - sudah sampai tahap 2
    { id: nanoid(), applicationId: app2Id, stageNumber: 1, note: "Pendaftaran diterima", changedBy: adminId, changedAt: new Date("2026-02-01") },
    { id: nanoid(), applicationId: app2Id, stageNumber: 2, note: "Jadwal KPP telah ditentukan", changedBy: adminId, changedAt: new Date("2026-03-15") },
    // Couple 3 - baru tahap 1
    { id: nanoid(), applicationId: app3Id, stageNumber: 1, note: "Pendaftaran baru diterima", changedBy: adminId, changedAt: now },
  ];

  await db.insert(stageHistory).values(stageHistoryValues);

  // ============================================
  // 6. SEED REQUIRED DOCUMENTS (11 per couple)
  // ============================================
  console.log("📄 Membuat checklist dokumen...");

  const docValues: Array<{
    id: string;
    applicationId: string;
    documentName: string;
    isReceived: boolean;
    receivedAt: Date | null;
  }> = [];

  // Couple 1 - 5 dari 11 dokumen sudah diterima
  DEFAULT_DOCUMENTS.forEach((docName, idx) => {
    docValues.push({
      id: nanoid(),
      applicationId: app1Id,
      documentName: docName,
      isReceived: idx < 5,
      receivedAt: idx < 5 ? new Date("2026-03-15") : null,
    });
  });

  // Couple 2 - 3 dari 11 dokumen sudah diterima
  DEFAULT_DOCUMENTS.forEach((docName, idx) => {
    docValues.push({
      id: nanoid(),
      applicationId: app2Id,
      documentName: docName,
      isReceived: idx < 3,
      receivedAt: idx < 3 ? new Date("2026-03-20") : null,
    });
  });

  // Couple 3 - belum ada dokumen yang diterima
  DEFAULT_DOCUMENTS.forEach((docName) => {
    docValues.push({
      id: nanoid(),
      applicationId: app3Id,
      documentName: docName,
      isReceived: false,
      receivedAt: null,
    });
  });

  await db.insert(requiredDocuments).values(docValues);

  // ============================================
  // 7. SEED NOTIFICATIONS
  // ============================================
  console.log("🔔 Membuat notifikasi...");

  await db.insert(notifications).values([
    {
      id: nanoid(),
      userId: couple1Id,
      message: "Selamat! Pendaftaran pernikahan Anda telah diterima. Nomor registrasi: KP-2026-0001",
      isRead: true,
      createdAt: new Date("2026-01-15"),
    },
    {
      id: nanoid(),
      userId: couple1Id,
      message: "Tahap KPP telah selesai. Silakan lanjutkan ke tahap selanjutnya.",
      isRead: true,
      createdAt: new Date("2026-02-20"),
    },
    {
      id: nanoid(),
      userId: couple1Id,
      message: "Anda memasuki tahap Dokumen. Silakan lengkapi 11 dokumen persyaratan.",
      isRead: false,
      createdAt: new Date("2026-03-10"),
    },
    {
      id: nanoid(),
      userId: couple2Id,
      message: "Selamat! Pendaftaran pernikahan Anda telah diterima. Nomor registrasi: KP-2026-0002",
      isRead: true,
      createdAt: new Date("2026-02-01"),
    },
    {
      id: nanoid(),
      userId: couple2Id,
      message: "Jadwal KPP telah ditentukan. Silakan hubungi sekretariat untuk detail waktu.",
      isRead: false,
      createdAt: new Date("2026-03-15"),
    },
    {
      id: nanoid(),
      userId: couple3Id,
      message: "Selamat! Pendaftaran pernikahan Anda telah diterima. Nomor registrasi: KP-2026-0003",
      isRead: false,
      createdAt: now,
    },
  ]);

  // ============================================
  // 8. SEED CONTENTS - 5 Berita
  // ============================================
  console.log("📰 Membuat konten berita...");

  db.insert(contents).values([
    {
      id: nanoid(),
      type: "NEWS",
      title: "Perayaan Paskah 2026 di Katedral Santo Yosef",
      slug: "perayaan-paskah-2026",
      body: "Katedral Santo Yosef Pontianak mengundang seluruh umat untuk mengikuti rangkaian perayaan Paskah 2026. Perayaan dimulai dengan Misa Kamis Putih pada tanggal 2 April 2026 pukul 18.00 WITA, dilanjutkan dengan Jalan Salib dan Liturgi Jumat Agung pada 3 April, serta puncak perayaan Vigili Paskah pada Sabtu 4 April pukul 19.00 WITA. Seluruh umat diharapkan hadir dan membawa keluarga masing-masing.",
      imageUrl: null,
      isPublished: true,
      createdBy: adminId,
      createdAt: new Date("2026-03-20"),
      updatedAt: new Date("2026-03-20"),
    },
    {
      id: nanoid(),
      type: "NEWS",
      title: "Pendaftaran Kursus Persiapan Pernikahan (KPP) Gelombang II",
      slug: "pendaftaran-kpp-gelombang-2",
      body: "Sekretariat Katedral Santo Yosef membuka pendaftaran Kursus Persiapan Pernikahan (KPP) Gelombang II untuk periode Juli-Agustus 2026. KPP wajib diikuti oleh semua calon pengantin yang berencana melangsungkan pernikahan di Katedral Santo Yosef. Pendaftaran dibuka mulai 1 Mei hingga 30 Juni 2026. Untuk informasi lebih lanjut, silakan hubungi sekretariat.",
      imageUrl: null,
      isPublished: true,
      createdBy: adminId,
      createdAt: new Date("2026-04-01"),
      updatedAt: new Date("2026-04-01"),
    },
    {
      id: nanoid(),
      type: "NEWS",
      title: "Jadwal Misa Natal 2026 dan Tahun Baru 2027",
      slug: "jadwal-misa-natal-2026",
      body: "Berikut jadwal lengkap Misa Natal dan Tahun Baru di Katedral Santo Yosef Pontianak. Misa Malam Natal pada 24 Desember pukul 19.00 dan 22.00 WITA. Misa Hari Natal pada 25 Desember pukul 06.30, 08.00, dan 10.00 WITA. Umat dimohon hadir lebih awal untuk mendapatkan tempat duduk.",
      imageUrl: null,
      isPublished: true,
      createdBy: adminId,
      createdAt: new Date("2026-04-10"),
      updatedAt: new Date("2026-04-10"),
    },
    {
      id: nanoid(),
      type: "NEWS",
      title: "Renovasi Kapel Bawah Katedral Telah Selesai",
      slug: "renovasi-kapel-bawah",
      body: "Dengan penuh rasa syukur, kami mengumumkan bahwa renovasi Kapel Bawah Katedral Santo Yosef telah selesai dilaksanakan. Kapel kini telah dilengkapi dengan sistem pendingin udara baru, pencahayaan yang lebih baik, dan kursi yang lebih nyaman. Kapel Bawah akan kembali digunakan untuk misa harian mulai Senin, 20 April 2026.",
      imageUrl: null,
      isPublished: true,
      createdBy: adminId,
      createdAt: new Date("2026-04-15"),
      updatedAt: new Date("2026-04-15"),
    },
    {
      id: nanoid(),
      type: "NEWS",
      title: "Kegiatan Bakti Sosial Paroki — Peduli Sesama",
      slug: "bakti-sosial-peduli-sesama",
      body: "Katedral Santo Yosef Pontianak akan mengadakan kegiatan bakti sosial bertajuk 'Peduli Sesama' pada hari Sabtu, 10 Mei 2026. Kegiatan meliputi pembagian sembako, pemeriksaan kesehatan gratis, dan bazar murah. Umat yang ingin berpartisipasi sebagai relawan dapat mendaftarkan diri di sekretariat mulai 25 April 2026.",
      imageUrl: null,
      isPublished: true,
      createdBy: adminId,
      createdAt: new Date("2026-04-20"),
      updatedAt: new Date("2026-04-20"),
    },
  ]);

  // ============================================
  // 9. SEED CONTENTS - 6 Jadwal Misa Minggu
  // ============================================
  console.log("⛪ Membuat jadwal misa Minggu...");

  await db.insert(contents).values([
    {
      id: nanoid(),
      type: "MASS_SCHEDULE",
      title: "Misa Pagi",
      slug: "misa-minggu-0630",
      body: "Rm. Antonius Wijaya, SCJ",
      location: "Gereja Utama",
      eventDate: "06:30",
      isPublished: true,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      type: "MASS_SCHEDULE",
      title: "Misa Keluarga",
      slug: "misa-minggu-0800",
      body: "Rm. Benediktus Sapto, SCJ",
      location: "Gereja Utama",
      eventDate: "08:00",
      isPublished: true,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      type: "MASS_SCHEDULE",
      title: "Misa Mandarin",
      slug: "misa-minggu-0900",
      body: "Rm. Dominikus Tan, SCJ",
      location: "Kapel Mandarin",
      eventDate: "09:00",
      isPublished: true,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      type: "MASS_SCHEDULE",
      title: "Misa Anak & Remaja",
      slug: "misa-minggu-1000",
      body: "Rm. Cornelius Hadi, SCJ",
      location: "Kapel Bawah",
      eventDate: "10:00",
      isPublished: true,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      type: "MASS_SCHEDULE",
      title: "Misa Sore",
      slug: "misa-minggu-1700",
      body: "Rm. Antonius Wijaya, SCJ",
      location: "Gereja Utama",
      eventDate: "17:00",
      isPublished: true,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
    {
      id: nanoid(),
      type: "MASS_SCHEDULE",
      title: "Misa Malam (Vigili)",
      slug: "misa-minggu-1900",
      body: "Rm. Benediktus Sapto, SCJ",
      location: "Gereja Utama",
      eventDate: "19:00",
      isPublished: true,
      createdBy: adminId,
      createdAt: now,
      updatedAt: now,
    },
  ]);

  console.log("\n✅ Seeding selesai!");
  console.log("=====================================");
  console.log("Akun yang dibuat:");
  console.log("  ADMIN:  admin@katedral.id / admin123");
  console.log("  PRIEST: rm.antonius@katedral.id / priest123");
  console.log("  PRIEST: rm.benediktus@katedral.id / priest123");
  console.log("  COUPLE: antonius.budi@gmail.com / couple123");
  console.log("  COUPLE: yohanes.pratama@gmail.com / couple123");
  console.log("  COUPLE: paulus.hendarto@gmail.com / couple123");
  console.log("=====================================\n");
}

seed().catch((err) => {
  console.error("❌ Seeding gagal:", err);
  process.exit(1);
});
