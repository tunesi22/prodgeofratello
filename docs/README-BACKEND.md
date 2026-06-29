# Catatan Backend untuk UI Baru (Onboarding + Design System)

Dokumen ini untuk developer backend. Isinya apa yang frontend butuhkan dari backend
agar fitur onboarding dan halaman UI baru berjalan. Bagian frontend sudah selesai dan
sudah dites end to end. Yang belum selesai di sisi backend ada di bagian "Yang perlu
diperbaiki".

## Pembagian kerja

- Frontend (folder `frontend/`): dikerjakan bersama user. Mohon tidak diubah dari sisi backend.
- Backend (folder `backend/`): milik Anda. Frontend hanya memanggil API yang sudah ada,
  frontend tidak akan mengubah route, model, atau middleware backend.

## Cara frontend memanggil backend

- Semua request lewat prefix `/api`. Di mode development, Next.js mem-proxy `/api/*`
  ke `http://localhost:4000/api/*` (lihat `frontend/next.config.ts`). Di production,
  Nginx yang mem-proxy ke backend port 4000.
- Auth memakai cookie. Login menyetel cookie `geo_token` (JWT). Setiap request frontend
  mengirim `credentials: 'include'` agar cookie ikut terbawa.
- Format selalu JSON. Jika terjadi error, frontend membaca field `error` dari body
  (contoh: `{ "error": "Email atau password salah." }`).

## Endpoint yang dipakai UI baru

### 1. Login
`POST /api/auth/login`

Request body:
```json
{ "email": "user@example.com", "password": "rahasia" }
```
Sukses: menyetel cookie `geo_token`, mengembalikan `{ "ok": true }`.
Gagal: status 401, body `{ "error": "Email atau password salah." }`.

### 2. Ambil data user yang lagi login
`GET /api/auth/me`

Mengembalikan object user tanpa `passwordHash`. Dipakai untuk menampilkan email dan plan.

### 3. Logout
`POST /api/auth/logout`

Menghapus cookie, mengembalikan `{ "ok": true }`.

### 4. List brand milik user
`GET /api/brands`

Mengembalikan array brand milik user yang sedang login (bisa kosong `[]`).
Frontend memakai ini untuk menentukan user baru atau bukan: jika hasilnya kosong,
user diarahkan ke halaman `/onboarding`. Jika sudah ada brand, langsung ke `/brands`.

### 5. Membuat brand (output akhir onboarding)
`POST /api/brands`

Request body yang dikirim frontend di akhir onboarding:
```json
{
  "name": "Relco",
  "website": "https://relcobakingshop.com",
  "industry": "Toko Kue",
  "competitors": ["Unilever", "Maju Bersama"]
}
```
Catatan field:
- `name`: nama brand, wajib.
- `website`: frontend selalu mengirim dengan `https://` di depan. Wajib.
- `industry`: satu string. Bisa dari pilihan yang tersedia, atau ketikan bebas user.
- `competitors`: array string, boleh kosong, maksimal 3 dari sisi UI.

Sukses: status 201, mengembalikan object brand yang baru dibuat.
Gagal validasi: status 400 dengan field `error`.

### Catatan: kompetitor butuh schema yang lebih kaya (TODO backend)

Di UI, tiap kompetitor sekarang punya 3 data: `name`, `domain`, dan
`includeSubdomains` (toggle untuk memantau semua subdomain). Namun model `Brand`
saat ini hanya menyimpan `competitors: [String]`, jadi frontend baru mengirim nama
saja agar tidak error. Data `domain` dan `includeSubdomains` belum tersimpan.

Jika Anda siap, ubah schema `competitors` menjadi array object:
```js
competitors: [{
  name: { type: String, required: true },
  domain: { type: String, default: '' },
  includeSubdomains: { type: Boolean, default: false },
}]
```
Beri tahu jika sudah, nanti frontend mengirim object penuh, bukan hanya nama.

Tambahan: kompetitor di onboarding sekarang di-"autofill" 3 brand dari sisi
frontend (mock), karena belum ada backend yang menganalisa website sungguhan. Jika
nanti ada endpoint analisa (misal `POST /api/brands/suggest-competitors` yang
menerima website dan mengembalikan daftar kompetitor), frontend tinggal memanggilnya
saat layar "Menganalisa website anda...".

### 6. Setting user (halaman Settings)
`GET /api/user/me` dan `PATCH /api/user/me`

Dipakai untuk preferensi alert (threshold, email, whatsapp). Bagian tema light/dark
di Settings murni frontend, tidak menyentuh endpoint ini.

## Alur onboarding (urutan pemanggilan)

