import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { sql } from "drizzle-orm";

const client = postgres(process.env.DATABASE_URL!);
const db = drizzle(client);

const columns = [
  { name: "groomReligion", type: "varchar(50)" },
  { name: "groomOccupation", type: "text" },
  { name: "groomFatherName", type: "text" },
  { name: "groomMotherName", type: "text" },
  { name: "brideReligion", type: "varchar(50)" },
  { name: "brideOccupation", type: "text" },
  { name: "brideFatherName", type: "text" },
  { name: "brideMotherName", type: "text" },
  { name: "postMarriageAddress", type: "text" },
  { name: "ceremonyType", type: "varchar(20)" },
  { name: "preferredWeddingDate", type: "text" },
  { name: "preferredWeddingTime", type: "text" },
  { name: "couplePhoto", type: "text" },
];

async function migrate() {
  console.log("Starting migration...");
  for (const col of columns) {
    try {
      await db.execute(sql.raw(`ALTER TABLE couple_profiles ADD COLUMN IF NOT EXISTS "${col.name}" ${col.type}`));
      console.log(`  ✓ Added column: ${col.name}`);
    } catch (e: unknown) {
      const err = e as Error;
      if (err.message?.includes("already exists")) {
        console.log(`  ~ Column already exists: ${col.name}`);
      } else {
        console.error(`  ✗ Error adding ${col.name}:`, err.message);
      }
    }
  }
  console.log("Migration complete!");
  await client.end();
  process.exit(0);
}

migrate();
