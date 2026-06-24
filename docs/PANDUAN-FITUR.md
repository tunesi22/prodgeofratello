# Panduan Fitur Fratello

> Ringkasan seluruh fitur platform Fratello yang sudah tersedia saat ini.
> Dokumen ini ditujukan sebagai panduan produk dan dapat diekspor menjadi PDF.
>
> Versi: Juni 2026

---

## Daftar Isi

1. [Tentang Fratello](#1-tentang-fratello)
2. [Cara Kerja Singkat](#2-cara-kerja-singkat)
3. [Memulai: Masuk dan Pendaftaran](#3-memulai-masuk-dan-pendaftaran)
4. [Insight Brand](#4-insight-brand)
5. [Asisten Agen AI](#5-asisten-agen-ai)
6. [Rekomendasi](#6-rekomendasi)
7. [Distribusi dan Laporan](#7-distribusi-dan-laporan)
8. [Akun dan Pengaturan](#8-akun-dan-pengaturan)
9. [Paket Harga](#9-paket-harga)
10. [Kerangka GEO](#10-kerangka-geo)
11. [Status Fitur](#11-status-fitur)

---

## 1. Tentang Fratello

Fratello adalah platform GEO (Generative Engine Optimization). Tugasnya membantu
sebuah brand terlihat di jawaban AI. Saat calon pelanggan bertanya ke ChatGPT,
Gemini, Perplexity, atau Claude, Fratello mengukur seberapa sering brand Anda
disebut, lalu membantu menaikkan angka itu.

Ada empat hal utama yang Fratello kerjakan:

1. **Pelacakan.** Mengukur seberapa sering brand Anda muncul di berbagai model AI.
2. **Analitik.** Menghitung mention rate, share of voice, sentimen, dan tren dari
   waktu ke waktu.
3. **Pembuatan konten.** Membuat artikel yang dioptimalkan untuk AI berdasarkan
   celah yang ditemukan dari hasil pelacakan.
4. **Output siap publikasi.** Menghasilkan berkas markdown atau HTML yang dapat
   Anda terbitkan sendiri di situs Anda.

Pembeda utama Fratello dari kompetitor adalah otomatisasi. Proses yang biasanya
dikerjakan manual dijalankan oleh mesin (antrian pekerjaan, analisis semantik,
dan pelacakan distribusi).

---

## 2. Cara Kerja Singkat

**Multi-model.** Setiap pertanyaan diuji ke beberapa model AI sekaligus: ChatGPT
(OpenAI), Gemini, Perplexity, dan Claude (Anthropic).

**Lima kali per prompt.** Karena jawaban AI tidak selalu sama, setiap prompt
ditanyakan lima kali per model. Dari situ Fratello menghitung mention rate yang
lebih akurat:

```
mention rate = jumlah jawaban yang menyebut brand / total jumlah query x 100
```

Contoh: prompt "aplikasi padel terbaik di Indonesia" ditanyakan lima kali ke satu
model, dan brand Anda disebut tiga kali, maka mention rate-nya 60%.

**Unit yang dioptimalkan adalah pertanyaan, bukan kata kunci.** GEO mengejar
pertanyaan lengkap yang ditanyakan pengguna ke AI, bukan sekadar kata kunci
seperti pada SEO.

---

## 3. Memulai: Masuk dan Pendaftaran

### 3.1 Masuk (Sign In)

Halaman masuk meminta Email dan Password. Setelah berhasil masuk, Anda diarahkan
ke daftar brand. Jika akun Anda belum memiliki brand, Anda akan dibawa ke alur
penyiapan (onboarding) terlebih dahulu.

### 3.2 Pendaftaran Beta (Sign Up)

Halaman pendaftaran saat ini menampilkan layar "Welcome beta users". Akses masih
dibatasi untuk pengguna yang ada di waitlist. Layar dibagi dua:

- **Panel kiri:** identitas brand Fratello dengan kutipan fakta GEO yang berganti
  otomatis (tiga fakta bergiliran).
- **Panel kanan:** form Email, Password, dan Konfirmasi Password. Di bawah kolom
  Konfirmasi Password tampil daftar syarat password yang dicek langsung saat Anda
  mengetik: minimal 8 karakter, satu huruf kapital, satu angka, dan password yang
  cocok. Tombol "Buat akun" baru aktif setelah semua syarat terpenuhi.

Catatan status: pembuatan akun membutuhkan endpoint registrasi di backend yang
belum tersedia. Form dan validasinya sudah siap di sisi tampilan.

### 3.3 Penyiapan Brand (Onboarding)

Alur onboarding memandu Anda mengisi data brand pertama: nama, situs web,
industri, dan kompetitor. Setelah selesai, Fratello dapat langsung menyiapkan
prompt awal dan memulai scan pertama.

---

## 4. Insight Brand

Bagian ini berisi semua data hasil pelacakan untuk satu brand.

### 4.1 Ringkasan (Overview)

Halaman pertama setiap brand. Menampilkan ringkasan visibilitas brand Anda di AI,
misalnya "Brand Anda muncul di sekian persen jawaban AI", beserta indikator
kesegaran data (kapan terakhir diperbarui). Tujuannya memberi gambaran cepat
sebelum Anda menyelami detail.

### 4.2 Prompts

Pusat kerja utama. Semua pertanyaan yang Anda lacak ditampilkan dalam bentuk
tabel. Tiap baris adalah satu prompt, dengan kolom:

- **Visibilitas.** Persentase seberapa sering brand disebut untuk prompt itu,
  divisualkan sebagai cincin. Warnanya menunjukkan tingkat: hijau untuk tinggi
  (85% ke atas, sudah optimal), kuning untuk menengah (35% sampai 84%), dan merah
  untuk rendah (di bawah 35%).
- **Prompt.** Teks pertanyaannya.
- **Tipe.** Kategori atau intent pertanyaan.
- **Sentimen.** Nada penyebutan (positif, netral, negatif), divisualkan dengan
  diagram lingkaran.
- **Sebutan.** Berapa kali brand disebut.
- **Dibuat.** Tanggal prompt ditambahkan.

Setiap judul kolom memiliki tanda tanya yang menjelaskan arti kolom saat disorot.

**Cara pakai:**

- **Tambah prompt.** Lewat tombol "Buat Prompt", Anda dapat menambah prompt secara
  manual, membuat ulang (regenerate) kumpulan prompt, atau menjalankan riset
  pertanyaan.
- **Saring.** Gunakan kolom pencarian untuk mencari prompt, dan menu "Tipe" untuk
  menyaring berdasarkan kategori.
- **Lihat detail.** Klik salah satu baris untuk membuka panel detail yang muncul
  dari sisi kanan, berisi jawaban mentah dari tiap model.
- **Ekspor.** Tombol ekspor menyimpan data tabel.

### 4.3 Penyebutan Brand (Mentions)

Menampilkan setiap penyebutan brand yang ditemukan di jawaban AI, beserta
konteksnya. Ini adalah bukti mentah di balik angka mention rate. Indikator
kesegaran data juga ada di halaman ini.

### 4.4 Sitasi (Citations)

Menampilkan sumber dan URL yang dirujuk AI saat menyebut brand Anda (misalnya
tautan yang sering muncul di jawaban Perplexity). Status: segera hadir.

### 4.5 Analitik AI (Analytics)

Halaman analisis mendalam: mention rate, share of voice (porsi suara brand Anda
dibanding kompetitor), sentimen, dan tren dari waktu ke waktu dalam bentuk
grafik. Cocok untuk melihat perkembangan dan membandingkan posisi terhadap
kompetitor.

---

## 5. Asisten Agen AI

Kumpulan alat yang membantu Anda bertindak atas data, bukan hanya membacanya.

### 5.1 Riset Pertanyaan (AI Prompt Research)

Membantu menemukan pertanyaan baru yang relevan dengan brand dan industri Anda,
untuk ditambahkan ke daftar prompt yang dilacak. Ini memperluas cakupan
pelacakan ke pertanyaan yang benar-benar ditanyakan pengguna.

### 5.2 Tools Audit GEO

Kumpulan alat teknis untuk menyiapkan situs Anda agar lebih ramah terhadap AI,
antara lain:

- **Generator llms.txt.** Membuat berkas panduan untuk crawler AI.
- **Konfigurasi bot Nginx.** Pengaturan agar bot AI diizinkan mengakses konten
  Anda.
- **Skor GEO.** Audit kesiapan halaman (judul, schema.org, hierarki heading,
  canonical, Open Graph, kedalaman konten, dan lainnya).

### 5.3 Artikel AI

Membuat artikel yang dioptimalkan untuk AI berdasarkan celah dari hasil
pelacakan. Artikel yang sudah dibuat ditampilkan dalam tampilan grid berbentuk
kartu kotak. Setiap kartu menunjukkan judul, status (draf atau siap), dan tanggal,
serta tombol ekspor ke format .md atau .html. Klik kartu untuk membuka pratinjau
dari sisi kanan. Berkas hasilnya siap Anda terbitkan sendiri.

### 5.4 Basis Pengetahuan (Knowledge Base)

Tempat brand menyimpan panduan konten yang harus diikuti saat membuat artikel AI.
Anda dapat menambahkan entri berisi nama, panduan (misalnya gaya bahasa, fakta
brand, aturan penulisan), dan tautan folder opsional (misalnya Google Drive).
Entri tampil dalam grid kartu dan dapat dihapus.

Tujuannya agar artikel yang dibuat AI konsisten dengan suara dan fakta brand Anda.
Catatan status: saat ini entri tersimpan di perangkat (browser) Anda. Penyimpanan
permanen, unggah berkas, dan penggunaannya langsung saat pembuatan artikel masih
membutuhkan backend.

---

## 6. Rekomendasi

### 6.1 Naikkan Ranking AI (Boost)

Memberi saran tindakan konkret untuk menaikkan visibilitas brand Anda di AI,
disusun dari gabungan celah pelacakan, hasil audit, dan analisis semantik.

### 6.2 Daftar Tugas (To-Do)

Daftar pekerjaan yang sudah diprioritaskan agar Anda tahu apa yang sebaiknya
dikerjakan lebih dulu.

---

## 7. Distribusi dan Laporan

- **Distribusi.** Melacak penyebaran konten Anda ke platform tempat AI belajar
  (forum, percakapan publik, publikasi). Distribusi inilah yang menaikkan mention
  rate dalam jangka panjang.
- **Laporan.** Menyusun laporan metrik brand yang dapat dibagikan ke klien.
- **Semantik.** Menganalisis kedekatan semantik, yaitu seberapa dekat brand Anda
  muncul dengan konsep terkait di dalam korpus AI (misalnya brand distributor
  terigu sebaiknya muncul dekat dengan "grosir", "terpercaya", dan nama kota).

---

## 8. Akun dan Pengaturan

- **Pengaturan Akun.** Mengatur profil dan preferensi akun.
- **Tagihan dan Pemakaian.** Melihat paket berjalan dan memantau pemakaian.
- **Admin dan Kelola User.** Mengelola pengguna (untuk peran admin).
- **Pemilih Project.** Berpindah cepat antar brand, atau membuat brand baru.
- **Bahasa.** Seluruh antarmuka tersedia dalam Bahasa Indonesia dan Inggris.
- **Tema.** Mendukung mode terang dan gelap.

---

## 9. Paket Harga

| Paket | Prompts | Model | Artikel per bulan |
|---|---|---|---|
| Starter ($49) | 25 | 3 | 4 |
| Pro ($149) | 100 | semua | 8 |
| Agency ($399) | tanpa batas | semua | tanpa batas |

---

## 10. Kerangka GEO

GEO mengejar pertanyaan dan kedekatan semantik, bukan kata kunci seperti SEO.
Ada tiga lapis yang menjadi tulang punggung Fratello:

1. **Unit optimasi adalah pertanyaan.** Yang dilacak adalah pertanyaan lengkap
   beserta intent-nya, bukan sekadar kata kunci.
2. **Kedekatan semantik.** Brand harus muncul berdekatan dengan konsep terkait di
   dalam korpus AI, bukan hanya disebut namanya saja.
3. **Sumber dari percakapan dan publikasi.** AI belajar dari percakapan publik
   (forum, Reddit) dan dari artikel atau publikasi. Distribusi konten ke kanal
   inilah yang menaikkan mention rate.

---

## 11. Status Fitur

| Fitur | Status |
|---|---|
| Masuk (Sign In) | Aktif |
| Pendaftaran Beta (Sign Up) | Tampilan siap, butuh endpoint registrasi backend |
| Onboarding Brand | Aktif |
| Ringkasan (Overview) | Aktif |
| Prompts (tabel pelacakan) | Aktif |
| Penyebutan Brand (Mentions) | Aktif |
| Sitasi (Citations) | Segera hadir |
| Analitik AI | Aktif |
| Riset Pertanyaan | Aktif |
| Tools Audit GEO | Aktif |
| Artikel AI | Aktif |
| Basis Pengetahuan | Aktif (tersimpan lokal, butuh backend untuk permanen) |
| Naikkan Ranking AI (Boost) | Aktif |
| Daftar Tugas (To-Do) | Aktif |
| Distribusi, Laporan, Semantik | Aktif |

> Kebutuhan backend yang masih terbuka dirangkum di `docs/README-BACKEND.md`.