1. User login lewat `POST /api/auth/login`.
2. Frontend memanggil `GET /api/brands`. Jika kosong, masuk `/onboarding`.
3. User mengisi 4 langkah: nama brand, website, industri, kompetitor. Semua state ini
   disimpan di frontend dulu, belum ada pemanggilan ke backend.
4. Saat user menekan "Selesai", frontend baru memanggil `POST /api/brands` satu kali
   dengan semua data tersebut.
5. Jika sukses, frontend menampilkan layar "Semua siap" lalu redirect ke `/brands`.
   Jika gagal, frontend menampilkan pesan error dan tombol coba lagi.

## Yang perlu diperbaiki di backend

Saat tes onboarding, terjadi `POST /api/brands` gagal dengan pesan:
`Brand validation failed: userId: Path 'userId' is required.`

Akarnya di `backend/src/middleware/auth.ts`. Middleware menyetel
`req.userId = user.clerkUserId`. Ini sisa dari Clerk yang sudah dicabut. Jika user
tidak punya `clerkUserId`, `req.userId` menjadi kosong, padahal `Brand.userId` wajib,
sehingga pembuatan brand gagal.

Saran perbaikan (pilih salah satu, Anda yang paling tahu dampaknya ke data lama):
- Ganti `req.userId = user.clerkUserId` menjadi `req.userId = user._id.toString()`, lalu
  pastikan semua query brand konsisten memakai id yang sama.
- Atau, pastikan setiap user selalu memiliki `clerkUserId` yang terisi saat register.

Frontend tidak mengubah apa pun soal ini. Keputusan ada di Anda karena menyangkut
bagaimana data brand lama disimpan.

## Model data terkait (untuk referensi)

Brand (`backend/src/models/Brand.ts`):
```
userId: string (wajib, index)
name: string (wajib)
website: string (wajib)
industry: string (wajib)
competitors: string[] (default [])
scanFrequency: 'manual' | 'daily' | 'weekly' (default 'manual')
lastScannedAt?: Date
createdAt, updatedAt (otomatis)
```

User (`backend/src/models/User.ts`), field penting:
```
clerkUserId: string (wajib, unique)  <- lihat bagian "Yang perlu diperbaiki"
email: string
plan: 'starter' | 'pro' | 'agency'
isAdmin: boolean
passwordHash?: string
lastActiveAt?: Date
```

## Yang sudah ditangani frontend (tidak perlu disiapkan di backend)

- Tema light dan dark, ganti bahasa Indonesia dan Inggris, semua animasi.
- Validasi input di UI (cek format website, batas 3 kompetitor, tombol nonaktif
  jika kolom wajib masih kosong).
- Penyimpanan state antar langkah onboarding sebelum disubmit.

Jadi backend cukup menyediakan endpoint di atas dan memperbaiki masalah `userId`.
Sisanya sudah ditangani di frontend.

## Analitik & dashboard: yang butuh dukungan backend (TODO)

Frontend dashboard analitik sudah diperkaya (visualisasi baru, tabel sortable,
report card, feedback scan). Beberapa hal berikut mentok di data backend dan
butuh perubahan dari Anda. Sampai itu ada, frontend memakai pendekatan
sementara yang sudah dijelaskan.

1. **Share of Voice vs kompetitor.** `getShareOfVoice` membandingkan brand milik
   user yang sama (antar project), bukan kompetitor yang diisi saat onboarding
   (`brand.competitors` hanya nama, tidak pernah di-scan). Sementara ini chart
   di-relabel jujur menjadi "Sebaran Visibilitas Brand (antar project Anda)".
   Untuk SoV kompetitor sungguhan: scan brand kompetitor (mis. buat QueryResult
   untuk nama kompetitor), atau tambah endpoint yang menghitung sebutan
   kompetitor.

2. **Status penyelesaian scan.** `POST /brands/{id}/scan` hanya mengembalikan
   `jobsEnqueued`; tidak ada cara tahu kapan job selesai. Sementara frontend
   polling `GET /brands/{id}/analytics` dan menghitung sampai `totalQueries`
   mencapai `baseline + jobsEnqueued`. Lebih baik: endpoint status scan
   (mis. `GET /brands/{id}/scan/status` -> {pending, done, failed}) atau
   SSE/websocket. Ini menghemat polling dan lebih akurat (termasuk job gagal).

3. **Toggle prompt aktif/nonaktif.** Model `Prompt` punya `isActive`, tapi tidak
   ada endpoint untuk mengubahnya. Tambahkan `PATCH /brands/{id}/prompts/{promptId}`
   `{ isActive }` agar user bisa menonaktifkan prompt tanpa menghapusnya.

