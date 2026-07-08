import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "./db";
import * as schema from "./db/schema";
import { sendMail, templateVerifikasi, templateResetSandi, templateSelamatDatang } from "./mailer";

export const auth = betterAuth({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  trustedOrigins: [
    "https://katedralpontianak.my.id",
    "https://www.katedralpontianak.my.id",
    "http://localhost:3000",
  ],
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      ...schema,
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          try {
            const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
            const fixedUrl = appUrl.replace(/\/$/, "") + "/masuk";
            await sendMail({
              to: user.email as string,
              subject: "Selamat Datang di Katedral Santo Yosef",
              html: templateSelamatDatang(user.name as string, fixedUrl),
            });
          } catch (error) {
            console.error("Gagal mengirim email selamat datang:", error);
          }
        },
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true, // User wajib verifikasi email sebelum bisa login
    sendResetPassword: async ({ user, url }) => {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        const fixedUrl = url.replace(/^https?:\/\/localhost(:\d+)?/, appUrl.replace(/\/$/, ""));
        await sendMail({
          to: user.email,
          subject: "Reset Kata Sandi Akun Anda – Katedral Santo Yosef",
          html: templateResetSandi(user.name, fixedUrl),
        });
      } catch (error) {
        console.error("Gagal mengirim email reset password:", error);
      }
    },
  },
  emailVerification: {
    sendOnSignUp: true, // Kirim email verifikasi otomatis saat user mendaftar
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }) => {
      try {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
        // Ganti localhost di URL dengan APP_URL agar link bisa diklik di email
        const fixedUrl = url.replace(/^https?:\/\/localhost(:\d+)?/, appUrl.replace(/\/$/, ""));
        await sendMail({
          to: user.email,
          subject: "Verifikasi Email Anda – Katedral Santo Yosef",
          html: templateVerifikasi(user.name, fixedUrl),
        });
      } catch (error) {
        console.error("Gagal mengirim email verifikasi:", error);
      }
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google", "credential", "email-password"],
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "COUPLE",
        input: false, // Don't allow user to set role during signup
      },
    },
  },
  session: {
    // Include role in session for easy access
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  },
});

export type Session = typeof auth.$Infer.Session;
