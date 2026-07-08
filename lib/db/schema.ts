import { pgTable, text, integer, boolean, timestamp, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// ============================================
// Better Auth Core Tables
// ============================================

/**
 * Users table — extends Better Auth core user with custom `role` field.
 * Better Auth expects: id, name, email, emailVerified, image, createdAt, updatedAt
 */
export const users = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").default(false),
  image: text("image"),
  role: varchar("role", { length: 20 }).default("COUPLE").notNull(), // COUPLE | ADMIN | PRIEST
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/**
 * Sessions table — Better Auth session management
 */
export const sessions = pgTable("session", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expiresAt").notNull(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/**
 * Accounts table — Better Auth OAuth/credential accounts
 */
export const accounts = pgTable("account", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  idToken: text("idToken"),
  password: text("password"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/**
 * Verifications table — Better Auth email verification tokens
 */
export const verifications = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

// ============================================
// Business Tables — Katedral Santo Yosef
// ============================================

/**
 * Couple Profiles — data mempelai pria & wanita
 * Dibuat setelah COUPLE mendaftar dan mengisi formulir data mempelai
 */
export const coupleProfiles = pgTable("couple_profiles", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  registrationNumber: varchar("registrationNumber", { length: 50 }).unique(), // KP-2026-0001
  // === Data Calon Suami ===
  groomName: text("groomName"),
  groomBirthdate: text("groomBirthdate"), // ISO date string
  groomPhone: varchar("groomPhone", { length: 20 }),
  groomBaptismChurch: text("groomBaptismChurch"),
  groomReligion: varchar("groomReligion", { length: 50 }),
  groomOccupation: text("groomOccupation"),
  groomFatherName: text("groomFatherName"),
  groomMotherName: text("groomMotherName"),
  // === Data Calon Isteri ===
  brideName: text("brideName"),
  brideBirthdate: text("brideBirthdate"), // ISO date string
  bridePhone: varchar("bridePhone", { length: 20 }),
  brideBaptismChurch: text("brideBaptismChurch"),
  brideReligion: varchar("brideReligion", { length: 50 }),
  brideOccupation: text("brideOccupation"),
  brideFatherName: text("brideFatherName"),
  brideMotherName: text("brideMotherName"),
  // === Informasi Perkawinan ===
  postMarriageAddress: text("postMarriageAddress"),
  ceremonyType: varchar("ceremonyType", { length: 20 }), // "Misa" | "Tanpa Misa"
  preferredWeddingDate: text("preferredWeddingDate"), // ISO date string (preferensi calon)
  preferredWeddingTime: text("preferredWeddingTime"), // HH:mm
  // === Foto ===
  couplePhoto: text("couplePhoto"), // Foto pasangan tunggal
  groomPhoto: text("groomPhoto"),   // Legacy — backward compat
  bridePhoto: text("bridePhoto"),   // Legacy — backward compat
  createdAt: timestamp("createdAt").defaultNow(),
});

/**
 * Marriage Applications — pengajuan pernikahan
 * Melacak progres pernikahan melalui 5 tahap
 */
export const marriageApplications = pgTable("marriage_applications", {
  id: text("id").primaryKey(),
  coupleProfileId: text("coupleProfileId")
    .notNull()
    .references(() => coupleProfiles.id, { onDelete: "cascade" }),
  priestId: text("priestId").references(() => users.id), // Romo yang ditugaskan
  currentStage: integer("currentStage").default(1).notNull(), // 1-5, 99=dibatalkan
  weddingDate: text("weddingDate"), // ISO datetime string
  // === Daftar Ulang ===
  isReregistration: boolean("is_reregistration").default(false),
  previousApplicationId: text("previous_application_id"), // nullable, ref ke app lama
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});

/**
 * Stage History — riwayat perubahan tahap pernikahan
 */
export const stageHistory = pgTable("stage_history", {
  id: text("id").primaryKey(),
  applicationId: text("applicationId")
    .notNull()
    .references(() => marriageApplications.id, { onDelete: "cascade" }),
  stageNumber: integer("stageNumber").notNull(), // 1-5
  note: text("note"),
  changedBy: text("changedBy")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  changedAt: timestamp("changedAt").defaultNow(),
});

/**
 * Required Documents — checklist 11 dokumen persyaratan pernikahan
 */
export const requiredDocuments = pgTable("required_documents", {
  id: text("id").primaryKey(),
  applicationId: text("applicationId")
    .notNull()
    .references(() => marriageApplications.id, { onDelete: "cascade" }),
  documentName: text("documentName").notNull(),
  isReceived: boolean("isReceived").default(false),
  receivedAt: timestamp("receivedAt"),
});

/**
 * Notifications — notifikasi in-app untuk pengguna
 */
export const notifications = pgTable("notifications", {
  id: text("id").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  message: text("message").notNull(),
  isRead: boolean("isRead").default(false),
  createdAt: timestamp("createdAt").defaultNow(),
});

/**
 * Contents — konten berita, jadwal misa, dan agenda
 */
export const contents = pgTable("contents", {
  id: text("id").primaryKey(),
  type: varchar("type", { length: 50 }).notNull(), // NEWS | MASS_SCHEDULE | AGENDA
  category: varchar("category", { length: 50, enum: ["Berita Paroki", "Pengumuman"] }), // Hanya 2 kategori yang diizinkan
  title: text("title").notNull(),
  slug: text("slug").unique(),
  body: text("body"),
  imageUrl: text("imageUrl"),
  location: text("location"),
  eventDate: text("eventDate"), // ISO datetime string
  eventEndDate: text("eventEndDate"), // ISO datetime string
  isPublished: boolean("isPublished").default(false),
  createdBy: text("createdBy").references(() => users.id),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").defaultNow(),
});