4. **Jumlah scan per bulan (halaman Pemakaian/Usage).** Quota saat ini hanya
   prompts/artikel/model. Kalau ingin menampilkan "scan bulan ini X / limit",
   backend perlu menyimpan dan mengembalikan jumlah scan per periode.

5. **Rentang waktu tren lebih panjang.** `getTrends` dibatasi 12 minggu terakhir.
   Untuk filter rentang (mis. 3 bulan, 12 bulan, semua), terima parameter
   rentang atau naikkan limit.

6. **Mention rate per prompt (semua prompt), dipecah per model.**
   `getFullAnalytics` hanya mengembalikan `gaps` (prompt < 20%). Untuk tabel
   performa SEMUA prompt yang bisa diurutkan, sediakan mention rate per prompt
   untuk seluruh prompt (bukan hanya yang gap). PENTING: pecah per model
   (`promptId` x `model`), bukan hanya agregat per prompt, karena frontend ingin
   matriks per-prompt-per-model (FB-3): satu prompt bisa 80% di Perplexity dan 0%
   di ChatGPT, dan itu mengubah strateginya total.

## Keamanan: temuan audit (prioritas tinggi, semua di backend)

Bagian ini hasil audit keamanan menyeluruh pada 14 Juni 2026. Semua temuan di
bawah ada di folder `backend/` dan menjadi tanggung jawab Anda. Frontend tidak
mengubah apa pun di sini. Urutan sesuai tingkat keparahan. Temuan nomor 1 sampai
6 dapat dieksploitasi sekarang oleh user mana pun yang sudah login.

### 1. KRITIS: Broken access control (IDOR) di semua route turunan brand

`requireAuth` hanya memastikan ada user yang login, tetapi tidak memastikan
brand pada `:id` milik user tersebut. Hanya `brand.routes.ts` yang memeriksa
kepemilikan (`findOne({ _id, userId })`). Semua router turunan mengambil dan
mengubah data berdasarkan `:id` mentah tanpa filter `userId`, sehingga user mana
pun bisa membaca dan mengubah data brand milik tenant lain hanya dengan menebak
atau menyebutkan ObjectId brand tersebut.

Route yang terdampak (tidak ada cek kepemilikan):
- `backend/src/routes/scan.routes.ts` baris 18, 32, 61 (scan, results, mention-rate).
  Catatan: `results` juga rentan injeksi operator (lihat nomor 5).
- `backend/src/routes/analytics.routes.ts` baris 13, 24, 36, 47, 58 (analytics,
  gaps, trends, semantic-proximity, cooccurrence).
- `backend/src/routes/article.routes.ts` (list, generate, get, export, tools).
- `backend/src/routes/publication.routes.ts` (list, impact, create, delete).
- `backend/src/routes/prompt.routes.ts` baris 46, 77 (generate, list).

Perbaikan yang disarankan: buat satu middleware penjaga kepemilikan yang
dipasang di `/api/brands/:id*`. Middleware ini menjalankan
`Brand.findOne({ _id: req.params.id, userId: req.userId })`, mengembalikan 404
jika tidak ditemukan, lalu menempelkan brand ke `req`. Tambahan: untuk lookup
berbasis id daun (articleId, pubId, promptId), scope juga ke brand yang sudah
diverifikasi agar id daun tidak bisa lintas brand.

### 2. KRITIS: PATCH pengaturan analytics mengubah brand mana pun

`backend/src/routes/analytics.routes.ts` baris 69 sampai 87. Handler memakai
`Brand.findByIdAndUpdate(req.params.id, ...)` tanpa filter `userId`, sehingga
user mana pun dapat mengubah frekuensi scan brand yang bukan miliknya.
Perbaikan: `Brand.findOneAndUpdate({ _id: req.params.id, userId: req.userId }, ...)`.

### 3. KRITIS: Import prompt menulis ke brand mana pun

`backend/src/routes/prompt.routes.ts` baris 26 sampai 43. Berbeda dengan
`/discover` (yang sudah cek kepemilikan), `/import` menyisipkan prompt memakai
`brandId = req.params.id` tanpa cek kepemilikan. Perbaikan: verifikasi
`Brand.findOne({ _id, userId })` sebelum `insertMany`.

### 4. KRITIS: Webhook Midtrans tanpa verifikasi tanda tangan

`backend/src/services/payment.service.ts` baris 112 sampai 125
(`handleMidtransWebhook`). Handler membaca `transaction_status` dan
`metadata.plan` langsung dari body POST yang tidak terautentikasi, lalu
menaikkan plan user. Siapa pun bisa mengirim
`{ transaction_status: "settlement", metadata: { clerkUserId, plan: "agency" } }`
untuk mendapatkan plan tertinggi secara gratis. Bandingkan dengan handler
Stripe yang sudah benar memakai `constructEvent` dengan webhook secret.

