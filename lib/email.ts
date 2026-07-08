import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Katedral Santo Yosef <noreply@katedralpontianak.my.id>";

// ── Template helper ──────────────────────────────────────────
function baseTemplate(title: string, body: string) {
  return `<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <style>
    body { margin:0; padding:0; background:#FAF7F2; font-family: Arial, Helvetica, sans-serif; }
    .wrapper { max-width:600px; margin:32px auto; background:#ffffff; border:1px solid #EDE8DF; border-radius:12px; overflow:hidden; }
    .header { background: linear-gradient(135deg,#3D2B1F,#6B4C35); padding:32px 40px; text-align:center; }
    .header h1 { margin:0; color:#F5D78A; font-size:22px; letter-spacing:1px; }
    .header p { margin:8px 0 0; color:rgba(255,255,255,0.7); font-size:12px; }
    .body { padding:32px 40px; }
    .body p { color:#3D2B1F; font-size:14px; line-height:1.7; margin:0 0 16px; }
    .reg-box { background:#FFF8E1; border:1px solid #B8960C33; border-radius:8px; padding:16px 24px; margin:20px 0; text-align:center; }
    .reg-box .label { font-size:10px; font-weight:700; letter-spacing:1px; text-transform:uppercase; color:#A89880; }
    .reg-box .value { font-size:28px; font-weight:700; color:#B8960C; letter-spacing:4px; }
    .stage-badge { display:inline-block; padding:6px 14px; border-radius:999px; font-size:12px; font-weight:700; background:#FFF8E1; color:#B8960C; border:1px solid #B8960C33; }
    .cta { display:block; width:fit-content; margin:20px auto; padding:12px 28px; background:#B8960C; color:#fff; text-decoration:none; border-radius:8px; font-weight:700; font-size:14px; }
    .footer { background:#F5F0E8; padding:20px 40px; text-align:center; font-size:11px; color:#A89880; border-top:1px solid #EDE8DF; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>✝ Katedral Santo Yosef</h1>
      <p>Pontianak, Kalimantan Barat</p>
    </div>
    <div class="body">
      ${body}
    </div>
    <div class="footer">
      <p>Email ini dikirim secara otomatis oleh Sistem Informasi Paroki Katedral Santo Yosef Pontianak.</p>
      <p>Jangan membalas email ini. Hubungi sekretariat untuk pertanyaan lebih lanjut.</p>
    </div>
  </div>
</body>
</html>`;
}

// ── Email Senders ─────────────────────────────────────────────

/** Kirim saat tahap dinaikkan */
export async function sendStageAdvanceEmail({
  to,
  name,
  regNum,
  newStage,
  stageName,
  note,
}: {
  to: string;
  name: string;
  regNum: string;
  newStage: number;
  stageName: string;
  note: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const body = `
    <p>Yth. <strong>${name}</strong>,</p>
    <p>Kami dengan senang hati memberitahukan bahwa status pendaftaran pernikahan Anda telah diperbarui.</p>
    <div class="reg-box">
      <div class="label">No. Registrasi</div>
      <div class="value">${regNum}</div>
    </div>
    <p>Status baru: <span class="stage-badge">Tahap ${newStage}: ${stageName}</span></p>
    <p style="background:#F0FFF4;border-left:3px solid #2D6A4F;padding:12px 16px;border-radius:0 8px 8px 0;color:#2D6A4F;font-style:italic;">"${note}"</p>
    <p>Silakan masuk ke portal untuk melihat detail perkembangan pendaftaran Anda.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dasbor/beranda" class="cta">Lihat Dasbor Saya →</a>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `[Katedral] Tahap ${newStage} — ${stageName} | ${regNum}`,
    html: baseTemplate(`Pembaruan Tahap ${newStage}`, body),
  });
}

/** Kirim informasi SOP saat naik ke Tahap 4 (Kanonik) */
export async function sendStage4AdminSopEmail({
  to,
  name,
  regNum,
}: {
  to: string;
  name: string;
  regNum: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const body = `
    <p>Yth. <strong>${name}</strong>,</p>
    <p>Kami informasikan bahwa status pendaftaran pernikahan Anda saat ini adalah <strong>Tahap 4: Penyelidikan Kanonik</strong>.</p>
    <div class="reg-box">
      <div class="label">No. Registrasi</div>
      <div class="value">${regNum}</div>
    </div>
    <div style="background:#FDF3D0; border:1px solid #E8D070; padding:16px; border-radius:8px; margin-bottom:16px;">
      <p style="margin-top:0; color:#9A7A0A; font-weight:bold;">Informasi Proses Administratif</p>
      <p style="color:#3D2B1F; margin-bottom:8px;">
        Penyelidikan Kanonik sedang berlangsung. Setelah tahap ini dinyatakan selesai oleh pihak gereja, calon pengantin akan diarahkan untuk mengikuti proses administratif berikut:
      </p>
      <ul style="color:#3D2B1F; margin-top:0; padding-left:20px; margin-bottom:12px;">
        <li>Pembayaran Administrasi</li>
        <li>Pengumuman Gereja (3 Minggu)</li>
        <li>Gladi Bersih</li>
      </ul>
      <p style="color:#3D2B1F; margin-bottom:0; font-style:italic;">
        Informasi jadwal dan ketentuan akan disampaikan oleh Admin Sekretariat.
      </p>
    </div>
    <p>Silakan masuk ke portal untuk melihat status pendaftaran Anda.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dasbor/beranda" class="cta">Lihat Dasbor Saya →</a>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `[Katedral] Informasi Tahapan Administratif Perkawinan | ${regNum}`,
    html: baseTemplate("Informasi Tahapan Administratif", body),
  });
}

