import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    const res = await db.execute(sql`
      SELECT id, name, email, role, "createdAt"
      FROM "user"
      ORDER BY "createdAt" DESC;
    `);
    console.log("=== DAFTAR AKUN TERDAFTAR ===");
    console.table(res);
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

main();