Perbaikan: verifikasi `signature_key` Midtrans, yaitu
SHA512(`order_id + status_code + gross_amount + ServerKey`), sebelum mempercayai
payload. Jangan ambil plan dari `metadata`, turunkan plan dari `order_id` yang
sudah diverifikasi.

### 5. TINGGI: SSRF di GEO audit dan injeksi operator NoSQL

SSRF: `backend/src/services/audit.service.ts` baris 102 sampai 124.
`runGEOAudit(url)` memanggil `axios.get(url)` pada URL kiriman user tanpa daftar
izin skema atau host, dan mengikuti redirect default. Penyerang bisa menargetkan
layanan internal dan metadata cloud, misalnya `http://169.254.169.254/...`,
`http://localhost:27017`. Fetch `llms.txt` di baris 122 memperparah hal ini.
Perbaikan: wajibkan skema http atau https, resolve DNS lalu tolak rentang
privat, loopback, dan link-local, set `maxRedirects: 0`, lalu validasi ulang IP
hasil resolve. Terapkan juga pada fetch `llms.txt`.

Injeksi operator NoSQL: `backend/src/routes/scan.routes.ts` baris 35 sampai 40.
Parameter `model` dari `req.query` dimasukkan langsung ke filter Mongo
(`filter.model = model`). Karena Express mengurai `?model[$ne]=x` menjadi objek,
penyerang bisa menyisipkan operator (`$ne`, `$gt`, `$regex`). Perbaikan:
whitelist `model` terhadap `LLM_MODELS` dan paksa semua parameter query menjadi
string. Pertimbangkan memasang `express-mongo-sanitize` secara global.

### 6. TINGGI: Tidak ada proteksi brute force pada login

`backend/src/routes/auth.routes.ts` baris 16 hanya mengandalkan limiter global
(200 request per 15 menit per IP di production). Angka ini terlalu longgar untuk
password spraying dan credential stuffing, dan tidak ada penguncian per akun.
Perbaikan: tambahkan rate limiter ketat khusus `/login` (misal 5 sampai 10 per
15 menit per IP dan per email) serta penguncian atau backoff per akun.

### Catatan tambahan (defense in depth, prioritas menengah dan rendah)

- Cookie `geo_token` sudah benar memakai `httpOnly`, `secure` di production, dan
  `sameSite: 'lax'`. Karena `sameSite: 'lax'`, request POST, PATCH, dan DELETE
  lintas situs sudah diblokir browser, jadi risiko CSRF kecil. Token CSRF hanya
  perlu sebagai lapisan tambahan, tidak mendesak.
- JWT berumur 30 hari tanpa mekanisme pencabutan. Logout hanya menghapus cookie
  di sisi klien. Pertimbangkan umur token lebih pendek plus refresh token atau
  pengecekan `tokenVersion` di sisi server.
- Banyak handler mengembalikan `err.message` mentah ke klien (information
  disclosure). Tambahkan error handler Express terpusat yang menyembunyikan
  detail internal di production.
- `cors` dan `helmet` belum dipasang. Tambahkan `cors` dengan allow-list origin
  eksplisit plus `credentials: true`, dan `helmet()` untuk header keamanan.
- `zod` sudah jadi dependency tetapi tidak pernah dipakai. Validasi semua body
  request dengan zod dan whitelist field untuk mencegah mass assignment
  (misal `user.routes.ts` baris 18 sampai 26, `admin.routes.ts`).
- Pastikan semua route `/api/admin/*` yang mengubah data memverifikasi `isAdmin`
  dari JWT di sisi server, bukan hanya digating di frontend.

## GEO Audit: temuan dari pengerjaan UI (14 sampai 15 Juni 2026)

Bagian frontend tools Audit GEO sudah diperbarui. Dua hal di bawah perlu Anda
kerjakan di backend. Frontend tidak mengubah `backend/`.

### 1. Peluang Teratas kosong: `getPromptGaps` mengembalikan teks kosong

Akar masalah: `backend/src/services/analytics.service.ts` `getPromptGaps`
(sekitar baris 100 sampai 137) mengambil teks prompt dari koleksi `prompts`,
lalu jatuh ke `''` saat prompt tidak ditemukan:

```js
text: promptMap[String(r._id)]?.text || '',
category: promptMap[String(r._id)]?.category || '',
```

