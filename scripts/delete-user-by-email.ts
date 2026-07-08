/**
 * Hapus user dari database berdasarkan email.
 * Gunakan ini jika user sudah terdaftar tapi email verifikasi belum terkirim.
 * 
 * Cara pakai:
 *   npx tsx scripts/delete-user-by-email.ts user@email.com
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { eq } from "drizzle-orm";
import postgres from "postgres";
import * as schema from "../lib/db/schema";

config({ path: ".env.local" });

const EMAIL_TO_DELETE = process.argv[2];

if (!EMAIL_TO_DELETE) {
  console.error("❌ Masukkan email user yang ingin dihapus!");
  console.error("   Contoh: npx tsx scripts/delete-user-by-email.ts user@email.com");
  process.exit(1);
}

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  console.log(`🔍 Mencari user dengan email: ${EMAIL_TO_DELETE}`);

  // Cari user
  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.email, EMAIL_TO_DELETE),
  });

  if (!user) {
    console.log("✅ User tidak ditemukan. Database bersih.");
    await client.end();
    process.exit(0);
  }

  console.log(`👤 User ditemukan:`);
  console.log(`   ID: ${user.id}`);
  console.log(`   Nama: ${user.name}`);
  console.log(`   Email: ${user.email}`);
  console.log(`   Verified: ${user.emailVerified}`);

  // Hapus sessions
  const deletedSessions = await db
    .delete(schema.sessions)
    .where(eq(schema.sessions.userId, user.id))
    .returning();
  console.log(`🗑️  ${deletedSessions.length} session dihapus`);

  // Hapus accounts
  const deletedAccounts = await db
    .delete(schema.accounts)
    .where(eq(schema.accounts.userId, user.id))
    .returning();
  console.log(`🗑️  ${deletedAccounts.length} account dihapus`);

  // Hapus verifications
  const deletedVerifications = await db
    .delete(schema.verifications)
    .where(eq(schema.verifications.identifier, user.email))
    .returning();
  console.log(`🗑️  ${deletedVerifications.length} verification dihapus`);

  // Hapus stage_history yang changedBy = user.id
  const deletedStageHistory = await db
    .delete(schema.stageHistory)
    .where(eq(schema.stageHistory.changedBy, user.id))
    .returning();
  console.log(`🗑️  ${deletedStageHistory.length} stage_history dihapus`);

  // Hapus notifications
  const deletedNotifications = await db
    .delete(schema.notifications)
    .where(eq(schema.notifications.userId, user.id))
    .returning();
  console.log(`🗑️  ${deletedNotifications.length} notification dihapus`);

  // Set NULL pada contents.createdBy
  const updatedContents = await db
    .update(schema.contents)
    .set({ createdBy: null })
    .where(eq(schema.contents.createdBy, user.id))
    .returning();
  console.log(`🗑️  ${updatedContents.length} content di-unlink`);

  // Set NULL pada marriage_applications.priestId
  const updatedMarriages = await db
    .update(schema.marriageApplications)
    .set({ priestId: null })
    .where(eq(schema.marriageApplications.priestId, user.id))
    .returning();
  console.log(`🗑️  ${updatedMarriages.length} marriage_application di-unlink`);

  // Hapus user
  const deletedUser = await db
    .delete(schema.users)
    .where(eq(schema.users.id, user.id))
    .returning();
  console.log(`🗑️  User ${user.email} berhasil dihapus!`);

  console.log("\n✅ Selesai! Anda bisa daftar ulang dengan email tersebut.");
  await client.end();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  client.end();
  process.exit(1);
});
