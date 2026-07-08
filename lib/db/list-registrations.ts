import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

async function listData() {
  // List all couple profiles
  const profiles = await db.execute(sql`
    SELECT cp.id, cp."registrationNumber", cp."groomName", cp."brideName", cp."createdAt",
           ma."currentStage"
    FROM couple_profiles cp
    LEFT JOIN marriage_applications ma ON ma."coupleProfileId" = cp.id
    ORDER BY cp."createdAt" DESC
  `);

  console.log("\n=== Data Pendaftaran Calon Pengantin ===\n");
  
  if (profiles.length === 0) {
    console.log("  (Tidak ada data)");
  } else {
    for (const p of profiles) {
      console.log(`  [${p.registrationNumber}] ${p.groomName} & ${p.brideName} — Tahap ${p.currentStage} — Dibuat: ${p.createdAt}`);
    }
  }
  
  console.log(`\n  Total: ${profiles.length} pendaftaran\n`);
  
  await client.end();
}

listData();