Saat `queryresults` mereferensikan `promptId` yang prompt-nya sudah terhapus
(atau seeding tidak konsisten), gap row memiliki `text: ''`, sehingga kartu
"Peluang Teratas" menampilkan baris kosong. Frontend sudah menambah filter
defensif (membuang baris tanpa teks), dan data prompt sudah di-seed ulang agar
konsisten, tetapi sebaiknya backend juga di-harden: buang grup yang prompt-nya
tidak ada (jangan emit `text` kosong), misalnya `.filter((g) => g.text !== '')`
sebelum return, atau lewati `queryresults` yang `promptId`-nya tidak ada di
`promptMap`. Pastikan juga seeding selalu memasukkan `prompts` sebelum
`queryresults`.

### 2. Tambahan pemeriksaan GEO (kontrak tetap, frontend tidak berubah)

`runGEOAudit` di `backend/src/services/audit.service.ts` saat ini menjalankan 7
pemeriksaan dan mengembalikan `{ score, checks[] }` di mana setiap check adalah
`{ label, passed, impact, recommendation }`. Frontend merender array `checks`
secara generik dan sudah menerjemahkan label/rekomendasi yang dikenal ke bahasa
Indonesia (dengan fallback ke string apa adanya). Artinya: **setiap check baru
yang Anda tambahkan akan langsung muncul tanpa perubahan frontend.** Agar
terjemahan Indonesia ikut, kirimkan label/rekomendasi baru ke tim frontend untuk
ditambahkan ke peta terjemahan.

Pemeriksaan tambahan yang paling bernilai, semua bisa reuse `html`/`urlObj` yang
sudah di-fetch (urut prioritas):

1. **robots.txt + izin bot AI (paling penting).** Fetch `/robots.txt`, cek
   apakah GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot di-`Disallow`.
   Kalau diblokir, semua optimasi lain percuma. Impact: high.
2. **HTTPS / TLS valid.** Tandai `http:` pada `urlObj.protocol`. Impact: high.
3. **Kualitas `<title>`** (ada, 10 sampai 60 karakter, tidak generik). Impact: high.
4. **Tipe schema.org spesifik**, bukan sekadar "ada JSON-LD". Parse blok JSON-LD
   dan laporkan keberadaan Organization, Product, FAQPage, Article. Impact: high.
5. **Satu `<h1>` + hierarki heading rapi** (h2/h3 tanpa lompat). Impact: medium-high.
6. **Tag canonical ada.** Impact: medium.
7. **Open Graph / Twitter card meta ada.** Impact: medium.
8. **Kedalaman konten** (jumlah kata terlihat di atas ambang, mis. 300). Impact: medium.

Tingkat lanjut (effort lebih besar): tanggal `dateModified`/`<time>` untuk
kesegaran konten, sinyal penulis/E-E-A-T, cakupan alt text gambar, meta viewport,
riwayat skor audit yang dipersist per brand+URL (untuk grafik skor dari waktu ke
waktu), dan uji fetchability sebagai bot AI (request ulang dengan User-Agent
GPTBot/ClaudeBot untuk memastikan konten tidak hanya dirender via JS).

Catatan: dua pemeriksaan saat ini lemah dan layak diperkuat: "Brand definition
present" dan "Sitemap reference" hanya regex substring sederhana (nomor 4 dan 3
di atas menggantikannya dengan sinyal yang lebih kuat).

**Spec lengkap siap pakai (24 Juni 2026):** kode deteksi siap-tempel untuk 9
pemeriksaan baru (robots.txt izin bot AI, judul deskriptif, satu `<h1>` + hierarki
heading, OpenGraph, cakupan alt text gambar, kedalaman konten, heading gaya tanya
jawab, canonical, HTTPS) beserta tier impact dan copy rekomendasi (Inggris) ada di
`docs/GEO-AUDIT-SCORING-SPEC.md`. Tinggal di-`checks.push(...)` ke dalam `runGEOAudit`;
formula skor berbobot tidak berubah (otomatis menghitung ulang), audit naik dari 7
menjadi 16 pemeriksaan, dan frontend merender check baru tanpa perubahan. Kirimkan
label/rekomendasi baru ke tim frontend untuk ditambahkan ke peta terjemahan Indonesia.

## Insights: pemilih rentang waktu + model AI tambahan (15 Juni 2026)

### 1. Granularitas tren (Harian / Mingguan / Bulanan)

Halaman Analitik (Agents Insights) sekarang punya pemilih rentang waktu di kanan
atas: Harian, Mingguan, Bulanan. **Mingguan** aktif (sesuai `getTrends` yang
meng-agregasi per ISO week). **Harian** dan **Bulanan** ditampilkan terkunci
dengan popover "Segera hadir", karena backend belum mendukungnya.

