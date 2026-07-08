import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

type MarriageApplicationRow = {
  id: string;
};

// Akun yang TIDAK akan dihapus (admin & romo)
const PROTECTED_EMAILS = [
  "admin@katedral.id",
  "rm.antonius@katedral.id",
  "rm.benediktus@katedral.id",
];

async function deleteNonAdminUsers() {
  console.log("🔍 Mencari akun yang bisa dihapus (role=COUPLE)...\n");

  // Ambil semua user dengan role COUPLE
  const { data: coupleUsers, error: fetchErr } = await supabase
    .from("user")
    .select("id, email, name, role")
    .eq("role", "COUPLE");

  if (fetchErr) {
    console.error("❌ Gagal mengambil data user:", fetchErr.message);
    process.exit(1);
  }

  if (!coupleUsers || coupleUsers.length === 0) {
    console.log("✅ Tidak ada akun COUPLE yang perlu dihapus.");
    process.exit(0);
  }

  console.log(`📋 Ditemukan ${coupleUsers.length} akun COUPLE:\n`);
  coupleUsers.forEach((u, i) => {
    console.log(`   ${i + 1}. ${u.email} (${u.name})`);
  });

  const userIds = coupleUsers.map((u) => u.id);

  console.log("\n🗑️  Menghapus data terkait...");

  // 1. Hapus stage history
  const { error: e1 } = await supabase
    .from("stage_history")
    .delete()
    .in("changedBy", userIds);
  if (e1) console.warn("  ⚠️  stage_history:", e1.message);
  else console.log("  ✅ stage_history");

  // 2. Hapus required documents milik user
  const { data: apps } = await supabase
    .from("marriage_applications")
    .select("id")
    .in("userId", userIds);
  
  const appIds = ((apps || []) as MarriageApplicationRow[]).map((a) => a.id);
  
  if (appIds.length > 0) {
    const { error: e2 } = await supabase
      .from("required_documents")
      .delete()
      .in("applicationId", appIds);
    if (e2) console.warn("  ⚠️  required_documents:", e2.message);
    else console.log("  ✅ required_documents");

    const { error: e3 } = await supabase
      .from("stage_history")
      .delete()
      .in("applicationId", appIds);
    if (e3) console.warn("  ⚠️  stage_history (by appId):", e3.message);
    else console.log("  ✅ stage_history (by appId)");
  }

  // 3. Hapus marriage applications
  const { error: e4 } = await supabase
    .from("marriage_applications")
    .delete()
    .in("userId", userIds);
  if (e4) console.warn("  ⚠️  marriage_applications:", e4.message);
  else console.log("  ✅ marriage_applications");

  // 4. Hapus couple profiles
  const { error: e5 } = await supabase
    .from("couple_profiles")
    .delete()
    .in("userId", userIds);
  if (e5) console.warn("  ⚠️  couple_profiles:", e5.message);
  else console.log("  ✅ couple_profiles");

  // 5. Hapus notifications
  const { error: e6 } = await supabase
    .from("notifications")
    .delete()
    .in("userId", userIds);
  if (e6) console.warn("  ⚠️  notifications:", e6.message);
  else console.log("  ✅ notifications");

  // 6. Hapus sessions
  const { error: e7 } = await supabase
    .from("session")
    .delete()
    .in("userId", userIds);
  if (e7) console.warn("  ⚠️  sessions:", e7.message);
  else console.log("  ✅ sessions");

  // 7. Hapus accounts (OAuth links)
  const { error: e8 } = await supabase
    .from("account")
    .delete()
    .in("userId", userIds);
  if (e8) console.warn("  ⚠️  accounts:", e8.message);
  else console.log("  ✅ accounts");

  // 8. Hapus verifications
  const { error: e9 } = await supabase
    .from("verification")
    .delete()
    .in("identifier", coupleUsers.map((u) => u.email));
  if (e9) console.warn("  ⚠️  verifications:", e9.message);
  else console.log("  ✅ verifications");

  // 9. Hapus user itu sendiri
  const { error: e10 } = await supabase
    .from("user")
    .delete()
    .in("id", userIds);
  if (e10) {
    console.error("❌ Gagal hapus user:", e10.message);
    process.exit(1);
  }
  console.log("  ✅ users");

  console.log(`\n✅ Berhasil menghapus ${coupleUsers.length} akun COUPLE beserta seluruh datanya.`);
  console.log("\n🔒 Akun yang dilindungi (tidak dihapus):");
  PROTECTED_EMAILS.forEach((e) => console.log(`   - ${e}`));
  console.log("\nSekarang kamu bisa daftar ulang dengan email yang sama! 🎉\n");

  process.exit(0);
}

deleteNonAdminUsers().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
