import { config } from "dotenv";
config({ path: ".env.local" });

import { createClient } from "@supabase/supabase-js";
import { nanoid } from "nanoid";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

function makeSlug(title: string): string {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .substring(0, 60) +
    "-" + nanoid(6)
  );
}

const BERITA = [
  {
    title: "Misa Penutupan Bulan Maria di Katedral Santo Yosef",
    body: `<p>Paroki Katedral Santo Yosef Pontianak menyelenggarakan Misa Penutupan Bulan Maria yang khidmat pada Sabtu, 31 Mei 2025. Ribuan umat memenuhi gereja dan halaman katedral untuk bersama-sama menutup bulan yang dipersembahkan bagi Bunda Maria ini.</p><p>Perayaan dipimpin oleh Pastor Paroki Rm. Antonius, MSF didampingi beberapa konselebran. Dalam homilinya, beliau mengajak umat untuk meneladani kesederhanaan dan ketaatan Maria dalam kehidupan sehari-hari.</p><p>Acara dilanjutkan dengan prosesi lilin mengelilingi gereja dan doa Rosario bersama yang dipimpin oleh Legio Maria setempat. Suasana semakin meriah dengan nyanyian lagu-lagu pujian untuk Bunda Maria yang dinyanyikan oleh Koor Katedral.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80",
    daysAgo: 2,
  },
  {
    title: "Pemberkatan Gedung Serba Guna Paroki yang Baru Selesai Dibangun",
    body: `<p>Setelah hampir dua tahun dalam proses pembangunan, Gedung Serba Guna Paroki Katedral Santo Yosef akhirnya resmi diberkati dan dibuka untuk umum. Pemberkatan dilakukan oleh Uskup Agung Pontianak dalam perayaan yang dihadiri oleh lebih dari 500 umat dan tamu undangan.</p><p>Gedung berlantai tiga ini dilengkapi dengan aula besar berkapasitas 400 orang, ruang kelas untuk Sekolah Minggu, kantor sekretariat yang baru, dan kapel doa kecil di lantai atas.</p><p>"Gedung ini adalah berkat dari Tuhan melalui kesetiaan dan kemurahan hati umat," ujar Pastor Paroki dalam sambutannya.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1541802645635-11f2286a7482?w=800&q=80",
    daysAgo: 5,
  },
  {
    title: "Tim Futsal Katedral Juara 1 Turnamen Antar Paroki Se-Pontianak",
    body: `<p>Tim futsal Paroki Katedral Santo Yosef berhasil meraih juara pertama dalam Turnamen Futsal Antar Paroki Se-Keuskupan Agung Pontianak yang diselenggarakan selama tiga hari di GOR Pangsuma.</p><p>Dalam pertandingan final yang berlangsung sengit, tim Katedral mengalahkan tim dari Paroki Santa Maria dengan skor 3-2. Gol-gol dicetak oleh Budi (menit ke-5), Doni (menit ke-18), dan Rian (menit ke-35).</p><p>Kapten tim, Andreas, menyatakan bahwa kemenangan ini dipersembahkan untuk seluruh umat Katedral.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1552667466-07770ae110d0?w=800&q=80",
    daysAgo: 8,
  },
  {
    title: "Bakti Sosial dan Pengobatan Gratis di Kampung Beting",
    body: `<p>Komisi Sosial Paroki Katedral Santo Yosef bekerja sama dengan IDI Cabang Pontianak menggelar kegiatan Bakti Sosial dan Pengobatan Gratis di Kampung Beting. Kegiatan ini berhasil melayani lebih dari 300 warga yang mayoritas merupakan nelayan dan keluarganya.</p><p>Layanan yang diberikan meliputi pemeriksaan umum, pemeriksaan gigi, konsultasi gizi, dan pembagian obat-obatan gratis. Tim juga membagikan 150 paket sembako dan perlengkapan sekolah untuk anak-anak.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80",
    daysAgo: 12,
  },
  {
    title: "Perayaan Natal Bersama 2024: Penuh Sukacita dan Kebersamaan",
    body: `<p>Perayaan Natal 2024 di Paroki Katedral Santo Yosef berlangsung dengan penuh khidmat dan sukacita. Misa Malam Natal yang dimulai pukul 19.00 WIB dipimpin langsung oleh Pastor Paroki dan dihadiri oleh lebih dari 2.000 umat yang memenuhi setiap sudut gereja.</p><p>Koor Katedral menampilkan nyanyian-nyanyian Natal yang indah, termasuk beberapa lagu Natal dalam bahasa Dayak sebagai bentuk inkulturasi budaya lokal. Dekorasi kandang Natal yang artistik menjadi daya tarik tersendiri bagi umat.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1543332164-6e82f355badc?w=800&q=80",
    daysAgo: 18,
  },
  {
    title: "Program Beasiswa Pendidikan untuk Putra-Putri Umat Berprestasi 2025",
    body: `<p>Dewan Pastoral Paroki (DPP) Katedral Santo Yosef dengan bangga mengumumkan dibukanya Program Beasiswa Pendidikan tahun 2025 bagi putra-putri umat Katedral yang berprestasi namun membutuhkan dukungan finansial.</p><p>Program ini didanai dari Dana Sosial Paroki dengan nilai bervariasi antara Rp 1.500.000 hingga Rp 3.000.000 per semester. Pendaftaran dibuka mulai tanggal 1 Juni hingga 30 Juni 2025 di Kantor Sekretariat Paroki.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80",
    daysAgo: 21,
  },
  {
    title: "Kunjungan Pastoral Uskup Agung ke Stasi Pedalaman Kalimantan",
    body: `<p>Selama satu minggu penuh, Uskup Agung Pontianak melakukan kunjungan pastoral ke beberapa stasi di pedalaman Kalimantan Barat yang berada di bawah pelayanan Paroki Katedral Santo Yosef.</p><p>Di setiap stasi, Uskup merayakan Misa, menerimakan Sakramen Krisma bagi puluhan remaja, dan berdialog langsung dengan umat mengenai kehidupan iman mereka. Beliau juga menyempatkan diri mengunjungi sekolah-sekolah Katolik setempat.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1504270997636-07ddfbd48945?w=800&q=80",
    daysAgo: 25,
  },
  {
    title: "Sekolah Minggu Katedral Tampil di Festival Anak Katolik Nasional",
    body: `<p>Delegasi Sekolah Minggu Paroki Katedral Santo Yosef Pontianak berhasil mencuri perhatian dalam Festival Anak Katolik Nasional 2025 yang diselenggarakan di Jakarta. Mereka menampilkan tarian tradisional Dayak yang memukau seluruh peserta dan juri.</p><p>Sebanyak 25 anak usia 6–15 tahun terlibat dalam penampilan tersebut mengenakan kostum adat Dayak yang berwarna-warni. Tim juga berhasil meraih juara kedua lomba mewarnai dan juara ketiga cerdas cermat Kitab Suci.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=800&q=80",
    daysAgo: 30,
  },
  {
    title: "Renovasi Gereja Katedral: Mempercantik Rumah Tuhan untuk Generasi Mendatang",
    body: `<p>Setelah melalui proses perencanaan yang panjang, Proyek Renovasi Gereja Katedral Santo Yosef resmi dimulai. Renovasi mencakup pembaruan atap, pengecatan seluruh interior, dan pemasangan sistem pendingin udara baru.</p><p>Pastor Paroki menjelaskan bahwa renovasi dilakukan dengan tetap mempertahankan arsitektur asli gereja yang bernilai sejarah tinggi. Selama masa renovasi (diperkirakan 3 bulan), Misa tetap dirayakan di gereja dengan penyesuaian tertentu.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1548625149-720754bc70b5?w=800&q=80",
    daysAgo: 35,
  },
  {
    title: "Retret Keluarga Paroki: Mempererat Ikatan Cinta dalam Terang Injil",
    body: `<p>Komisi Keluarga Paroki Katedral Santo Yosef menyelenggarakan Retret Keluarga selama tiga hari dua malam di Pusat Retret Wisma Bethania, Singkawang. Kegiatan ini diikuti oleh 45 pasangan keluarga dari berbagai wilayah stasi.</p><p>Retret dipandu oleh Rm. Benediktus, MSF dengan tema "Keluarga Kudus, Gereja Kecil: Mewujudkan Kasih Kristus di Rumah Tangga". Paroki berencana mengadakan retret serupa setiap tahun.</p>`,
    imageUrl: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80",
    daysAgo: 40,
  },
];

const PENGUMUMAN = [
  {
    title: "Perubahan Jadwal Misa Minggu, 1 Juni 2025",
    body: `<p>Diberitahukan kepada seluruh umat Paroki Katedral Santo Yosef bahwa <strong>Misa Minggu, 1 Juni 2025</strong> akan mengalami perubahan jadwal. Misa Sore I ditiadakan dan Misa Sore II dimajukan menjadi pukul 17.00 WIB. Perubahan ini dilakukan sehubungan dengan adanya acara pemberkatan Aula Paroki yang baru. Umat mohon untuk menyesuaikan diri.</p>`,
    daysAgo: 1,
  },
  {
    title: "Pendaftaran Kursus Persiapan Perkawinan (KPP) Periode Juni 2025",
    body: `<p>Sekretariat Paroki membuka pendaftaran <strong>Kursus Persiapan Perkawinan (KPP)</strong> periode Juni 2025. Dilaksanakan pada Sabtu & Minggu, 14–15 Juni 2025, pukul 08.00–17.00 WIB di Aula Paroki Lt. 2. Biaya Rp 200.000 per pasang. Pendaftaran paling lambat Jumat, 7 Juni 2025 di Kantor Sekretariat.</p>`,
    daysAgo: 2,
  },
  {
    title: "Kolekte Khusus Pembangunan Kapel Stasi St. Yusuf Sungai Ambawang",
    body: `<p>Kami mengumumkan adanya <strong>Kolekte Khusus Pembangunan Kapel</strong> yang akan dilaksanakan pada <strong>Minggu, 8 Juni 2025</strong> di seluruh Misa Katedral dan stasi-stasi. Kapel Stasi St. Yusuf yang berumur lebih dari 40 tahun memerlukan renovasi total. Dana yang terkumpul akan sepenuhnya digunakan untuk kebutuhan pembangunan tersebut. Terima kasih atas kemurahan hati umat.</p>`,
    daysAgo: 3,
  },
  {
    title: "Sekretariat Paroki Libur pada Hari Waisak, 12 Juni 2025",
    body: `<p>Diberitahukan bahwa <strong>Kantor Sekretariat Paroki</strong> akan <strong>tutup/libur</strong> pada Kamis, 12 Juni 2025 (Hari Raya Waisak). Pelayanan administrasi kembali normal pada Jumat, 13 Juni 2025 pukul 08.00 WIB. Bagi umat yang memiliki keperluan mendesak, harap menghubungi sekretariat sebelum tanggal tersebut.</p>`,
    daysAgo: 4,
  },
  {
    title: "Undangan: Pertemuan Orangtua Murid Sekolah Minggu Semester Baru",
    body: `<p>Kami mengundang seluruh orangtua/wali murid Sekolah Minggu untuk hadir dalam <strong>Pertemuan Orangtua Murid</strong> pada Minggu, 15 Juni 2025 pukul 10.00–12.00 WIB (setelah Misa Pagi II) di Ruang Kelas Sekolah Minggu, Lt. 2 Gedung Serba Guna. Agenda: perkenalan guru baru, program pembelajaran, dan kebutuhan materi. Kehadiran Bapak/Ibu sangat diharapkan.</p>`,
    daysAgo: 5,
  },
  {
    title: "Pemilihan Ketua Wilayah dan Lingkungan Periode 2025–2028",
    body: `<p>DPP Katedral Santo Yosef mengumumkan dimulainya proses <strong>Pemilihan Ketua Wilayah dan Lingkungan</strong> periode 2025–2028. Jadwal: Wilayah Timur (21 Juni), Wilayah Barat (28 Juni), Wilayah Utara (5 Juli 2025). Umat yang ingin mencalonkan diri dapat mendaftarkan diri ke Sekretariat Paroki paling lambat 7 hari sebelum pemilihan wilayah masing-masing.</p>`,
    daysAgo: 6,
  },
  {
    title: "Donor Darah Bersama PMI — Jumat, 20 Juni 2025",
    body: `<p>Komisi Sosial Paroki bekerja sama dengan PMI Kota Pontianak menyelenggarakan <strong>Donor Darah Sukarela</strong> pada Jumat, 20 Juni 2025, pukul 08.00–12.00 WIB di Aula Paroki Lt. 1. Syarat: sehat jasmani, usia 17–60 tahun, BB minimal 45 kg. Tersedia snack gratis bagi pendonor. Mari selamatkan nyawa sesama dengan satu tetes darah!</p>`,
    daysAgo: 8,
  },
  {
    title: "Pemberkatan Kendaraan Bermotor Umat — Minggu, 22 Juni 2025",
    body: `<p>Paroki Katedral Santo Yosef akan menyelenggarakan <strong>Pemberkatan Kendaraan Bermotor</strong> bagi seluruh umat pada Minggu, 22 Juni 2025 pukul 09.30 WIB (setelah Misa Pagi II) di Halaman Parkir Gereja. Seluruh umat yang memiliki kendaraan (motor, mobil, sepeda) diundang untuk hadir. Dipimpin oleh Pastor Paroki. Tidak dipungut biaya apapun.</p>`,
    daysAgo: 10,
  },
  {
    title: "Pembukaan Pendaftaran Anggota Baru Koor Katedral Santo Yosef",
    body: `<p>Paduan Suara (Koor) Katedral Santo Yosef membuka pendaftaran untuk <strong>anggota baru</strong> yang akan memperkuat tim koor. Kami mencari putra-putri umat berusia 15–40 tahun yang memiliki minat di bidang musik gereja dan bersedia berlatih setiap Jumat malam (19.00–21.00 WIB). Pendaftaran: 1–30 Juni 2025 di Sekretariat Paroki. Audisi: Sabtu, 5 Juli 2025.</p>`,
    daysAgo: 14,
  },
  {
    title: "Sistem Pendaftaran Perkawinan Online Resmi Digunakan Mulai 1 Juni 2025",
    body: `<p>Sekretariat Paroki Katedral Santo Yosef dengan bangga mengumumkan bahwa mulai <strong>1 Juni 2025</strong>, proses pendaftaran sakramen perkawinan menggunakan <strong>Sistem Informasi Pendaftaran Online</strong>. Calon pengantin kini dapat mendaftar, melengkapi formulir, memantau tahapan, dan menerima notifikasi secara online melalui website resmi paroki. Bagi yang membutuhkan bantuan, harap datang ke Sekretariat pada jam kerja.</p>`,
    daysAgo: 16,
  },
];

type ContentInsert = {
  id: string;
  type: "NEWS";
  category: "Berita Paroki" | "Pengumuman";
  title: string;
  slug: string;
  body: string;
  imageUrl: string | null;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

async function seedBeritaPengumuman() {
  console.log("🔍 Mencari akun admin...");
  
  // Ambil admin via Supabase REST API
  const { data: adminData, error: adminErr } = await supabase
    .from("user")
    .select("id, email")
    .eq("role", "ADMIN")
    .limit(1)
    .single();

  if (adminErr || !adminData) {
    console.error("❌ Admin tidak ditemukan:", adminErr?.message);
    process.exit(1);
  }
  console.log(`✅ Admin: ${adminData.email}\n`);

  const adminId = adminData.id;
  const now = new Date();
  const valuesToInsert: ContentInsert[] = [];

  // 10 Berita Paroki
  console.log("📝 Menyiapkan 10 Berita Paroki...");
  for (const b of BERITA) {
    const createdAt = new Date(now.getTime() - b.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    valuesToInsert.push({
      id: nanoid(),
      type: "NEWS",
      category: "Berita Paroki",
      title: b.title,
      slug: makeSlug(b.title),
      body: b.body,
      imageUrl: b.imageUrl,
      isPublished: true,
      createdBy: adminId,
      createdAt,
      updatedAt: createdAt,
    });
  }

  // 10 Pengumuman
  console.log("📢 Menyiapkan 10 Pengumuman...");
  for (const p of PENGUMUMAN) {
    const createdAt = new Date(now.getTime() - p.daysAgo * 24 * 60 * 60 * 1000).toISOString();
    valuesToInsert.push({
      id: nanoid(),
      type: "NEWS",
      category: "Pengumuman",
      title: p.title,
      slug: makeSlug(p.title),
      body: p.body,
      imageUrl: null,
      isPublished: true,
      createdBy: adminId,
      createdAt,
      updatedAt: createdAt,
    });
  }

  console.log(`\n⬆️  Memasukkan ${valuesToInsert.length} konten ke database...`);
  
  const { error: insertErr } = await supabase
    .from("contents")
    .insert(valuesToInsert);

  if (insertErr) {
    console.error("❌ Gagal insert:", insertErr.message);
    process.exit(1);
  }

  console.log("\n✅ Berhasil! Semua konten telah dimasukkan ke database.");
  console.log("\n📋 Ringkasan:");
  console.log(`   Berita Paroki  : 10 artikel`);
  console.log(`   Pengumuman     : 10 artikel`);
  console.log(`   Total          : 20 konten\n`);

  process.exit(0);
}

seedBeritaPengumuman().catch((err) => {
  console.error("❌ Error:", err);
  process.exit(1);
});
