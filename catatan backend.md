# Catatan Backend — buat dicek temenku

> Dibuat: 28 Juni 2026. Konteks: halaman **sign-up sudah dihapus total** di
> frontend karena sekarang user cuma kita ambil dari list sendiri (closed
> signup). Catatan ini soal sisa-sisa di backend yang perlu dipastikan.

---

## 1. Endpoint register — TOLONG DICEK

Halaman sign-up yang lama dulu nge-POST ke `POST /api/auth/register`.

Waktu aku hapus frontend-nya, aku cek backend dan **endpoint `/register`
ternyata TIDAK PERNAH ADA**. Di `backend/src/routes/auth.routes.ts` cuma ada:

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET  /api/auth/me`

Jadi secara teknis sekarang udah aman — gak ada cara daftar sendiri.

**Yang perlu kamu pastikan:**

1. **Jangan bikin / jangan aktifin endpoint `/api/auth/register`.** Selama
   signup ditutup, endpoint ini harus tetap gak ada. Kalau nanti ada yang
   nambahin, harus digate dulu (mis. cuma admin yang boleh bikin user).
2. Cek juga gak ada route lain yang diam-diam bisa bikin user baru
   (mis. di `user.routes.ts` atau `admin.routes.ts`). Pendaftaran user baru
   idealnya cuma lewat proses internal kita (seed dari list, atau admin-only).
3. Kalau memang butuh nambah user, lewat **admin-only** atau script seeding —
   bukan endpoint publik.

## 2. User dibuat dari mana sekarang?

Karena signup ditutup, user baru harus di-provision manual / dari list kita.
Tolong pastikan ada cara yang jelas buat ini (script seed atau admin panel),
biar tim gak bingung pas mau nambah klien baru.

## 3. Perubahan di frontend (FYI aja, udah dikerjain)

- `app/(platform)/sign-up/` → **dihapus total**.
- `middleware.ts` → request ke `/sign-up` di-redirect permanen (308) ke
  `/sign-in`, jadi route-nya gak bisa diakses sama siapapun (login maupun
  belum, termasuk bot).
- Link "Daftar / Sign up" di halaman sign-in → dihapus.
- `robots.ts` → `/sign-up` dikeluarin dari allow-list.

Frontend udah bersih. Tinggal mastiin backend gak ngebuka pintu daftar lagi.

---

## 4. Endpoint BARU yang perlu dibikin: `POST /api/brands/analyze`

> Konteks: halaman **/brands/new** ("Project baru") sekarang udah jadi stepper
> kayak onboarding. Setelah user isi website, kita pengen **crawl website itu**
> lalu **auto-isi industri + kompetitor**, sekaligus ngecek apakah website-nya
> **bisa dibaca engine kita** (crawlable). Sekarang ini masih MOCK di frontend.

**Sekarang (sementara):** ada mock di
`frontend/app/api/brands/analyze/route.ts` yang ngarang hasilnya. Karena
`next.config.ts` nge-rewrite `/api/*` ke backend, file mock ini **nge-shadow**
route backend. **Begitu kamu bikin route Express-nya, HAPUS file mock itu**
biar `/api/brands/analyze` jatuh ke backend.

**Contract yang harus dipenuhi (samain persis):**

```
POST /api/brands/analyze
Request  body : { website: string, brandName?: string }
Response 200  : {
  crawlable: boolean,                 // engine kita bisa baca site ini?
  brandName: string,                  // hasil deteksi (boleh dari og:site_name / <title>)
  industry: string,                   // hasil deteksi dari isi halaman
  competitors: {                      // hasil deteksi dari isi halaman
    name: string,
    domain: string,
    includeSubdomains: boolean
  }[],
  summary: string                     // 1 kalimat "apa yang kami temukan"
}
```

**Cara bikin yang beneran (bukan nebak dari URL doang):**

1. **Fetch halaman** pakai `axios` (udah ke-install) + `cheerio` buat parse.
   Ekstrak `<title>`, `meta[name=description]`, `og:site_name`, `h1`, dan teks
   visible secukupnya. Kasih **timeout** dan handle kasus: site gak ke-reach,
   bukan HTML, ke-block robots, atau JS-wall (konten kosong) → `crawlable:false`.
2. **Industri + kompetitor**: kirim teks hasil ekstrak (bukan cuma URL) ke LLM
   buat infer industri & kompetitor. Ini beda penting dari endpoint lama
   (lihat poin 6) yang cuma nebak dari string URL.
3. Sesuai `CLAUDE.md`: **wajib lewat BullMQ** (jangan blast inline),
   **try/catch** di semua external call, dan **exponential backoff** buat
   retry LLM/HTTP.

## 5. Schema `Brand.competitors` perlu di-upgrade

Sekarang `competitors: [String]` (`backend/src/models/Brand.ts`). UI baru udah
ngumpulin objek lengkap **`{ name, domain, includeSubdomains }`** per kompetitor
(buat engine tracking nanti butuh domain-nya).

- **Sementara frontend cuma ngirim `name` aja** pas `POST /api/brands`, biar
  gak nabrak schema `[String]` yang sekarang. Jadi create masih jalan normal.
- **Tolong upgrade** `competitors` ke
  `[{ name: String, domain: String, includeSubdomains: Boolean }]` dan update
  `POST /api/brands` biar nerima bentuk objek. Habis itu kabarin, nanti frontend
  aku ganti buat ngirim objek lengkap (bukan cuma nama).

## 6. Endpoint lama `POST /api/brands/detect-industry` (FYI)

Yang lama (`backend/src/routes/brand.routes.ts`) **gak nge-crawl** — cuma
ngirim string URL ke Claude dan minta nebak industrinya. Begitu `analyze` (poin
4) jadi, endpoint ini bisa di-deprecate atau digabung ke `analyze`. Onboarding
lama (`OnboardingFlow.tsx`) masih manggil `detect-industry`; nanti kita arahin
ke `analyze` juga biar satu jalur.

---

## 7. Scan progress global (banner sticky) — perlu progress yang bisa di-poll

> Konteks UX baru: pas user klik **Run Scan**, sekarang ada **banner sticky di
> atas yang ikut di semua halaman** selama scan jalan (loading + estimasi waktu),
> bukan cuma di halaman Overview. Lihat `components/providers/ScanProgressProvider.tsx`
> + `components/dashboard/ScanBanner.tsx`.

**Sekarang (mock):** progress-nya **disimulasi di frontend** pakai timer, karena
mock backend gak benar-benar nge-scan. `POST /api/brands/:id/scan` mock balikin
`jobsEnqueued = prompts × models × 5` biar banner punya total buat dihitung.

**Yang perlu kamu sediakan biar progress-nya real (bukan estimasi):**

1. `POST /api/brands/:id/scan` → balikin `{ jobsEnqueued }` = jumlah pengecekan
   yang di-enqueue (prompt aktif × model sesuai plan × 5 run). Ini jadi `total`
   di banner.
2. Satu cara buat tahu **berapa yang sudah selesai** + **kapan kelar**, salah satu:
   - `GET /api/brands/:id/scans` (sudah ada) yang ngebalikin scan running dengan
     `completedJobs`/`totalJobs`, ATAU
   - cukup andelin `GET /analytics` (`overall.totalQueries` naik sampai
     `baseline + jobsEnqueued`).
   Begitu beres, frontend tinggal panggil `markComplete()` di provider biar bar-nya
   selesai pas data beneran masuk (bukan pas timer estimasi habis). Hook-nya udah
   disiapin, tinggal di-wire ke poll real.

## 8. Hasil scan: 5 run per (prompt × model) — tampilan dikelompokkan

> Konteks UX baru: di halaman **Mentions** (`/results`), prompt yang sama yang
> ditanyakan 5× ke model yang sama dulu tampil sebagai 5 baris kembar (user kira
> bug). Sekarang **dikelompokkan per (prompt × model)** jadi satu kartu dengan
> "run strip" (kotak per percobaan, hijau = brand disebut) + mention rate.

**Yang perlu dipastikan dari sisi data:**

1. `GET /api/brands/:id/results` tiap item **wajib** punya `promptId` ter-populate
   (`{ _id, text, category }`), `model`, `mentioned`, `sentiment`,
   `mentionContext`, `response`, `queriedAt`. (Mock di
   `app/api/brands/[id]/results/route.ts` sudah ngebentuk 5 run per prompt×model
   sebagai contoh; ganti dengan data asli.)
2. **Pagination harus group-aware.** Sekarang frontend ngelompokkan hasil dalam
   1 page. Kalau 5 run dari satu (prompt × model) kepotong di batas halaman,
   pengelompokan jadi belah. Idealnya backend: (a) kembalikan sudah ter-group,
   atau (b) jamin semua run satu grup selalu di page yang sama, atau (c) sediakan
   `scanId`/`runIndex` biar frontend bisa rakit lintas page. Buat sekarang mock
   sengaja ≤ 1 page (40 baris) biar aman.

— makasih 🙏
