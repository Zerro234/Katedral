/**
 * Tampilkan daftar semua user yang terdaftar di database.
 * 
 * Cara pakai:
 *   npx tsx scripts/list-users.ts
 */
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../lib/db/schema";

config({ path: ".env.local" });

const connectionString = process.env.DATABASE_URL!;
const client = postgres(connectionString, { prepare: false });
const db = drizzle(client, { schema });

async function main() {
  const allUsers = await db.query.users.findMany({
    orderBy: (u, { desc }) => desc(u.createdAt),
  });

  if (allUsers.length === 0) {
    console.log("📭 Belum ada user terdaftar.");
    await client.end();
    return;
  }

  console.log(`📋 Total user terdaftar: ${allUsers.length}\n`);
  console.log("─".repeat(80));
  console.log(
    "No".padEnd(4) +
    "Email".padEnd(35) +
    "Nama".padEnd(20) +
    "Role".padEnd(10) +
    "Verified"
  );
  console.log("─".repeat(80));

  allUsers.forEach((user, i) => {
    const no = String(i + 1).padEnd(4);
    const email = (user.email || "-").padEnd(35);
    const name = (user.name || "-").padEnd(20);
    const role = (user.role || "-").padEnd(10);
    const verified = user.emailVerified ? "✅ Ya" : "❌ Belum";
    console.log(no + email + name + role + verified);
  });

  console.log("─".repeat(80));
  await client.end();
}

main().catch((err) => {
  console.error("❌ Error:", err);
  client.end();
  process.exit(1);
});