Untuk mengaktifkannya: tambahkan parameter granularity ke endpoint analitik /
tren, misal `GET /brands/{id}/analytics?granularity=daily|weekly|monthly`, dan di
`getTrends` ubah pengelompokan `$group._id` dari `$isoWeek` menjadi:
- daily: `{ $dateToString: { format: '%Y-%m-%d', date: '$queriedAt' } }`
- weekly: tetap `$isoWeek` + `$isoWeekYear` (sekarang)
- monthly: `{ year: { $year: '$queriedAt' }, month: { $month: '$queriedAt' } }`

Kembalikan tetap dalam bentuk `{ label, week?, year?, total, mentioned,
mentionRate }`. Untuk harian/bulanan, sertakan tanggal mentah (mis. `date`) agar
frontend bisa memformat label tanggalnya. Frontend sudah mengonversi minggu ISO
ke tanggal manusia ("12 Mei"); untuk harian/bulanan kirim tanggal yang bisa
diparse. Kabari tim frontend saat parameter ini siap.

### 2. Model AI tambahan (Grok, DeepSeek)

Di halaman Jawaban AI, tab pemilih model sekarang menampilkan dua model
tambahan, **Grok** dan **DeepSeek**, dalam keadaan terkunci dengan popover
"Tersedia di paket yang lebih tinggi" (murni teaser frontend, gating paket).
Belum ada perubahan backend. Kalau nanti model ini benar-benar didukung,
perlu: API key dan modul provider di `backend/src/services` (mirip
openai/gemini/perplexity/anthropic), menambah model ke konstanta `LLM_MODELS`
(`shared/constants`), dan worker scan mengikutkannya. Setelah `LLM_MODELS`
bertambah, beri tahu frontend agar tab terkunci diganti jadi tab aktif (plus
logo brand jika tersedia).

## Pekerjaan backend untuk membuka fitur frontend (15 Juni 2026)

Bagian ini mendaftar pekerjaan backend yang dibutuhkan agar fitur frontend baru
bisa dibangun. Rujukannya ada di `docs/FRATELLO-FEATURE-OPPORTUNITIES.md` (bagian
"Blocked on backend", kode FB-1 sampai FB-10). Frontend tidak menyentuh backend.
Beberapa item sudah disebut di bagian sebelumnya dan hanya dirujuk di sini agar
tidak terduplikasi.

### Sudah didokumentasikan di atas (tinggal dikerjakan)

- SoV vs kompetitor sungguhan + schema kompetitor yang lebih kaya (bagian
  "Analitik & dashboard" nomor 1, dan "kompetitor butuh schema"). Membuka FB-1.
- Status penyelesaian scan (nomor 2). Membuka FB-4.
- Toggle prompt aktif/nonaktif (nomor 3). Sebagian dari FB-5.
- Mention rate per prompt untuk semua prompt, dipecah per model (nomor 6, lihat
  catatan per-model di sana). Membuka FB-3.
- Pemeriksaan GEO tambahan (bagian GEO Audit). Tidak perlu perubahan frontend,
  check baru otomatis tampil; frontend hanya menambah terjemahan label baru.
- Endpoint `suggest-competitors` (bagian kompetitor). Membuka FB-10.
- Granularity tren harian/bulanan (bagian Insights).

### Item baru

1. **Snapshot visibilitas yang dipersist (untuk laporan klien + grafik skor dari
   waktu ke waktu).** Saat ini analitik dihitung ulang setiap kali dan tidak ada
   riwayat. Tambahkan koleksi snapshot yang ditulis setiap scan selesai: mention
   rate keseluruhan dan per model, SoV, ringkasan sentimen, plus skor GEO bila ada
   audit. Sediakan `GET /brands/{id}/history`. Frontend memakai ini untuk laporan
   klien (FN-1) dan view progress dari waktu ke waktu (FB-2). Melengkapi "riwayat
   skor audit" yang sudah disinggung di bagian GEO Audit.

