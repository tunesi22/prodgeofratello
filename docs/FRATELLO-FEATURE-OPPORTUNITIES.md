# Fratello, Peluang Fitur Frontend

> **Khusus frontend.** Ini roadmap yang bisa dibangun oleh engineer frontend. Apa
> pun yang butuh endpoint, model, atau service baru TIDAK ada di sini; tugas backend
> yang jadi prasyaratnya dilacak di `docs/README-BACKEND.md`. Berdasarkan kode yang
> sebenarnya; pendamping `docs/README-SEO-PLAYBOOK.md`.

> **Status (15 Juni 2026):** semua item 🟢 "Bisa dibangun sekarang" di bawah sudah
> **rilis** (FN-1 sampai FN-7), kecuali FN-8 yang sengaja ditunda (lihat catatannya).
> Daftar 🟡 "Menunggu backend" (FB-x) masih menunggu endpoint di
> `docs/README-BACKEND.md`. Tidak ada kode backend yang disentuh saat membangun item 🟢.

## Cara membaca dokumen ini

- 🟢 **Bisa dibangun sekarang:** bisa dikerjakan dari endpoint/data yang sudah
  tersedia di frontend. Tanpa perubahan backend.
- 🟡 **Menunggu backend:** UI-nya bagian Anda, tetapi butuh endpoint backend dulu.
  Bangun tampilannya begitu dependensinya siap (lihat `README-BACKEND.md`).
- Tiap item mencantumkan masalah, apa yang *Anda* bangun, effort (S/M/L), dan
  dependensinya.

---

## 🟢 Bisa dibangun sekarang (tanpa perubahan backend)

Semua ini menyusun data yang sudah bisa diambil frontend.

### FN-1. Laporan klien, "Laporan Visibilitas AI" yang bisa dibagikan (cetak + PDF). Effort M, nilai tinggi.
`GET /brands/{id}/analytics` sudah mengembalikan semua yang dibutuhkan laporan klien:
mention rate keseluruhan, per model, sebaran sentimen, tren 12 minggu, dan tabel
gaps. Saat ini satu-satunya ekspor hanya md/html per artikel. Bangun tampilan
**laporan bertanggal** yang rapi dan berlabel brand dengan stylesheet cetak (dan/atau
ekspor PDF dari sisi klien). Halaman Ringkasan bahkan sudah disebut "AI Visibility
Report Card." Ini deliverable untuk agensi; sekarang seorang spesialis terpaksa
screenshot. *Nanti:* tren jangka panjang yang lebih kaya setelah backend menyimpan
riwayat (FB-2).

### FN-2. Dashboard portofolio multi-brand. Effort M, nilai tinggi (paket Agency).
`/brands` cuma grid kartu datar. Halaman Pemakaian sudah membuktikan pola mengambil
data per brand di sisi klien. Bangun **roll-up portofolio**: ambil `/analytics` tiap
brand, lalu tampilkan rata-rata mention rate antar klien, siapa yang turun minggu ini
(week-over-week per brand), dan siapa yang perlu perhatian (rate terendah / gaps
terbanyak). Agregasi murni di sisi klien (beberapa panggilan analytics, sama seperti
yang dilakukan halaman Pemakaian sekarang). *Nanti:* endpoint roll-up khusus lebih
rapi saat skala besar (dilacak di dokumen backend), tetapi v1 yang nyata bisa rilis
sekarang.

### FN-3. Antrian aksi "Lakukan Berikutnya". Effort M, nilai tinggi (janji inti produk).
Setiap sinyal yang dibutuhkan spesialis sudah bisa diambil, hanya tersebar di empat
halaman. Susun semuanya **di sisi klien** menjadi satu daftar kerja berperingkat di
Ringkasan (atau halaman baru): gaps konten (dari `/analytics`), pemeriksaan audit GEO
yang gagal (panggil `/brands/{id}/articles/tools/geo-score` pada website brand), dan
celah semantik (panggil `/brands/{id}/analytics/semantic-proximity`). Urutkan
berdasarkan dampak dan tampilkan sebagai satu checklist: "1) perbaiki 3 pemeriksaan
audit berdampak tinggi ini, 2) buat konten untuk 'best X Jakarta' (0% sebutan),
3) publikasikan ke target ini." Inilah janji "otomatis vs manual" yang diwujudkan,
dan komposisi/peringkatnya adalah nilainya, semuanya frontend.

