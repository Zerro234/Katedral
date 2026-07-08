import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`ALTER TABLE contents ADD COLUMN category VARCHAR(50);`);
    console.log("Success adding category");
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

main();