/** Kirim saat tahap dikembalikan (rollback) */
export async function sendRollbackStageEmail({
  to,
  name,
  regNum,
  newStage,
  stageName,
  reason,
}: {
  to: string;
  name: string;
  regNum: string;
  newStage: number;
  stageName: string;
  reason: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const body = `
    <p>Yth. <strong>${name}</strong>,</p>
    <p>Kami informasikan bahwa pendaftaran pernikahan Anda dengan nomor registrasi berikut telah <strong>dikembalikan ke tahap sebelumnya</strong>.</p>
    <div class="reg-box">
      <div class="label">No. Registrasi</div>
      <div class="value">${regNum}</div>
    </div>
    <p>Status saat ini: <span class="stage-badge">Tahap ${newStage}: ${stageName}</span></p>
    <p>Alasan pengembalian tahap:</p>
    <p style="background:#FFF5F5;border-left:3px solid #C0392B;padding:12px 16px;border-radius:0 8px 8px 0;color:#C0392B;font-style:italic;">"${reason}"</p>
    <p>Silakan periksa informasi lebih lanjut dari Admin Sekretariat melalui dasbor Anda.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dasbor/beranda" class="cta">Lihat Dasbor Saya →</a>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `[Katedral] Pendaftaran Dikembalikan ke Tahap ${newStage} | ${regNum}`,
    html: baseTemplate("Pemberitahuan Pengembalian Tahap", body),
  });
}

/** Kirim saat pendaftaran dibatalkan */
export async function sendCancellationEmail({
  to,
  name,
  regNum,
  reason,
}: {
  to: string;
  name: string;
  regNum: string;
  reason: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const body = `
    <p>Yth. <strong>${name}</strong>,</p>
    <p>Dengan hormat kami informasikan bahwa pendaftaran pernikahan Anda dengan nomor registrasi berikut telah <strong>dibatalkan</strong>.</p>
    <div class="reg-box">
      <div class="label">No. Registrasi</div>
      <div class="value">${regNum}</div>
    </div>
    <p>Alasan pembatalan:</p>
    <p style="background:#FFF5F5;border-left:3px solid #C0392B;padding:12px 16px;border-radius:0 8px 8px 0;color:#C0392B;font-style:italic;">"${reason}"</p>
    <p>Jika Anda memiliki pertanyaan, silakan hubungi sekretariat paroki secara langsung.</p>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `[Katedral] Pendaftaran Pernikahan Dibatalkan | ${regNum}`,
    html: baseTemplate("Pemberitahuan Pembatalan Pendaftaran", body),
  });
}

/** Kirim saat jadwal pemberkatan ditetapkan */
export async function sendCeremonyScheduleEmail({
  to,
  name,
  regNum,
  weddingDate,
}: {
  to: string;
  name: string;
  regNum: string;
  weddingDate: string;
}) {
  if (!process.env.RESEND_API_KEY) return;
  const dateStr = new Date(weddingDate).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = weddingDate.includes("T")
    ? ` pukul ${weddingDate.substring(11, 16)} WIB`
    : "";
  const body = `
    <p>Yth. <strong>${name}</strong>,</p>
    <p>Selamat! 🎉 Kami dengan sukacita memberitahukan bahwa jadwal Pemberkatan Pernikahan Anda telah ditetapkan.</p>
    <div class="reg-box">
      <div class="label">No. Registrasi</div>
      <div class="value">${regNum}</div>
    </div>
    <p style="text-align:center; font-size:18px; font-weight:700; color:#2D6A4F;">${dateStr}${timeStr}</p>
    <p>Tempat: <strong>Katedral Santo Yosef Pontianak</strong></p>
    <p>Silakan hubungi sekretariat paroki jika ada pertanyaan mengenai persiapan teknis hari pemberkatan.</p>
    <a href="${process.env.NEXT_PUBLIC_APP_URL}/dasbor/beranda" class="cta">Lihat Dasbor Saya →</a>
  `;
  await resend.emails.send({
    from: FROM,
    to,
    subject: `[Katedral] 🎊 Jadwal Pemberkatan Anda Telah Ditetapkan! | ${regNum}`,
    html: baseTemplate("Jadwal Pemberkatan Ditetapkan", body),
  });
}