### FN-4. Scan pertama terpandu setelah onboarding. Effort S, nilai tinggi.
Brand yang baru dibuat menampilkan analytics kosong sampai spesialis membuat prompts
secara manual lalu menjalankan scan, dan teks setup secara keliru menyiratkan prompts
dibuat otomatis. Bangun alur pasca-onboarding terpandu: masuk ke brand, **buat prompts
sekali klik**, lalu **jalankan scan pertama** (frontend sudah bisa
`POST /brands/{id}/scan`) dan tampilkan keadaan "hasil pertama dalam beberapa menit."
Mengubah dashboard kosong yang membingungkan menjadi langkah awal yang terpandu.

### FN-5. Tampilkan jumlah sebutan se-brand yang sebenarnya di Jawaban AI. Effort S.
Kartu ringkasan Jawaban AI ("Disebut / Tidak disebut") hanya menghitung halaman saat
ini (memang diberi keterangan "halaman ini," tetapi tetap menyesatkan di sebelah
"Total Jawaban"). Frontend sudah punya total se-brand dari `/analytics`
(`overall.mentionCount` / `totalQueries`). Ganti hitungan per halaman dengan angka
se-brand yang sebenarnya agar ketiga kartu konsisten.

### FN-6. Indikator cakupan pool prompt. Effort S.
Halaman Prompts sudah mengelompokkan per kategori dan tahu jumlah per kategori.
Tambahkan **strip cakupan** kecil yang menunjukkan kategori mana dari 6 intent
(discovery, comparison, recommendation, use-case, best-of, organic) yang sudah
tercakup dan seberapa tipis tiap kategori, supaya spesialis langsung melihat "Anda
belum punya prompt comparison." Murni menampilkan data yang sudah ada di halaman itu.

### FN-7. Perbaikan kejujuran onboarding. Effort S.
- Layar setup berkata "kami otomatis membuat prompts," yang **keliru** (prompts tidak
  dibuat otomatis). Perbaiki teksnya, atau pasang FN-4 supaya jadi benar.
- Editor kompetitor mengumpulkan `domain` + "include all subdomains," tetapi hanya
  nama yang disimpan (backend masih `string[]`). Sampai schema yang lebih kaya siap
  (dokumen backend), sembunyikan dua field itu atau tandai "segera hadir" supaya UI
  berhenti menjanjikan penyimpanan yang tidak terjadi.

### FN-8. Konsistensi label menu vs route. Effort S, kosmetik. (DITUNDA)
Beberapa label sidebar tidak cocok dengan route-nya (Citations ke `/results`, Boost
ke `/semantic`, To-Do ke `/distribution`). **Sengaja
ditunda:** label-label itu nama produk yang disengaja (mis. "Boost your AI Ranking"
adalah pilihan yang dikehendaki), dan mengganti nama route akan merusak deep link yang
sudah ada (link "Buat konten" dari analytics ke `/articles?promptId=`, filter Jawaban
AI, bookmark). Ketidakcocokan ini hanya terlihat oleh developer, bukan pengguna, jadi
keputusan yang tepat adalah membiarkannya. Tinjau ulang hanya jika route ditata ulang
karena alasan lain.

> **Sudah selesai (jangan diulang):** checklist Panduan Awal sudah terhubung ke sinyal
> nyata. `useGettingStartedProgress` menghitung `done` dari fetch nyata `hasProject` /
> `hasPrompts` / `hasResults` (`frontend/lib/useActiveProject.ts:87-124`). Tidak perlu
> dikerjakan lagi.

---

## 🟡 Bangun UI-nya saat endpoint backend siap

