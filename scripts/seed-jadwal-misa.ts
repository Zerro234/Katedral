import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../lib/db/index";
import { contents } from "../lib/db/schema";

// Jadwal default berdasarkan data yang diberikan:
// Misa Harian: Senin-Jumat
// Misa Mingguan: Sabtu (Vigili) + Minggu
const JADWAL_DEFAULT = [
  // ── MISA HARIAN (Senin–Jumat) ────────────────────────────────
  // Format category: "NamaHari::Harian"
  // Format eventDate: "HH.mm" (dipakai sebagai jam tampilan)

  // Senin - Misa Harian 05.30
  {
    title: "Misa Harian",
    category: "Senin::Harian",
    eventDate: "05.30",
  },
  // Selasa - Misa Harian 05.30
  {
    title: "Misa Harian",
    category: "Selasa::Harian",
    eventDate: "05.30",
  },
  // Rabu - Misa Harian 05.30
  {
    title: "Misa Harian",
    category: "Rabu::Harian",
    eventDate: "05.30",
  },
  // Kamis - Misa Harian 05.30
  {
    title: "Misa Harian",
    category: "Kamis::Harian",
    eventDate: "05.30",
  },
  // Jumat - Misa Harian 05.30
  {
    title: "Misa Harian",
    category: "Jumat::Harian",
    eventDate: "05.30",
  },
  // Jumat Pertama - Misa Khusus 18.00
  // (masuk Harian, tapi dengan title berbeda agar muncul subtitle)
  {
    title: "Jumat Pertama",
    category: "Jumat::Harian",
    eventDate: "18.00",
  },

  // ── MISA MINGGUAN (Sabtu & Minggu) ───────────────────────────
  // Sabtu - Misa Vigili 18.00
  {
    title: "Misa Vigili",
    category: "Sabtu::Harian",
    eventDate: "18.00",
  },
  // Minggu - Misa Minggu Pagi I 06.00
  {
    title: "Misa Minggu Pagi I",
    category: "Minggu::Harian",
    eventDate: "06.00",
  },
  // Minggu - Misa Minggu Pagi II 08.30
  {
    title: "Misa Minggu Pagi II",
    category: "Minggu::Harian",
    eventDate: "08.30",
  },
  // Minggu - Misa Minggu Sore I 16.00
  {
    title: "Misa Minggu Sore I",
    category: "Minggu::Harian",
    eventDate: "16.00",
  },
  // Minggu - Misa Minggu Sore II 18.00
  {
    title: "Misa Minggu Sore II",
    category: "Minggu::Harian",
    eventDate: "18.00",
  },
];

async function seedJadwalMisa() {
  console.log("🕯️  Memeriksa jadwal misa yang sudah ada...");

  // Hapus jadwal lama agar tidak duplikat
  const existing = await db
    .select({ id: contents.id })
    .from(contents)
    .where(eq(contents.type, "MASS_SCHEDULE"));

  if (existing.length > 0) {
    console.log(`⚠️  Ditemukan ${existing.length} jadwal lama. Menghapus dan membuat ulang...`);
    await db.delete(contents).where(eq(contents.type, "MASS_SCHEDULE"));
  }

  console.log("✝️  Membuat jadwal misa default...\n");

  const now = new Date();
  const valuesToInsert = JADWAL_DEFAULT.map((j) => ({
    id: nanoid(),
    type: "MASS_SCHEDULE",
    title: j.title,
    slug: `jadwal-${j.category.toLowerCase().replace(/::/g, "-")}-${j.eventDate.replace(".", "")}-${nanoid(4)}`,
    body: "",
    category: j.category,
    eventDate: j.eventDate,
    isPublished: true,
    createdAt: now,
    updatedAt: now,
  }));

  await db.insert(contents).values(valuesToInsert as unknown as Array<typeof contents.$inferInsert>);

  console.log("✅ Jadwal misa default berhasil dibuat!\n");
  console.log("📋 Ringkasan:");
  console.log("   ─────────────────────────────────────────");
  console.log("   MISA HARIAN");
  console.log("   Senin, Selasa, Rabu, Kamis, Jumat  → 05.30 WIB");
  console.log("   Jumat Pertama (setiap bulan)        → 18.00 WIB");
  console.log("   ─────────────────────────────────────────");
  console.log("   MISA MINGGUAN");
  console.log("   Sabtu (Misa Vigili)                 → 18.00 WIB");
  console.log("   Minggu Pagi I                       → 06.00 WIB");
  console.log("   Minggu Pagi II                      → 08.30 WIB");
  console.log("   Minggu Sore I                       → 16.00 WIB");
  console.log("   Minggu Sore II                      → 18.00 WIB");
  console.log("   ─────────────────────────────────────────");

  process.exit(0);
}

seedJadwalMisa().catch((err) => {
  console.error("❌ Gagal:", err);
  process.exit(1);
});
