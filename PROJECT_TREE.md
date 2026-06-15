# GEOnineten - Struktur Project

Pohon di bawah mencerminkan kondisi repo saat ini. Backend (Node.js + Express) dan
frontend (Next.js App Router) berbagi tipe lewat folder `shared/`.

```
geonineten/                              ← root project
│
├── CLAUDE.md                            ← konteks untuk Claude Code (baca lebih dulu)
├── DESIGN_SYSTEM.md                     ← aturan design system frontend (wajib)
├── PHASES.md                            ← progress tracker per fase
├── PRODUCT_KNOWLEDGE.md                 ← konteks produk + framework GEO
├── PROJECT_TREE.md                      ← berkas ini
├── READMEFEATUER.md                     ← daftar fitur platform
├── README.md                            ← ringkasan repo
├── env.example                          ← template env vars (boleh di-commit)
├── .env                                 ← API key + secret (jangan di-commit)
├── ecosystem.config.js                  ← konfigurasi PM2 (level root)
├── .gitignore
│
├── backend/                             ← API server (Node.js + Express + TypeScript)
│   ├── index.ts                         ← entry point: setup Express, mount routes, koneksi DB/Redis
│   ├── package.json
│   ├── tsconfig.json
│   ├── ecosystem.config.js              ← konfigurasi PM2 backend
│   │
│   └── src/
│       ├── config/
│       │   ├── db.ts                    ← koneksi MongoDB
│       │   └── redis.ts                 ← koneksi Redis untuk BullMQ
│       │
│       ├── middleware/
│       │   ├── auth.ts                  ← verifikasi JWT dari cookie (requireAuth)
│       │   ├── planGate.ts              ← gating fitur per plan (Starter/Pro/Agency)
│       │   └── requireAdmin.ts          ← batasi akses route admin
│       │
│       ├── models/                      ← schema Mongoose
│       │   ├── User.ts                  ← akun + passwordHash + plan
│       │   ├── Brand.ts
│       │   ├── Prompt.ts
│       │   ├── QueryResult.ts
│       │   ├── Article.ts
│       │   └── ContentPublication.ts    ← log distribusi konten
│       │
│       ├── routes/                      ← Express routes (semua di prefix /api)
│       │   ├── auth.routes.ts           ← register, login, logout, me (JWT + bcrypt)
│       │   ├── user.routes.ts           ← pengaturan + preferensi alert
│       │   ├── brand.routes.ts
│       │   ├── prompt.routes.ts
│       │   ├── scan.routes.ts           ← trigger scan (mount di /brands/:id)
│       │   ├── analytics.routes.ts      ← analytics + semantic-proximity
│       │   ├── article.routes.ts        ← generate artikel + tools GEO (geo-score, llms.txt)
│       │   ├── publication.routes.ts    ← distribusi konten + dampak
│       │   ├── payment.routes.ts        ← Stripe + Midtrans + webhook
│       │   └── admin.routes.ts          ← kelola user (khusus admin)
│       │
│       ├── services/                    ← business logic
│       │   ├── llm/                     ← adapter per provider LLM
│       │   │   ├── openai.ts            ← GPT-4o
│       │   │   ├── gemini.ts            ← Gemini 2.0 Flash
│       │   │   ├── perplexity.ts        ← Perplexity Sonar
│       │   │   ├── anthropic.ts         ← Claude
│       │   │   └── index.ts             ← interface query terpadu
│       │   │
│       │   ├── prompt.service.ts        ← generate prompt pool via AI
│       │   ├── scan.service.ts          ← orkestrasi job scan
│       │   ├── real-queries.service.ts  ← eksekusi query LLM nyata
│       │   ├── analytics.service.ts     ← mention rate, sentimen, tren, share of voice, gaps
│       │   ├── semantic.service.ts      ← semantic proximity + gap konsep
│       │   ├── article.service.ts       ← pipeline gap-ke-artikel
│       │   ├── audit.service.ts         ← GEO score audit + llms.txt + nginx config
│       │   ├── publication.service.ts   ← ukur dampak distribusi konten
│       │   ├── alert.service.ts         ← deteksi penurunan mention rate
│       │   ├── email.service.ts         ← kirim email (Resend)
│       │   ├── whatsapp.service.ts      ← kirim notifikasi WhatsApp
│       │   ├── payment.service.ts       ← Stripe + Midtrans
│       │   └── cron.service.ts          ← penjadwal auto-scan + alert berkala
│       │
│       ├── workers/                     ← BullMQ job processors
│       │   ├── queue.ts                 ← setup queue BullMQ
│       │   └── llm.worker.ts            ← proses job query LLM
│       │
│       └── utils/
│           ├── mention-parser.ts        ← deteksi brand disebut + ekstrak konteks
│           ├── sentiment.ts             ← klasifikasi positif/netral/negatif
│           ├── retry.ts                 ← helper exponential backoff
│           └── rate-limiter.ts          ← rate limit per provider
│
├── frontend/                            ← Next.js (App Router): dashboard + landing
│   ├── package.json
│   ├── next.config.ts                   ← proxy /api/* ke backend port 4000
│   ├── tailwind.config.ts               ← design tokens (warna, tipografi, radius)
│   │
│   ├── app/
│   │   ├── layout.tsx                   ← root layout + providers
│   │   ├── globals.css
│   │   ├── design-tokens.css            ← CSS variable token (light/dark)
│   │   │
│   │   ├── (platform)/                  ← area aplikasi (butuh login), pakai AppShell
│   │   │   ├── layout.tsx               ← shell: sidebar + topbar
│   │   │   ├── page.tsx                 ← arahkan ke daftar project
│   │   │   ├── sign-in/ , sign-up/      ← form autentikasi
│   │   │   ├── getting-started/page.tsx ← checklist langkah awal
│   │   │   ├── usage/page.tsx           ← pemakaian kuota lintas project
│   │   │   ├── brands/
│   │   │   │   ├── page.tsx             ← daftar project (roll-up portofolio)
│   │   │   │   ├── new/page.tsx         ← tambah brand
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx         ← Ringkasan + Antrian "Lakukan Berikutnya"
│   │   │   │       ├── prompts/page.tsx ← kelola prompt pool
│   │   │   │       ├── results/page.tsx ← Jawaban AI (hasil scan)
│   │   │   │       ├── analytics/page.tsx ← chart + metrik
│   │   │   │       ├── report/page.tsx  ← Laporan Visibilitas AI (cetak/PDF)
│   │   │   │       ├── research/page.tsx ← Riset Pertanyaan
│   │   │   │       ├── semantic/page.tsx ← Naikkan Ranking AI (semantik)
│   │   │   │       ├── distribution/page.tsx ← log distribusi konten
│   │   │   │       ├── articles/page.tsx ← Artikel AI (generate konten)
│   │   │   │       └── tools/page.tsx   ← Tools Audit GEO
│   │   │   ├── settings/
│   │   │   │   ├── page.tsx             ← pengaturan akun + preferensi alert
│   │   │   │   └── billing/page.tsx     ← langganan + pembayaran
│   │   │   └── admin/
│   │   │       ├── page.tsx
│   │   │       └── users/page.tsx       ← kelola user platform
│   │   │
│   │   ├── onboarding/page.tsx          ← alur onboarding (6 langkah)
│   │   ├── fratello/                    ← landing + newsletter (publik)
│   │   └── api/waitlist/route.ts        ← handler form waitlist
│   │
│   ├── components/
│   │   ├── ui/                          ← design system (Button, Input, Chip, Tabs, dll); spec di .design/specs
│   │   ├── dashboard/                   ← AppShell, primitives, ActionQueue, DeltaBadge, ModelLogo, chart
│   │   ├── onboarding/                  ← OnboardingFlow + steps/ (Welcome, BrandName, Website, Industry, Competitors)
│   │   ├── providers/                   ← LanguageProvider, ThemeProvider, TopLoadingBar
│   │   └── fratello/                    ← komponen landing
│   │
│   └── lib/
│       ├── api.ts , useApiFetch.ts      ← klien fetch ke backend (auth via cookie)
│       ├── analytics.ts                 ← tipe + helper (weekOverWeekDelta, dll)
│       ├── categories.ts                ← metadata kategori prompt (6 intent)
│       ├── dashboard-copy.ts            ← copy sidebar (ID/EN)
│       ├── onboarding-copy.ts           ← copy onboarding (ID/EN)
│       ├── motion.ts                    ← token animasi (framer-motion)
│       ├── useActiveProject.ts          ← project aktif + progress getting-started
│       └── cn.ts                        ← helper className
│
├── shared/                             ← dipakai bersama backend & frontend
│   ├── constants.ts                    ← LLM_MODELS, PLAN_LIMITS, QUERY_REPEAT_COUNT
│   └── types/                          ← tipe TypeScript bersama
│       ├── brand.types.ts
│       ├── prompt.types.ts
│       ├── query.types.ts
│       └── article.types.ts
│
├── docs/                              ← dokumentasi tim
│   ├── README-BACKEND.md              ← tugas backend untuk membuka fitur frontend
│   ├── README-SEO-PLAYBOOK.md         ← panduan spesialis SEO/GEO
│   └── FRATELLO-FEATURE-OPPORTUNITIES.md ← roadmap fitur frontend
│
├── .design/                          ← sumber design system
│   ├── specs/                         ← satu berkas .md per komponen ui/
│   └── assets/
│
├── deploy/                           ← konfigurasi VPS
│   ├── nginx.conf
│   └── backup-mongo.sh
│
└── fratello-geo/                     ← landing page Fratello (project Next.js terpisah)
```

