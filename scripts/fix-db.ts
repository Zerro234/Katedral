import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`
      ALTER TABLE marriage_applications 
      ADD COLUMN IF NOT EXISTS is_reregistration BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS previous_application_id TEXT;
    `);
    console.log("Success adding missing columns");
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

main();
