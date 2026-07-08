import { config } from "dotenv";
config({ path: ".env.local" });

import { ne } from "drizzle-orm";
import { db } from "../lib/db/index";
import {
  accounts,
  coupleProfiles,
  marriageApplications,
  notifications,
  requiredDocuments,
  sessions,
  stageHistory,
  users,
} from "../lib/db/schema";

async function main() {
  console.log("Menghapus semua data pendaftaran & profil...");
  try {
    await db.delete(stageHistory);
    await db.delete(requiredDocuments);
    await db.delete(marriageApplications);
    await db.delete(coupleProfiles);
    await db.delete(notifications);
    await db.delete(sessions);
    await db.delete(accounts);

    console.log("Menghapus akun non-admin...");
    const result = await db.delete(users).where(ne(users.role, "ADMIN")).returning();
    console.log(`Berhasil menghapus ${result.length} akun pengguna.`);
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
  process.exit(0);
}

main();
