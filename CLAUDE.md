# GEO Platform — CLAUDE.md

> Context file untuk Claude Code. Baca ini sebelum mulai ngerjain apapun.

---

## ⚠️ DESIGN SYSTEM — WAJIB (baca sebelum nulis UI code apapun)

**Baca `DESIGN_SYSTEM.md` sebelum menyentuh file UI di `/frontend`.** Dua aturan inti:

1. **Semua styling WAJIB pakai design tokens** dari `fratello-DS.json` /
   `frontend/app/design-tokens.css` / `frontend/tailwind.config.ts` /
   `frontend/lib/motion.ts`. Dilarang hex literal, arbitrary value, font lain,
   atau easing/duration di luar token.
2. **Dilarang bikin komponen UI di luar design system.** Semua UI dibangun dari
   `frontend/components/ui/` (spec: `.design/specs/`). Kalau komponen belum ada,
   bilang ke user — jangan improvisasi.

---

## Project overview

SaaS platform untuk:
1. **Tracking** seberapa sering brand disebut di berbagai LLM (ChatGPT, Gemini, Perplexity, Claude)
2. **Analytics** mention rate, share of voice, sentiment, trend over time
3. **Generate** AI-optimized articles otomatis berdasarkan gap hasil tracking
4. **Output** file siap publish (markdown/HTML) yang klien deploy sendiri di website mereka

Competitor utama: promptingcompany.com (mereka manual, kita automated)

---

## Tech stack

| Layer | Tech |
|---|---|
| Language | TypeScript |
| Backend API | Node.js + Express |
| Job queue | BullMQ + Redis |
| Database | MongoDB |
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS |
| Auth | Clerk (atau Auth.js) |
| Email | Resend |
| Payment | Midtrans (IDR) + Stripe (global) |
| Deploy | PM2 + Nginx di VPS |
| Process manager | PM2 |

---

## Project structure

```
/geo-platform
├── CLAUDE.md           ← kamu lagi baca ini
├── PHASES.md           ← progress tracker per fase
├── .env.example        ← template env vars
├── /backend
│   ├── /src
│   │   ├── /routes     ← Express routes
│   │   ├── /services   ← business logic
│   │   ├── /workers    ← BullMQ job processors
│   │   ├── /models     ← Mongoose models
│   │   └── /utils      ← helpers
│   ├── index.js
│   └── package.json
├── /frontend
│   ├── /app            ← Next.js App Router
│   ├── /components
│   └── package.json
└── /shared
    └── /types          ← shared TypeScript types
```

---

## Environment variables

Semua API keys wajib dari `.env`, jangan pernah hardcode.

```env
# LLM APIs
ANTHROPIC_API_KEY=
OPENAI_API_KEY=
GEMINI_API_KEY=
PERPLEXITY_API_KEY=

# Database
MONGODB_URI=mongodb://localhost:27017/geo-platform

# Queue
REDIS_URL=redis://localhost:6379

# Auth
CLERK_SECRET_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=

# Email
RESEND_API_KEY=

# Payment
MIDTRANS_SERVER_KEY=
MIDTRANS_CLIENT_KEY=
STRIPE_SECRET_KEY=

# App
NODE_ENV=development
PORT=4000
FRONTEND_URL=http://localhost:3000
```

---

## VPS & infra context

- **VPS:** arenagoapi — 202.155.91.107
- **OS:** Ubuntu, PM2 + Nginx sudah running
- **MongoDB:** sudah running di localhost:27017
- **Redis:** install jika belum ada (`apt install redis-server`)
- **Home cloud:** cloud-arenago, Tailscale IP 100.100.247.31 (bisa dipakai offload)
- **Domain baru:** belum ditentukan, placeholder `geo.yourdomain.com`

---

## Coding conventions

- **TypeScript** — semua file `.ts` / `.tsx`, strict mode off, tapi wajib type semua function params & return values
- **Async/await** — no callbacks, no .then() chains
- **Error handling** — wajib try/catch di semua external API calls (LLM APIs bisa timeout/rate limit)
- **Retry logic** — LLM API calls wajib pakai exponential backoff
- **Rate limiting** — tiap LLM API punya limit, jangan blast semua sekaligus
- **Env vars** — semua credentials dari process.env
- **Logging** — pakai console.log terstruktur, format: `[SERVICE] message`
- **Moduler** — tiap LLM provider di file terpisah (openai.ts, gemini.ts, perplexity.ts, anthropic.ts)

