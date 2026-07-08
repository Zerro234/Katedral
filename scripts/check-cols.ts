import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const res = await db.execute(sql`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'marriage_applications';
    `);
    console.log(res);
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

main();
