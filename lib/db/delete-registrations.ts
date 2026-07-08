import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function deleteAll() {
  console.log("Menghapus semua data pendaftaran calon pengantin...\n");

  // Delete in correct FK order using subqueries
  const r1 = await db.execute(sql`DELETE FROM stage_history WHERE "applicationId" IN (SELECT id FROM marriage_applications)`);
  console.log(`  ✓ Hapus stage_history: ${r1.length} baris`);

  const r2 = await db.execute(sql`DELETE FROM required_documents WHERE "applicationId" IN (SELECT id FROM marriage_applications)`);
  console.log(`  ✓ Hapus required_documents: ${r2.length} baris`);

  const r3 = await db.execute(sql`DELETE FROM notifications WHERE "userId" IN (SELECT "userId" FROM couple_profiles)`);
  console.log(`  ✓ Hapus notifications: ${r3.length} baris`);

  const r4 = await db.execute(sql`DELETE FROM marriage_applications`);
  console.log(`  ✓ Hapus marriage_applications: ${r4.length} baris`);

  const r5 = await db.execute(sql`DELETE FROM couple_profiles`);
  console.log(`  ✓ Hapus couple_profiles: ${r5.length} baris`);

  console.log("\n✅ Semua data pendaftaran berhasil dihapus!\n");
  await client.end();
}

deleteAll();
