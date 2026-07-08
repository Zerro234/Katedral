import { config } from "dotenv";
config({ path: ".env.local" });

import { db } from "../lib/db/index";
import {
  accounts,
  contents,
  coupleProfiles,
  marriageApplications,
  notifications,
  requiredDocuments,
  sessions,
  stageHistory,
  users,
  verifications,
} from "../lib/db/schema";

async function main() {
  console.log("Menghapus SELURUH data database...");
  try {
    // Delete in reverse order of dependencies
    await db.delete(stageHistory);
    await db.delete(requiredDocuments);
    await db.delete(marriageApplications);
    await db.delete(coupleProfiles);
    await db.delete(notifications);
    await db.delete(sessions);
    await db.delete(accounts);
    await db.delete(verifications);
    await db.delete(contents);
    await db.delete(users);

    console.log("Database berhasil dibersihkan sepenuhnya.");
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
  }
  process.exit(0);
}

main();
