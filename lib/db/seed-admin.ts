/**
 * Seed minimal - hanya buat akun admin di database production
 * Jalankan: npx tsx lib/db/seed-admin.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { auth } from "../auth";
import { db } from "./index";
import { accounts, users } from "./schema";

async function seedAdmin() {
  console.log("🌱 Membuat akun admin di database production...\n");

  const ctx = await auth.$context;
  const hashPassword = ctx.password.hash;

  const now = new Date();

  const credentials = [
    {
      id: nanoid(),
      name: "Administrator Katedral",
      email: "admin@katedral.id",
      password: "admin123",
      role: "ADMIN" as const,
    },
    {
      id: nanoid(),
      name: "Rm. Antonius Wijaya, SCJ",
      email: "rm.antonius@katedral.id",
      password: "priest123",
      role: "PRIEST" as const,
    },
    {
      id: nanoid(),
      name: "Rm. Benediktus Sapto, SCJ",
      email: "rm.benediktus@katedral.id",
      password: "priest123",
      role: "PRIEST" as const,
    },
  ];

  for (const cred of credentials) {
    // Cek apakah user sudah ada
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, cred.email))
      .limit(1);

    if (existing.length > 0) {
      console.log(`⚠️  User ${cred.email} sudah ada, skip.`);
      continue;
    }

    const hashedPassword = await hashPassword(cred.password);

    // Insert user
    await db.insert(users).values({
      id: cred.id,
      name: cred.name,
      email: cred.email,
      emailVerified: true,
      role: cred.role,
      createdAt: now,
      updatedAt: now,
    });

    // Insert account (credential provider)
    await db.insert(accounts).values({
      id: nanoid(),
      userId: cred.id,
      accountId: cred.id,
      providerId: "credential",
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`✅ Berhasil: ${cred.email} (password: ${cred.password})`);
  }

  console.log("\n✨ Selesai!\n");
  console.log("Akun yang tersedia:");
  console.log("  ADMIN:  admin@katedral.id / admin123");
  console.log("  ROMO 1: rm.antonius@katedral.id / priest123");
  console.log("  ROMO 2: rm.benediktus@katedral.id / priest123");
  process.exit(0);
}

seedAdmin().catch((err) => {
  console.error("❌ Gagal:", err);
  process.exit(1);
});
