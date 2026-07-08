import { db } from "./lib/db";
import { sql } from "drizzle-orm";

async function main() {
  try {
    await db.execute(sql`
      DELETE FROM contents WHERE type IN ('NEWS', 'AGENDA', 'ANNOUNCEMENT');
    `);
    console.log("Berita dan Pengumuman berhasil dihapus!");
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}

main();