---

## LLM query logic — penting

Karena LLM non-deterministic, setiap prompt di-query **5x per model** untuk dapat mention rate yang akurat.

```
mention_rate = jumlah_response_yang_nyebut_brand / total_query × 100
```

Contoh: query "best padel app Indonesia" ke GPT-4o 5x → 3x nyebut ArenaGo → mention rate 60%

Query dijalankan via **BullMQ worker** agar non-blocking dan bisa retry kalau gagal.

---

## Core data models

### Brand
```js
{
  _id, userId, name, website, industry, competitors: [],
  createdAt, updatedAt
}
```

### Prompt
```js
{
  _id, brandId, text, category, isActive, createdAt
}
```

### QueryResult
```js
{
  _id, promptId, brandId, model, // 'openai' | 'gemini' | 'perplexity' | 'anthropic'
  response, mentioned: Boolean, sentiment, // 'positive' | 'neutral' | 'negative'
  mentionContext, queriedAt
}
```

### Article
```js
{
  _id, brandId, promptId, title, content, // markdown
  format, // 'markdown' | 'html'
  status, // 'draft' | 'ready'
  generatedAt
}
```

---

## Pricing tiers (untuk fitur gating)

> **Sumber kebenaran tier.** Enforcement ada di `shared/constants.ts` (`PLAN_LIMITS`);
> frontend punya salinan di `usage/page.tsx` & `brands/page.tsx`. Tabel ini + ketiga
> tempat itu WAJIB selalu sinkron.

| Plan | Harga | Prompts | Models | Scan | Artikel/bulan |
|---|---|---|---|---|---|
| **Basic** | $49 / Rp750k | 25 | 1 — Gemini | 1×/hari | 5 |
| **Pro** | $149 / Rp2.25jt | 100 | 4 — ChatGPT, Claude, Gemini, Perplexity | 1×/hari | 30 |
| **Agency** | $399 / Rp6jt | 300 | 4 — semua | 1×/hari | 100 |

- Kuota **artikel per bulan**; **scan 1× per hari** untuk semua plan.
- **"Basic" = internal plan key `starter`** — TIDAK di-rename. DB/enum/Stripe/Midtrans
  tetap pakai `starter`; "Basic" hanya label tampilan.
- Mapping model: ChatGPT=`openai`, Claude=`anthropic`, Gemini=`gemini`,
  Perplexity=`perplexity` (`LLM_MODELS`).
- Beda dari versi lama: Basic sempat naik 25→40 prompt & 3→1 model (Gemini only),
  Pro artikel 8→30, Agency dibatasi 300 prompt / 100 artikel (dulu unlimited).
  **Update 8 Jul 2026: Basic diturunin lagi 40→25 prompt** (models & artikel tetap
  1/5) — keputusan tim biar hemat cost testing internal sebelum ada client Agency
  beneran; lihat item baru di `docs/README-BACKEND.md`.
- 🧪 **Localhost/dev:** akun otomatis di-treat sebagai **Agency** kalau
  `NODE_ENV≠production` **dan** `DEV_FORCE_AGENCY=true`. Tidak pernah aktif di production.

---

## Current phase

**→ FASE 5: Semantic Intelligence Layer**

Lihat PHASES.md untuk detail task yang harus dikerjakan.

---

## GEO framework

> SEO ngejar keyword — GEO ngejar questions + semantic proximity.

Tiga lapis GEO yang jadi backbone Fase 5:

1. **Unit of optimization** — bukan keyword tapi questions (intent lengkap). Prompt pool kita udah handle ini.
2. **Semantic proximity** — brand harus co-occur dekat konsep related dalam korpus LLM. Contoh: brand distributor terigu harus muncul dekat "grosir", "terpercaya", "Jakarta" — bukan cuma "distributor terigu".
3. **Source: conversation + journal** — LLM belajar dari percakapan publik (Reddit, forum) + artikel/publikasi. Content distribution ke platform ini yang naikkin mention rate.

"Proprietary backbone" = engine otomatis kita (BullMQ + semantic analysis + distribution tracker) yang bikin ini beda dari kompetitor manual.

---

## Yang JANGAN dilakukan

- Jangan hardcode API keys
- Jangan query semua LLM sekaligus tanpa queue (rate limit)
- Jangan simpan raw LLM response yang panjang di DB — extract yang penting saja
- Jangan pakai callback style, selalu async/await
- Jangan lupa error handling di LLM calls — mereka sering timeout
