# GEO Platform — PHASES.md

> Progress tracker. Update status tiap task selesai.
> Format: `[ ]` = todo, `[x]` = done, `[~]` = in progress

---

## Fase 1 — Brand mention tracker MVP
**Target: 2–3 minggu | Status: 🔄 In progress**

### 1.1 Project setup
- [x] Init repo struktur `/backend` + `/frontend` + `/shared`
- [x] Setup `.env.example` dengan semua keys yang dibutuhkan
- [x] Install dependencies backend: express, mongoose, bullmq, ioredis, dotenv, axios
- [x] Install dependencies frontend: next.js, tailwindcss
- [x] Setup MongoDB connection di backend
- [x] Setup Redis connection untuk BullMQ
- [x] Setup PM2 ecosystem file

### 1.2 LLM provider services
- [x] `/backend/src/services/llm/openai.ts` — query ke GPT-4o
- [x] `/backend/src/services/llm/gemini.ts` — query ke Gemini 2.0 Flash
- [x] `/backend/src/services/llm/perplexity.ts` — query ke Perplexity Sonar
- [x] `/backend/src/services/llm/anthropic.ts` — query ke Claude
- [x] Exponential backoff + retry logic di semua provider
- [x] Rate limiter per provider

### 1.3 Core data models
- [x] `Brand` model (mongoose)
- [x] `Prompt` model (mongoose)
- [x] `QueryResult` model (mongoose)

### 1.4 Prompt generator
- [x] Service yang terima input: brand name + industry
- [x] Auto-generate 20–30 prompt relevan via Claude API
- [x] Simpan ke DB sebagai prompt pool brand

### 1.5 Query engine (BullMQ)
- [x] Setup BullMQ queue: `llm-query-queue`
- [x] Worker: ambil job → query ke LLM → parse response → simpan ke DB
- [x] Logic: tiap prompt di-query 5x per model
- [x] Parser: deteksi brand disebut (case-insensitive) + extract konteks kalimat
- [x] Sentiment detection sederhana (positive/neutral/negative)

### 1.6 REST API
- [x] `POST /api/brands` — tambah brand baru
- [x] `POST /api/brands/:id/prompts` — generate prompt pool
- [x] `POST /api/brands/:id/scan` — trigger full scan (queue jobs)
- [x] `GET /api/brands/:id/results` — ambil hasil query
- [x] `GET /api/brands/:id/mention-rate` — hitung mention rate per model

### 1.7 Basic frontend
- [x] Halaman: tambah brand baru
- [x] Halaman: lihat prompt list
- [x] Tombol: trigger scan
- [x] Halaman: hasil scan — tabel sederhana (prompt, model, mentioned ✓/✗, rate %)

---

## Fase 2 — Analytics dashboard
**Target: 3–4 minggu | Status: ✅ Done**

### 2.1 Analytics services
- [x] Mention rate per model aggregation
- [x] Share of voice calculator (brand vs kompetitor)
- [x] Sentiment aggregation
- [x] Trend over time (weekly grouping)
- [x] Prompt gap identifier (prompt yang mention rate < 20%)

### 2.2 Dashboard UI
- [x] Overview card: total mention rate, best model, worst model
- [x] Chart: mention rate per model (bar chart)
- [x] Chart: share of voice vs kompetitor (pie/donut)
- [x] Chart: trend over time (line chart — weekly)
- [x] Chart: sentiment breakdown (stacked bar)
- [x] Table: prompt gap analysis — sorted by lowest mention rate

### 2.3 Scheduled auto-scan
- [x] Cron job: auto-scan semua brand aktif setiap hari/minggu
- [x] Config: user bisa pilih frekuensi (daily/weekly)

### 2.4 API tambahan
- [x] `GET /api/brands/:id/analytics` — semua metric aggregated
- [x] `GET /api/brands/:id/gaps` — prompt yang butuh konten
- [x] `GET /api/brands/:id/trends` — data untuk line chart

---

## Fase 3 — GEO content engine
**Target: 3–4 minggu | Status: ✅ Done**

### 3.1 Article generator
- [x] `Article` model (mongoose)
- [x] Service: gap-to-article pipeline
- [x] Export: download sebagai `.md` file
- [x] Export: download sebagai `.html` file
- [ ] Article quota enforcement per plan tier (defer ke Fase 4 — butuh auth)

### 3.2 llms.txt generator
- [x] Input: brand info + key facts + website URL
- [x] Output: `llms.txt` file siap pasang di root domain
- [x] Preview di dashboard sebelum download

