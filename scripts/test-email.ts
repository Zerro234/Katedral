import { config } from "dotenv";
config({ path: ".env.local" });
import nodemailer from "nodemailer";

async function testEmail() {
  console.log("Mencoba login ke SMTP Gmail dengan:");
  console.log("User:", process.env.GMAIL_USER);
  console.log("Pass:", process.env.GMAIL_APP_PASSWORD ? "********" : "TIDAK ADA!");

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });

  try {
    await transporter.verify();
    console.log("✅ Berhasil login ke SMTP Gmail!");
    
    console.log("Mencoba mengirim email test...");
    await transporter.sendMail({
      from: `"Katedral Santo Yosef Test" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER, // Kirim ke diri sendiri
      subject: "Test Pengiriman Email via Nodemailer",
      html: "<p>Jika email ini sampai, berarti SMTP bekerja 100% normal.</p>",
    });
    console.log("✅ Email test berhasil dikirim!");
  } catch (err) {
    console.error("❌ GAGAL:", err);
  }
}

testEmail();
