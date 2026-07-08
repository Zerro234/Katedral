import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    // Dapatkan ID admin utama
    const resAdmin = await db.execute(sql`SELECT id FROM "user" WHERE email = 'admin@katedral.id'`);
    const adminId = resAdmin[0].id;

    // Pindahkan semua relasi yang bisa menyebabkan constraint error
    await db.execute(sql`UPDATE contents SET "createdBy" = ${adminId} WHERE "createdBy" != ${adminId} OR "createdBy" IS NULL`);
    await db.execute(sql`UPDATE stage_history SET "changedBy" = ${adminId} WHERE "changedBy" != ${adminId} OR "changedBy" IS NULL`);
    await db.execute(sql`UPDATE marriage_applications SET "priestId" = NULL WHERE "priestId" != ${adminId} OR "priestId" IS NULL`);

    // Hapus user selain admin
    await db.execute(sql`DELETE FROM "user" WHERE id != ${adminId}`);
    
    console.log("Berhasil menghapus akun-akun selain admin@katedral.id");
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

main();
