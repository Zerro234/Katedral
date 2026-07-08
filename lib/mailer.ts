import { Resend } from "resend";

// ── Resend Client ───────────────────────────────────────────────────────────
const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL = "Katedral Santo Yosef <noreply@katedralpontianak.my.id>";

// ── Generic send helper ────────────────────────────────────────────────────
export async function sendMail({
  to,
  subject,
  html,
}: {
  to: string;
  subject: string;
  html: string;
}) {
  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to,
    subject,
    html,
  });
  if (error) {
    throw new Error(`Resend error: ${error.message}`);
  }
}


// ── Email Templates ────────────────────────────────────────────────────────

/** Email verifikasi akun baru */
export function templateVerifikasi(name: string, url: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; border: 1px solid #E8E2DA; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background: #3D2B1F; padding: 32px 40px; text-align: center;">
        <h1 style="color: #F5EDD8; margin: 0; font-size: 22px; letter-spacing: 1px;">
          ✉ Katedral Santo Yosef
        </h1>
        <p style="color: #B8960C; margin: 6px 0 0; font-size: 13px; letter-spacing: 2px;">
          SISTEM INFORMASI PAROKI
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 40px;">
        <h2 style="color: #3D2B1F; margin-top: 0;">Selamat Datang, ${name}!</h2>
        <p style="color: #4A3728; line-height: 1.7;">
          Terima kasih telah mendaftar di Sistem Informasi Katedral Santo Yosef Pontianak.
          Untuk mengaktifkan akun Anda, silakan klik tombol di bawah ini:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${url}"
            style="display: inline-block; padding: 14px 32px; background-color: #B8960C;
                   color: #ffffff; text-decoration: none; border-radius: 6px;
                   font-weight: bold; font-size: 15px; letter-spacing: 0.5px;">
            Verifikasi Email Saya
          </a>
        </div>

        <p style="color: #6B6560; font-size: 13px;">
          Tautan ini akan kedaluwarsa dalam <strong>24 jam</strong>. Jika Anda tidak merasa
          mendaftar, silakan abaikan email ini.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #F0EBE3; padding: 20px 40px; border-top: 1px solid #E8E2DA; text-align: center;">
        <p style="color: #9C8B7A; font-size: 12px; margin: 0;">
          Tuhan memberkati,<br>
          <strong>Sekretariat Paroki Katedral Santo Yosef</strong>
        </p>
      </div>
    </div>
  `;
}

/** Email reset kata sandi */
export function templateResetSandi(name: string, url: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; border: 1px solid #E8E2DA; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background: #3D2B1F; padding: 32px 40px; text-align: center;">
        <h1 style="color: #F5EDD8; margin: 0; font-size: 22px; letter-spacing: 1px;">
          🔑 Katedral Santo Yosef
        </h1>
        <p style="color: #B8960C; margin: 6px 0 0; font-size: 13px; letter-spacing: 2px;">
          RESET KATA SANDI
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 40px;">
        <h2 style="color: #3D2B1F; margin-top: 0;">Halo, ${name}</h2>
        <p style="color: #4A3728; line-height: 1.7;">
          Kami menerima permintaan untuk mereset kata sandi akun Anda.
          Klik tombol di bawah untuk membuat kata sandi baru:
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${url}"
            style="display: inline-block; padding: 14px 32px; background-color: #B8960C;
                   color: #ffffff; text-decoration: none; border-radius: 6px;
                   font-weight: bold; font-size: 15px; letter-spacing: 0.5px;">
            Reset Kata Sandi
          </a>
        </div>

        <p style="color: #6B6560; font-size: 13px;">
          Tautan ini berlaku selama <strong>1 jam</strong>. Jika Anda tidak merasa meminta pengaturan ulang kata sandi atau menemukan hal yang mencurigakan, mohon segera abaikan email ini. Akun Anda akan tetap aman.
        </p>
      </div>

      <!-- Footer -->
      <div style="background: #F0EBE3; padding: 20px 40px; border-top: 1px solid #E8E2DA; text-align: center;">
        <p style="color: #9C8B7A; font-size: 12px; margin: 0;">
          Tuhan memberkati,<br>
          <strong>Sekretariat Paroki Katedral Santo Yosef</strong>
        </p>
      </div>
    </div>
  `;
}

/** Email selamat datang (setelah verifikasi/login pertama) */
export function templateSelamatDatang(name: string, loginUrl: string): string {
  return `
    <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; background: #FAF7F2; border: 1px solid #E8E2DA; border-radius: 8px; overflow: hidden;">
      <!-- Header -->
      <div style="background: #3D2B1F; padding: 32px 40px; text-align: center;">
        <h1 style="color: #F5EDD8; margin: 0; font-size: 22px; letter-spacing: 1px;">
          🕊 Katedral Santo Yosef
        </h1>
        <p style="color: #B8960C; margin: 6px 0 0; font-size: 13px; letter-spacing: 2px;">
          PENDAFTARAN BERHASIL
        </p>
      </div>

      <!-- Body -->
      <div style="padding: 40px;">
        <h2 style="color: #3D2B1F; margin-top: 0;">Selamat Datang, ${name}!</h2>
        <p style="color: #4A3728; line-height: 1.7;">
          Akun Anda telah berhasil diverifikasi dan aktif. Kami sangat senang menyambut Anda di Sistem Informasi Katedral Santo Yosef Pontianak.
        </p>
        <p style="color: #4A3728; line-height: 1.7;">
          Sekarang Anda dapat menggunakan fitur-fitur seperti pendaftaran Sakramen Perkawinan, melihat jadwal, dan fitur lainnya secara langsung melalui Dasbor Anda.
        </p>

        <div style="text-align: center; margin: 32px 0;">
          <a href="${loginUrl}"
            style="display: inline-block; padding: 14px 32px; background-color: #B8960C;
                   color: #ffffff; text-decoration: none; border-radius: 6px;
                   font-weight: bold; font-size: 15px; letter-spacing: 0.5px;">
            Masuk ke Dasbor
          </a>
        </div>
      </div>

      <!-- Footer -->
      <div style="background: #F0EBE3; padding: 20px 40px; border-top: 1px solid #E8E2DA; text-align: center;">
        <p style="color: #9C8B7A; font-size: 12px; margin: 0;">
          Tuhan memberkati,<br>
          <strong>Sekretariat Paroki Katedral Santo Yosef</strong>
        </p>
      </div>
    </div>
  `;
}