---

## Berkas penting, simpan di mana

| Berkas | Lokasi | Keterangan |
|---|---|---|
| `CLAUDE.md` | root | Konteks utama, dibaca Claude Code lebih dulu |
| `DESIGN_SYSTEM.md` | root | Aturan wajib sebelum menyentuh UI di `frontend/` |
| `PHASES.md` | root | Progress per fase |
| `env.example` | root | Template kosong, boleh di-commit |
| `.env` | root | API key + secret, satu level di atas backend & frontend. Jangan di-commit |
| `.gitignore` | root | Pastikan `.env` ikut diabaikan |

---

## .gitignore minimal

```
.env
node_modules/
.next/
dist/
*.log
```

---

## Cara menjalankan development

Tidak ada `package.json` di root, jadi backend dan frontend dijalankan terpisah.

```bash
# 1. clone / init repo
cd geonineten

# 2. siapkan env
cp env.example .env
# → isi API key, MONGODB_URI, REDIS_URL, JWT_SECRET, dst di .env

# 3. install dependency backend
cd backend && npm install

# 4. install dependency frontend
cd ../frontend && npm install

# 5. jalankan backend (development, tsx watch)
cd ../backend && npm run dev      # default port 4000

# 6. jalankan frontend (development)
cd ../frontend && npm run dev      # default port 3000

# --- PRODUCTION (di VPS, bukan lokal) ---
# backend:  npm run build → pm2 start ecosystem.config.js
# frontend: npm run build → npm run start
```

Prasyarat lokal: MongoDB dan Redis harus berjalan (default `localhost:27017` dan
`localhost:6379`).
