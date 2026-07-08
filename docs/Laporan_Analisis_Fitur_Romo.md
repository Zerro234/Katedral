# Analisis Implementasi Fitur Romo/Pastor pada Source Code

Berdasarkan pengecekan faktual langsung ke dalam struktur *source code* (termasuk *schema* database, API, dan komponen *User Interface* admin), berikut adalah jawaban dari setiap pertanyaan Anda:

### 1. Keberadaan Fitur
**Apakah dalam sistem saat ini sudah ada fitur bagi Admin Sekretariat untuk menentukan/menetapkan Romo/Pastor?**
**Sudah ada.** Fitur ini telah diimplementasikan sepenuhnya secara fungsional di sisi *backend* maupun *frontend* panel admin.

### 2. Detail Implementasi Fitur (Karena Sudah Ada)
- **Di halaman atau komponen mana fitur itu berada?**
  Fitur ini berada di halaman Detail Pendaftaran Admin (`app/admin/pernikahan/[id]/page.tsx`) dan dikendalikan oleh komponen `DetailClient.tsx` (tepatnya pada bagian _card_ antarmuka bertuliskan **"Penugasan Romo"**).
- **Bagaimana alurnya dari sisi admin?**
  Admin membuka halaman detail dari pendaftaran calon pengantin tertentu. Di sana terdapat menu _dropdown_ (kotak pilihan) yang otomatis menampilkan daftar nama Romo. Admin memilih salah satu nama Romo, lalu mengklik tombol **"Simpan Penugasan"**. Komponen akan mengirim *request* HTTP (POST) berisikan `action: "ASSIGN_PRIEST"` ke *endpoint* API `/api/admin/pernikahan`.
- **Data apa yang disimpan ketika admin memilih Romo/Pastor?**
  Sistem menyimpan ID unik (string/UUID) milik akun Romo yang dipilih tersebut.
- **Apakah data tersebut disimpan ke field seperti `priestId`?**
  **Benar.** ID tersebut disimpan secara relasional ke kolom `priestId` pada tabel `marriage_applications` di database.

### 3. (Dilewati, karena fitur sudah ada)

### 4. Sumber Daftar Romo/Pastor
**Dari mana sumber daftar Romo/Pastor seharusnya diambil?**
Daftar Romo diambil secara **dinamis dari akun user dengan role `PRIEST`**. Pada file `lib/db/schema.ts`, tabel pengguna (users) memiliki batasan atribut `role` yaitu `"COUPLE" | "ADMIN" | "PRIEST"`. Saat halaman Admin Detail dirender, sistem akan melakukan *query* ke tabel `users` untuk memfilter dan menarik semua akun yang memiliki _role_ `PRIEST`, kemudian memasukkannya ke dalam daftar pilihan (_dropdown_) admin.

### 5. Posisi Romo/Pastor dalam Konteks Laporan
Berdasarkan kondisi source code saat ini, posisi yang paling akurat adalah:
**b. Romo/Pastor bukan aktor aktif, hanya pihak yang ditetapkan oleh Admin.**
*Alasan Faktanya:* Meskipun Romo memiliki peran (_role_) yang terdefinisi di database (`PRIEST`) sehingga identitasnya bisa dilacak, tidak ada satupun *source code* halaman dasbor atau antarmuka khusus (seperti `/dasbor-romo`) yang dibuat agar Romo bisa *login* lalu melakukan *approve/reject* sendiri. Seluruh aktivitas administratif, termasuk menetapkan jadwal dan menetapkan siapa Romo yang bertugas, dikerjakan secara pasif (sepihak) oleh pengguna berstatus **Admin Sekretariat**.

### 6. Rekomendasi Penulisan Laporan (Sangat Aman & Faktual)
- **Batasan Masalah:**
  _"Pada sistem ini, penugasan Romo/Pastor dilakukan oleh Admin Sekretariat secara mandiri di dalam sistem. Romo/Pastor bertindak sebagai entitas pendukung yang ditugaskan dan tidak memiliki sistem antarmuka khusus (aktor pasif)."_
- **Use Case Diagram:**
  Romo/Pastor **TIDAK PERLU digambar sebagai Aktor (stickman) di luar sistem** jika mereka tidak berinteraksi langsung (login/mengklik tombol) dengan sistem. Aktor utamanya hanyalah `Calon Pengantin` dan `Admin Sekretariat`. Buatlah satu bulatan Use Case bernama *"Mendaftarkan/Menugaskan Romo"*, lalu tarik garis *association* hanya ke aktor **Admin Sekretariat**.
- **Activity Diagram (Proses Verifikasi):**
  Dalam garis (_swimlane_) Admin Sekretariat, tambahkan *action state*: `[Memilih nama Romo dari daftar]` ➡️ `[Menekan tombol simpan penugasan]`. Sistem akan merespons di *swimlane* Sistem: `[Memperbarui data priestId pada database]`. Tidak ada *swimlane* khusus untuk Romo.
- **Sequence Diagram (Verifikasi Admin):**
  Aktor _Admin_ ➡️ _Detail_FormUI_: memilih romo dan submit.
  _Detail_FormUI_ ➡️ _API_Pernikahan_: mengirim request POST (action: ASSIGN_PRIEST).
  _API_Pernikahan_ ➡️ _Database_: UPDATE table `marriage_applications` SET `priestId`.
  _API_Pernikahan_ ⬅️ _UI_: Response Success.
- **BAB IV Implementasi:**
  Di pembahasan antarmuka, Anda bisa menampilkan *screenshot* halaman Detail Pendaftaran Admin yang menyorot bagian Dropdown "Penugasan Romo". Sebutkan bahwa dropdown ini terisi secara dinamis dengan me-*retrieve* data dari tabel `users` yang memiliki kondisi `role = 'PRIEST'`.

### 7. (Dilewati, karena fitur sudah selesai dan bisa langsung ditulis sesuai rekomendasi di atas)
