# GEOnineten

> Track how often AI mentions your brand, find the gaps, and automatically generate content that closes them — all in one platform.

GEOnineten is a SaaS platform for **Generative Engine Optimization (GEO)** — helping brands become visible in AI-generated answers from ChatGPT, Gemini, Perplexity, and Claude.

---

## What is GEO?

SEO targets Google rankings. GEO targets AI mentions.

When someone asks ChatGPT *"best padel app in Jakarta"* or Gemini *"trusted flour distributor in Indonesia"*, your brand should be in that answer. GEO is the strategy to make that happen — and GEOnineten is the engine that automates it.

| | SEO | GEO |
|---|---|---|
| Target | Google ranking | AI mention |
| Unit | Keyword | Question / intent |
| Output | Link in search results | Named directly in AI answer |
| Success metric | Position #1 on Google | Mention rate % across LLMs |

---

## Features

### Brand Mention Tracker
Automatically track how often your brand is mentioned by 4 major LLMs: ChatGPT (GPT-4o), Gemini 2.0 Flash, Perplexity Sonar, and Claude Haiku. Every prompt is queried **5× per model** for statistical accuracy — results include mention status, sentiment (positive/neutral/negative), and the exact context sentence.

### Prompt Pool Generator
Auto-generate 25 relevant questions using AI across 5 categories: Discovery, Comparison, Recommendation, Use-Case, and Best-Of. Prompts never mention the brand directly, ensuring organic mention testing.

### Analytics Dashboard
Full visibility into brand performance:
- Mention rate per model + overall score
- Best & worst performing models
- Sentiment breakdown
- 12-week trend chart
- Prompt gap table (prompts with mention rate < 20%)
- Share of voice vs competitors

### GEO Content Engine
Generate articles directly from gap analysis. Each article is 600–900 words, mentions the brand naturally 3–5 times, and is structured for LLM indexing. Export as Markdown or HTML — ready to publish on the client's website.

### Semantic Intelligence *(Proprietary)*
The feature that sets GEOnineten apart:
- **Semantic Proximity Analysis** — top 20 concepts co-occurring with your brand in AI responses, scored by frequency
- **Semantic Gap Detection** — concepts that *should* be associated with your brand but aren't yet — instant content roadmap
- **Competitor Concept Comparison** — see what concepts your competitors own that you don't

### Content Distribution Tracker
Log published content (Reddit, Medium, forums, blogs) and measure impact: compares mention rate 7 days before vs after each publish, calculates impact score, and identifies the most effective platforms per industry.

### Technical GEO Tools
- **llms.txt Generator** — create an AI-crawler-readable brand info file (`yourdomain.com/llms.txt`)
- **Nginx Bot Routing Config** — detect GPTBot, ClaudeBot, PerplexityBot and serve them AI-optimized content
- **GEO Score Audit** — score any website 0–100 across 7 GEO criteria with prioritized recommendations
- **Backlink Target Finder** — suggest 10 best publication platforms based on industry

### Alert System
Automatic alerts via Email and WhatsApp when mention rate drops beyond a configurable threshold. Checks run weekly; threshold and channels are user-configurable.

### Auto-Scan Scheduler
Schedule brand scans on daily or weekly intervals — no manual triggering needed.

### Payment & Plan System
| Plan | Price | Prompts | Models | Articles/mo |
|---|---|---|---|---|
| Basic | $49/mo | 40 | 1 (Gemini) | 5 |
| Pro | $149/mo | 100 | All (4) | 30 |
| Agency | $399/mo | 300 | All (4) | 100 |

Payments via **Stripe** (USD) and **Midtrans** (IDR for Indonesia market).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Language | TypeScript |
| Backend | Node.js + Express |
| Job Queue | BullMQ + Redis |
| Database | MongoDB |
| Frontend | Next.js (App Router) |
| Styling | Tailwind CSS |
| Auth | Clerk |
| Email | Resend |
| Payment | Midtrans + Stripe |
| Deploy | PM2 + Nginx on VPS |

---

## Project Structure

```
/geonineten
├── /backend
│   └── /src
│       ├── /routes       # Express routes
│       ├── /services     # Business logic
│       ├── /workers      # BullMQ job processors
│       ├── /models       # Mongoose models
│       └── /utils        # Helpers
├── /frontend
│   ├── /app              # Next.js App Router
│   └── /components
├── /shared
│   └── /types            # Shared TypeScript types
├── /deploy               # Nginx + PM2 config
└── env.example
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB
- Redis

### Installation

```bash
# Clone the repo
git clone https://github.com/tunesi22/geonineten.git
cd geonineten

# Install dependencies
cd backend && npm install
cd ../frontend && npm install

# Configure environment
cp env.example .env
# Fill in your API keys in .env
```

### Environment Variables

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

### Run Locally

```bash
# Backend
cd backend && npm run dev

# Frontend
cd frontend && npm run dev
```

---

## Why GEOnineten?

| | Competitors | GEOnineten |
|---|---|---|
| Tracking | Manual snapshot | Automated + continuous |
| Content | Manual recommendations | AI-generated, LLM-optimized |
| Semantic analysis | None | Proprietary engine |
| Distribution tracking | None | With before/after impact delta |
| Indonesia market | No IDR payment | Midtrans IDR + WhatsApp alerts |
| Alerts | None | Email + WhatsApp |
| Pricing | $500+/mo (agency fee) | From $49/mo (self-serve) |

---

## License

Private — all rights reserved.