UI-nya pekerjaan frontend, tetapi tiap item butuh endpoint backend dulu. Bangun
tampilannya begitu dependensinya (di `README-BACKEND.md`) siap.

### FB-1. Tabel perbandingan kompetitor / Share of Voice sungguhan. Effort M.
Saat ini "Sebaran Visibilitas Brand" membandingkan project Anda sendiri. Ketika backend
men-scan kompetitor dan mengembalikan SoV sungguhan, bangun **tampilan perbandingan
kompetitor** (mention rate vs tiap kompetitor, per model) dan ganti label chart kembali
ke SoV yang sesungguhnya. *Bergantung pada:* scanning kompetitor + endpoint SoV di
backend (README-BACKEND, "Share of Voice vs kompetitor" + schema kompetitor).

### FB-2. Skor / visibilitas dari waktu ke waktu. Effort M.
Ketika backend menyimpan snapshot per scan (mention rate, SoV, sentimen, skor GEO),
bangun **tampilan "progres dari waktu ke waktu"** dan masukkan ke laporan klien (FN-1)
supaya Anda bisa menunjukkan "garisnya naik sejak Anda dipekerjakan." *Bergantung
pada:* penyimpanan snapshot visibilitas di backend (README-BACKEND, baru).

### FB-3. Matriks performa per-prompt per-model. Effort S-M.
Analytics hanya menampilkan gaps (prompt di bawah 20%). Ketika backend mengembalikan
mention rate per prompt **per model**, bangun matriks yang bisa diurutkan: satu prompt
bisa 80% di Perplexity dan 0% di ChatGPT, dan itu mengubah seluruh strategi.
*Bergantung pada:* rate per-prompt-per-model di backend (README-BACKEND, "Mention rate
per prompt", yang sekarang sudah menyebut breakdown per-model yang dibutuhkan FB-3).

### FB-4. Progres scan sungguhan (status, bukan polling). Effort M.
Ganti hack "polling `/analytics` dan menghitung baris" beserta batas menyerah ~6 menit
dengan consumer progres sungguhan (selesai / gagal / berjalan). *Bergantung pada:*
endpoint status scan di backend (README-BACKEND, "Status penyelesaian scan").

### FB-5. UI manajemen prompt (bulk + per-prompt). Effort S-M.
Saat ini tidak ada edit/hapus/pause per prompt; satu-satunya pilihan adalah generate
ulang semua (yang menghapus semuanya, termasuk prompt impor). Bangun **pilih banyak
untuk pause / aktifkan / hapus** dan kontrol per prompt. *Bergantung pada:* endpoint
mutasi prompt di backend. Toggle `isActive` sudah diminta; perlu juga hapus + bulk +
flag list `includeInactive` (README-BACKEND).

### FB-6. Tampilan Sitasi / Sumber. Effort M, pembeda.
Response LLM mentah (termasuk sitasi inline Perplexity) sudah tersimpan tetapi belum
ada yang menampilkannya. Ketika backend mengekstrak sitasi, bangun **tampilan "dari
mana AI mengambil jawabannya"**: domain yang dikutip, dan sumber mana yang dikutip
*alih-alih* brand Anda. Ini tampilan GEO paling actionable sekaligus pembeda sejati.
*Bergantung pada:* endpoint ekstraksi sitasi di backend (README-BACKEND, baru).

### FB-7. Heat map cakupan intent prompt. Effort S.
Heat map mention rate per intent ("kuat di discovery, tak terlihat di comparison").
*Bergantung pada:* agregasi mention rate per-intent di backend (README-BACKEND, baru).
*(Versi kasar mungkin bisa dari sisi klien begitu rate per-prompt dari FB-3 ada, karena
tiap prompt membawa kategorinya.)*

### FB-8. Mode "brief" konten (Artikel AI). Effort S-M.
Tambahkan toggle "brief" di halaman Artikel AI: alih-alih artikel jadi 600 sampai 900
kata, tampilkan brief (query target, intent, konsep yang harus muncul, sudut
kompetitor, kerangka FAQ) yang bisa dipakai penulis. *Bergantung pada:* mode generate
brief di backend (README-BACKEND, baru).

### FB-9. Antrian distribusi terbantu. Effort M.
Ubah halaman Distribusi dari log manual menjadi **antrian** yang dikerjakan: draft
snippet siap pakai per target + status pengiriman. *Bergantung pada:* generate draft
per platform di backend (README-BACKEND, baru). *(Pelacakan status pengiriman bisa
disimpan di sisi frontend sebagai versi awal.)*

### FB-10. Analisa website onboarding sungguhan. Effort M.
Layar "Menganalisa website anda..." adalah mock 2,2 detik yang mengisi kompetitor palsu
secara otomatis. Ketika `POST /brands/suggest-competitors` ada, hubungkan dan tampilkan
kompetitor + industri yang disarankan secara nyata. *Bergantung pada:* endpoint
suggest-competitors di backend (sudah disebut di README-BACKEND).

> **Tanpa pekerjaan frontend:** pemeriksaan audit GEO baru (robots.txt, tipe schema,
> kesegaran, dll) tampil otomatis karena daftar checks bersifat generik. Ketika backend
> menambahkannya, satu-satunya sentuhan frontend adalah menambahkan terjemahan Indonesia
> untuk label/rekomendasi baru di peta copy halaman tools.

---

## Yang sudah rilis ronde ini (di mana diterapkan)

| Item | Lokasinya |
|---|---|
| **FN-1 Laporan klien** | route baru `/brands/[id]/report` (Cetak / Simpan PDF lewat dialog browser; CSS cetak di `app/globals.css`) + tombol "Laporan" di header Analitik |
| **FN-2 Dashboard portofolio** | Semua Project (`/brands`): kartu statistik ringkasan + mention rate dan WoW per brand di tiap kartu, di-roll-up dari sisi klien |
| **FN-3 Antrian aksi** | `components/dashboard/ActionQueue.tsx`, di Ringkasan brand: mengurutkan gaps konten + pemeriksaan audit yang gagal + celah semantik menjadi satu checklist berprioritas |
| **FN-4 Scan pertama terpandu** | tombol "Siapkan otomatis" di keadaan kosong Ringkasan (membuat prompts, lalu menjalankan scan pertama) |
| **FN-5 Hitungan se-brand** | kartu ringkasan Jawaban AI sekarang membaca dari `/analytics`, bukan halaman saat ini |
| **FN-6 Indikator cakupan** | halaman Prompts: strip 6 intent dengan jumlahnya, kategori kosong ditampilkan putus-putus |
| **FN-7 Kejujuran onboarding** | memperbaiki teks "auto prompts" yang keliru di `/brands/new` |

Berikutnya, saat developer backend merilis endpoint, ambil daftar 🟡. **FB-6 (sitasi)**
dan **FB-1 (SoV kompetitor sungguhan)** adalah yang paling berdampak begitu terbuka.

---

## Yang diteruskan ke developer backend

Pekerjaan backend yang jadi prasyarat fitur-fitur ini ada di `docs/README-BACKEND.md`.
Item baru yang ditambahkan di sana ronde ini (di luar yang sudah dilacak): snapshot
visibilitas yang dipersist (untuk FN-1/FB-2), ekstraksi sitasi/sumber (FB-6), agregasi
per-intent (FB-7), hapus/bulk prompt + `includeInactive` (FB-5), generate brief konten
(FB-8), generate draft per platform (FB-9), penautan artikel ke publikasi + jendela
dampak yang bisa diatur, perbaikan lookup alert yang mati + pemasangan plan gating, plus
endpoint opsional roll-up portofolio + "do this next". Yang sudah dilacak di sana (tidak
diduplikasi): schema kompetitor + scanning + SoV sungguhan, endpoint status scan, toggle
`isActive`, mention rate per prompt, pemeriksaan audit GEO, suggest-competitors, dan
granularity tren.
