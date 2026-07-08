import { db } from "./lib/db";

async function main() {
  try {
    console.log("Adding groomPhoto...");
    await db.execute(`ALTER TABLE "couple_profiles" ADD COLUMN IF NOT EXISTS "groomPhoto" text;`);
    console.log("Adding bridePhoto...");
    await db.execute(`ALTER TABLE "couple_profiles" ADD COLUMN IF NOT EXISTS "bridePhoto" text;`);
    console.log("Dropping plannedWeddingDate...");
    await db.execute(`ALTER TABLE "couple_profiles" DROP COLUMN IF EXISTS "plannedWeddingDate";`);
    console.log("Migration complete.");
  } catch (error) {
    console.error("Migration failed:", error);
  } finally {
    process.exit(0);
  }
}

main();