### 3.3 Nginx bot routing config generator
- [x] Input: domain klien + list halaman utama
- [x] Output: nginx config snippet untuk detect GPTBot/ClaudeBot/PerplexityBot
- [x] Instruksi cara implementasi (step-by-step)

### 3.4 GEO score audit
- [x] Input: URL website klien
- [x] Cek: ada llms.txt atau tidak
- [x] Cek: structured content (FAQ, definisi, list)
- [x] Cek: brand definition yang jelas
- [x] Output: score 0–100 + checklist rekomendasi

### 3.5 Backlink target finder
- [x] Berdasarkan industri brand → suggest platform publish yang relevan
- [x] Output: list Reddit subreddit, Medium tags, forum, blog niche

### 3.6 UI
- [x] Halaman: article generator — list gap prompts + tombol generate
- [x] Halaman: article preview + download
- [x] Halaman: technical tools (llms.txt, nginx config, GEO score)

---

## Fase 4 — SaaS launch
**Target: 4–6 minggu | Status: ✅ Done**

### 4.1 Auth & multi-tenant
- [x] Setup Clerk auth
- [x] User model dengan plan tier
- [x] Middleware: feature gating berdasarkan plan (article quota)
- [x] Isolasi data per user/workspace (userId on Brand)

### 4.2 Payment
- [x] Midtrans integration (IDR — untuk market Indonesia)
- [x] Stripe integration (USD — untuk market global)
- [x] Webhook: update plan setelah payment sukses
- [x] Halaman: pricing page (di landing page)
- [x] Halaman: billing & subscription management

### 4.3 Alert sistem
- [x] Deteksi: mention rate drop > 20% dari minggu lalu
- [ ] Deteksi: kompetitor mention rate naik signifikan (defer)
- [x] Notif: email via Resend
- [x] Notif: WhatsApp via WaConnectHub
- [x] Config: user bisa pilih threshold alert

### 4.4 White-label mode (Agency tier)
- [ ] Custom domain support (defer — infrastructure heavy)
- [ ] Remove branding dari dashboard (defer)
- [ ] Agency manage multiple klien (defer)
- [ ] Sub-workspace per klien (defer)

### 4.5 Production hardening
- [x] Rate limiting di semua endpoint (express-rate-limit)
- [ ] Input validation & sanitization (defer — zod)
- [x] Error monitoring (Sentry)
- [x] Nginx config production
- [x] PM2 ecosystem file production
- [ ] SSL via Certbot (manual di VPS)
- [x] Backup MongoDB scheduled (deploy/backup-mongo.sh)

### 4.6 Landing page
- [x] Hero section
- [x] Feature highlights
- [x] Pricing section
- [ ] Social proof / case study (defer — butuh real data)
- [x] CTA: start free trial

---

## Fase 5 — Semantic Intelligence Layer
**Target: 2–3 minggu | Status: ✅ Done**

> Brand harus muncul dekat secara semantik dengan konsep-konsep related, bukan cuma disebut namanya.

### 5.1 Semantic Proximity Analysis
- [x] Service: extract konsep/entitas dari `mentionContext` tiap QueryResult via Claude
- [x] Aggregate per brand: konsep apa yang paling sering co-occur dengan brand
- [x] Scoring: hitung proximity score tiap konsep (0–100%)
- [x] Identify gap: konsep yang harusnya dekat tapi jarang muncul
- [x] API: `GET /api/brands/:id/semantic-proximity`

### 5.2 Co-occurrence Mapping
- [x] Build co-occurrence matrix dari hasil 5.1
- [x] Compare: konsep yang muncul di brand vs kompetitor
- [x] Visualisasi: bar chart + concept tags di dashboard
- [x] "Semantic gap": list konsep yang kompetitor punya tapi brand tidak
- [x] API: `GET /api/brands/:id/cooccurrence`

### 5.3 Content Distribution Tracker
- [x] Model: `ContentPublication` (brandId, platform, url, publishedAt, articleId?)
- [x] API: CRUD `/api/brands/:id/publications`
- [x] Service: bandingkan mention rate sebelum vs sesudah publikasi (delta analysis)
- [x] Dashboard: tabel publikasi + impact score per publikasi
- [ ] Suggest platform terbaik berdasarkan historical impact (defer)

---

## Notes & decisions

> Catat keputusan teknis penting di sini selama development

- Pakai BullMQ (bukan Bull) karena native ES modules support lebih baik
- Query 5x per prompt per model untuk statistical accuracy
- Article output: markdown dulu, HTML export belum urgent di fase 3
- White-label: defer ke fase 4, jangan over-engineer di awal
