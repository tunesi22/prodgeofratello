# GEO Platform — Project Structure

```
geo-platform/                          ← root project
│
├── CLAUDE.md                          ← ⭐ context file untuk Claude Code
├── PHASES.md                          ← ⭐ progress tracker per fase
├── .env                               ← API keys (jangan di-commit)
├── .env.example                       ← template env vars (boleh di-commit)
├── .gitignore
│
├── backend/                           ← Node.js API server
│   ├── package.json
│   ├── index.ts                       ← entry point, setup express + connect DB
│   ├── ecosystem.config.js            ← PM2 config (tetap .js, PM2 tidak kenal TS)
│   │
│   └── src/
│       ├── config/
│       │   ├── db.ts                  ← MongoDB connection
│       │   └── redis.ts               ← Redis connection untuk BullMQ
│       │
│       ├── models/                    ← Mongoose models
│       │   ├── Brand.ts
│       │   ├── Prompt.ts
│       │   ├── QueryResult.ts
│       │   └── Article.ts
│       │
│       ├── routes/                    ← Express routes
│       │   ├── brand.routes.ts
│       │   ├── prompt.routes.ts
│       │   ├── scan.routes.ts
│       │   ├── analytics.routes.ts
│       │   └── article.routes.ts
│       │
│       ├── services/                  ← Business logic
│       │   ├── llm/                   ← LLM provider adapters
│       │   │   ├── openai.ts          ← GPT-4o
│       │   │   ├── gemini.ts          ← Gemini 2.0 Flash
│       │   │   ├── perplexity.ts      ← Perplexity Sonar
│       │   │   ├── anthropic.ts       ← Claude
│       │   │   └── index.ts           ← unified query interface
│       │   │
│       │   ├── prompt.service.ts      ← generate prompt pool via AI
│       │   ├── scan.service.ts        ← orchestrate scan jobs
│       │   ├── analytics.service.ts   ← mention rate, share of voice, trend
│       │   ├── article.service.ts     ← gap-to-article pipeline
│       │   └── audit.service.ts       ← GEO score audit
│       │
│       ├── workers/                   ← BullMQ job processors
│       │   ├── queue.ts               ← setup BullMQ queues
│       │   ├── llm.worker.ts          ← process LLM query jobs
│       │   └── article.worker.ts      ← process article generation jobs
│       │
│       └── utils/
│           ├── mention-parser.ts      ← deteksi brand disebut + extract konteks
│           ├── sentiment.ts           ← positive/neutral/negative classifier
│           ├── retry.ts               ← exponential backoff helper
│           └── rate-limiter.ts        ← per-provider rate limit handler
│
├── frontend/                          ← Next.js dashboard
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.ts
│   │
│   └── app/                          ← Next.js App Router
│       ├── layout.tsx
│       ├── page.tsx                   ← dashboard overview
│       │
│       ├── brands/
│       │   ├── page.tsx              ← list semua brand
│       │   ├── new/page.tsx          ← tambah brand baru
│       │   └── [id]/
│       │       ├── page.tsx          ← brand detail + overview
│       │       ├── prompts/page.tsx  ← manage prompt pool
│       │       ├── results/page.tsx  ← hasil scan raw
│       │       ├── analytics/page.tsx ← charts & metrics
│       │       ├── articles/page.tsx ← article generator
│       │       └── tools/page.tsx    ← llms.txt, nginx config, GEO score
│       │
│       ├── settings/
│       │   ├── page.tsx              ← account settings
│       │   └── billing/page.tsx      ← subscription & payment
│       │
│       └── api/                      ← Next.js API routes (proxy ke backend)
│           └── [...proxy]/route.ts
│
└── shared/                            ← shared antara backend & frontend
    ├── constants.ts                   ← plan limits, model list, dll
    └── types/                         ← shared TypeScript interfaces & types
        ├── brand.types.ts
        ├── prompt.types.ts
        ├── query.types.ts
        └── article.types.ts
```

---

## File penting — taruh di mana

| File | Lokasi | Keterangan |
|---|---|---|
| `CLAUDE.md` | `geo-platform/` | Root project, Claude Code langsung baca |
| `PHASES.md` | `geo-platform/` | Root project, sama level CLAUDE.md |
| `.env` | `geo-platform/` | Root project, satu level diatas backend & frontend |
| `.env.example` | `geo-platform/` | Boleh di-commit, template kosong |
| `.gitignore` | `geo-platform/` | Pastiin `.env` masuk gitignore |

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

## Cara start development

```bash
# 1. clone / init repo
cd geo-platform

# 2. copy env
cp .env.example .env
# → isi API keys di .env

# 3. install backend deps
cd backend && npm install

# 4. install frontend deps
cd ../frontend && npm install

# 5. start backend (development — tsx watch)
cd ../backend && npm run dev

# 6. start frontend (development)
cd ../frontend && npm run dev

# --- PRODUCTION (jalankan di VPS, bukan lokal) ---
# npm run build → pm2 start ecosystem.config.js
```