2. **Ekstraksi sitasi/sumber dari response LLM yang sudah tersimpan.**
   `QueryResult.response` sudah menyimpan jawaban mentah, termasuk jawaban
   Perplexity yang sering menyertakan URL sitasi inline. Belum ada yang
   mengekstraknya. Tambahkan proses ekstraksi (regex URL plus rollup domain, atau
   satu pass Claude) dan endpoint `GET /brands/{id}/citations` yang mengembalikan
   domain yang dikutip beserta frekuensinya. Frontend membangun view "dari mana AI
   mengambil jawabannya" (FB-6). Ini pembeda terbesar, datanya sudah ada di Mongo.
   Catatan: CLAUDE.md menyarankan tidak menyimpan response panjang selamanya, jadi
   setelah ekstraksi Anda bisa menyimpan hanya sitasinya.
   **Update frontend (21 Juni 2026):** halaman `/results` sekarang dipisah jadi dua
   tab, "Penyebutan Brand" (Mentions, data lama) dan "Sitasi" (Citations). Tab Sitasi
   sudah ada di UI dengan keadaan "Segera hadir" yang menjelaskan bedanya dengan
   penyebutan. Begitu endpoint `GET /brands/{id}/citations` siap, tinggal isi tab itu;
   strukturnya sudah menunggu. Label menu sidebar juga diganti dari "Citations" yang
   menyesatkan menjadi "Penyebutan Brand" karena halaman itu memang mention tracking.

3. **Agregasi mention rate per intent/kategori.** Tiap prompt punya `category`
   (discovery/comparison/recommendation/use-case/best-of/organic). Tambahkan
   agregasi mention rate per kategori agar frontend bisa membuat heat map cakupan
   intent (FB-7). Kecil, satu agregasi.

4. **Endpoint mutasi prompt: hapus, bulk, dan list termasuk nonaktif.** Selain
   toggle `isActive` yang sudah diminta, frontend butuh
   `DELETE /brands/{id}/prompts/{promptId}`, opsi bulk (aktif/nonaktif/hapus banyak
   sekaligus), dan parameter `includeInactive` pada list. PENTING:
   `getPromptsByBrand` sekarang memfilter keras `isActive: true`
   (`prompt.service.ts:86`), jadi prompt yang dinonaktifkan akan hilang dari list,
   bukan ter-pause. List butuh jalur `includeInactive` agar prompt nonaktif tetap
   tampil dengan status. Frontend membangun UI manajemen prompt (FB-5).

5. **Mode "brief" pada generate artikel.** `generateArticle` hanya menghasilkan
   artikel jadi 600 sampai 900 kata. Tambahkan mode brief (mis.
   `POST /brands/{id}/articles/generate { promptId, mode: 'brief' }`) yang
   mengembalikan: query target, intent, konsep yang harus muncul (ambil dari gaps
   `semantic.service.ts`), sudut kompetitor, dan kerangka FAQ. Frontend menambahkan
   toggle brief di halaman Artikel AI (FB-8).

6. **Draft distribusi per platform.** `findBacklinkTargets` sudah menyarankan
   platform. Langkah berikutnya: untuk tiap target hasilkan draft/snippet siap
   pakai sesuai gaya platform. Frontend mengubah halaman Distribusi jadi antrian
   kerja (FB-9).

7. **Hubungkan artikel ke publikasi plus jendela dampak yang bisa diatur.** Loop
   konten hampir tertutup tapi tautannya manual. Bawa `articleId` saat user
   menandai "sudah dipublikasi", dan jadikan jendela dampak (sekarang tetap 7 hari
   sebelum/sesudah di `publication.service.ts:50`) bisa dipilih 14/30/90 hari,
   karena refresh korpus LLM sering lebih lama dari 7 hari.

8. **Perbaiki alert yang mati, lalu buat lebih berguna.** `alert.service.ts:43`
   mencari user lewat `clerkUserId`, sisa dari Clerk setelah migrasi JWT, sehingga
   kemungkinan besar tidak cocok dengan user mana pun (alert praktis mati). Ini
   akar masalah yang sama dengan bagian "Yang perlu diperbaiki di backend" di atas
   (sisa `clerkUserId` setelah migrasi JWT); perbaiki keduanya sekaligus dengan
   pilihan id yang konsisten (`user._id.toString()` yang sama dengan `Brand.userId`)
   supaya `auth.ts` dan `alert.service.ts:43` beres bersamaan. Setelah lookup benar,
   tingkatkan dari sekadar penurunan agregat mingguan menjadi delta per prompt /
   per model / per kompetitor. Bergantung pada snapshot (item 1).

9. **Pasang plan gating yang sekarang mati.** `backend/src/middleware/planGate.ts`
   adalah dead code (tidak pernah di-import). `gatePromptLimit` no-op,
   `gateArticleQuota` tidak terpasang. Batas plan (prompts/artikel/model) yang
   tampil di UI murni kosmetik. Agar fitur berbayar bisa dijual (mis. white-label
   di Agency, batas model di Starter), gating harus benar-benar dipasang di route
   terkait.

10. **Opsional (frontend SUDAH live dengan versi client-side, ini hanya optimasi,
    bukan blocker):** Per 15 Juni 2026 ketiga fitur ini sudah jalan di frontend.
    Endpoint di bawah hanya mengurangi beban/meningkatkan akurasi.
    - Roll-up portofolio untuk dashboard multi-brand. Frontend sekarang meng-agregasi
      client-side via satu panggilan `/analytics` per brand (N+1). Endpoint roll-up
      tunggal akan lebih efisien saat brand banyak. Mengoptimalkan FN-2 (sudah live).
    - Endpoint "do this next" yang sudah diberi skor. Frontend menyusun antrian dari
      gaps + audit + semantic secara client-side. CATATAN: action queue ini memanggil
      `POST /tools/geo-score` dan `GET /analytics/semantic-proximity` setiap kali
      halaman Ringkasan dibuka (keduanya lambat). Endpoint tunggal yang sudah
      di-cache/diberi skor akan menghemat panggilan berulang ini. Mengoptimalkan FN-3
      (sudah live).
    - Auto-enqueue scan pertama saat brand dibuat. Frontend sekarang memicu scan
      sendiri lewat tombol "Siapkan otomatis" (generate prompt lalu scan). Enqueue
      otomatis di sisi backend akan lebih rapi. Mengoptimalkan FN-4 (sudah live).

11. **Basis Pengetahuan (Knowledge Base) per brand.** Halaman frontend baru
    `/brands/{id}/knowledge` sudah live, tetapi entrinya (panduan konten + tautan
    folder) baru tersimpan di localStorage browser. Backend perlu: (a) model plus
    endpoint CRUD untuk menyimpan entri KB per brand secara permanen, (b) opsi
    unggah berkas/folder (bukan sekadar tautan), dan yang terpenting (c) memasukkan
    panduan KB ini ke dalam prompt saat `article.service.ts` membuat artikel, agar
    output mengikuti gaya dan fakta brand. Tanpa (c), KB hanya jadi catatan dan belum
    memengaruhi hasil artikel.

12. **Endpoint registrasi (POST /api/auth/register) untuk halaman daftar beta.**
    Halaman frontend baru `/sign-up` (desain "Welcome beta users") sudah dibuat:
    form Email, Password, dan Konfirmasi Password dengan validasi syarat password
    langsung di sisi klien (minimal 8 karakter, 1 huruf kapital, 1 angka, password
    cocok). Form mengirim POST ke `/api/auth/register`, tetapi backend baru punya
    `/login`, `/logout`, dan `/me` (belum ada `/register`). Backend perlu menambahkan
    endpoint registrasi yang: (a) memvalidasi email ada di waitlist/beta sebelum
    membuat akun (sesuai copy "hanya menerima pengguna waitlist"), (b) hash password
    dan membuat user, lalu (c) mengeluarkan cookie sesi yang sama seperti `/login`
    agar pengguna langsung masuk. Sampai endpoint ini ada, tombol "Buat akun" akan
    menampilkan pesan error.

13. **Tier plan diperbarui (28 Juni 2026) — nilainya sudah sinkron, enforcement masih
    nunggu (lanjutan item 9).** Tier baru: **Basic** (key internal tetap `starter`) =
    40 prompt / 1 model (Gemini saja) / 5 artikel; **Pro** = 100 / 4 model / 30 artikel;
    **Agency** = 300 / 4 model / 100 artikel — Agency sekarang DIBATASI, bukan unlimited.
    Scan 1×/hari semua plan; harga tetap. Nilai sudah disamakan di `shared/constants.ts`
    (`PLAN_LIMITS`), salinan frontend (`usage/page.tsx`, `brands/page.tsx`), dan tabel di
    CLAUDE.md + README + PRODUCT_KNOWLEDGE + docs. **Sengaja DITUNDA (belum dipasang):**
    (a) `planGate.ts` masih dead code (lihat item 9) → kuota artikel/prompt belum ditegakkan;
    (b) `prompt.service.ts` masih hardcode "generate exactly 25" → harus diskalakan ke
    40/100/300 sesuai plan; (c) belum ada pembatasan model per plan → Basic mestinya cuma
    Gemini, tapi worker scan masih query semua 4 model. Untuk testing lokal ada override
    `effectivePlan()` di `backend/src/utils/devPlan.ts`: semua akun jadi Agency saat
    `NODE_ENV!=production` DAN `DEV_FORCE_AGENCY=true` (in-memory, tidak pernah aktif di prod).

14. **Belum di-review: endpoint reset password baru di `auth.routes.ts`.** Sudah ada
    `forgot-password` / `reset-password` (token di-hash SHA-256, TTL 1 jam) yang
    ditambahkan dari workspace lain. Perlu audit keamanan terpisah: rate-limit,
    anti-enumeration (respons seragam), token sekali pakai, dan binding ke user yang benar.
