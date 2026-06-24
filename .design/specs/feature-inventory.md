# Feature Inventory — Platform Pages

> Source of truth for the dashboard redesign. Every feature, interaction, API call, and
> state listed here MUST exist in the redesigned UI (feature parity checklist).
>
> Generated from code audit of `frontend/app/(platform)/**` on 2026-06-12.
> All API paths below are relative to `/api` (proxied; see `lib/useApiFetch.ts`).

---

## 0. `(platform)` layout & root

### `/` — `app/(platform)/page.tsx`
- Server redirect → `/brands`. No UI.

### Layout — `app/(platform)/layout.tsx`
- `bg-gray-950` shell, flex row: `<Sidebar />` + scrollable `<main>`.
- Applies to all routes below.

---

## 1. `/brands` — Brand list (dashboard home)

**File:** `app/(platform)/brands/page.tsx`
**Purpose:** List all brands of the logged-in user; entry point to everything.

### Data shown
- Per brand (interface `Brand`): `_id`, `name`, `website`, `industry`, `competitors[]`, `createdAt`.
- Card row per brand: initial-letter avatar (first char of `name`, emerald tile), `name`, `industry`, competitor count badge ("N competitor(s)", only if > 0), arrow affordance.
- Page header: eyebrow "Dashboard", title "Brands", subtitle "Track your brand visibility across AI models".

### Actions / interactions
- **"Onboarding" button** (design-system `Button`, primary, `ArrowRightIcon`) → `router.push('/onboarding')`.
- **"+ Add Brand" link** → `/brands/new` (header AND inside empty state).
- **Brand card click** (whole row is a `Link`) → `/brands/{_id}`.

### States
- Loading: 3 skeleton rows (`h-20`, pulse).
- Error: red alert box with error message.
- Empty: dashed-border card "No brands yet / Add your first brand to start tracking" + "+ Add Brand" CTA.

### API calls
- `GET /brands` → `Brand[]`.

### Cross-page nav
- → `/onboarding`, `/brands/new`, `/brands/{id}`.

---

## 2. `/brands/new` — Create brand

**File:** `app/(platform)/brands/new/page.tsx`
**Purpose:** Form to create a new brand.

### Form fields
| Field | Type | Required | Placeholder / note |
|---|---|---|---|
| Brand Name | text | yes | "e.g. ArenaGo" |
| Website | url | yes | "https://example.com" |
| Industry | text | yes | "e.g. Sports booking app in Indonesia" + helper "Be specific — this is used to generate relevant prompts" |
| Competitors | text | no | comma-separated, split/trimmed into array on submit |

### Actions / interactions
- **"← Back" link** → `/brands`.
- **Submit "Create Brand"** (disabled while loading, label "Creating…") → on success redirects to `/brands/{newId}`.
- **"Cancel" link** → `/brands`.
- Subtitle note: "We'll generate tracking prompts automatically after you add the brand."

### States
- Submit-loading (button disabled + label change). Error: red alert box inside form.

### API calls
- `POST /brands` — payload `{ name, website, industry, competitors: string[] }` → returns `{ _id }`.

### Cross-page nav
- → `/brands`, `/brands/{id}` (after create).

---

## 3. `/brands/[id]` — Brand detail / Overview

**File:** `app/(platform)/brands/[id]/page.tsx`
**Purpose:** Brand overview: header, scan trigger, mention-rate stats by model.

### Data shown
- Brand header: initial avatar, `name`, `industry`, `website` (external link, opens new tab).
- Mention-rate stats (`MentionRateResponse`):
  - `overall`: `totalQueries`, `mentionCount`, `mentionRate`.
  - `byModel[]`: `model`, `totalQueries`, `mentionCount`, `mentionRate`.
- 3 stat cards: "Overall Mention Rate" (`{rate}%`, emerald accent), "Total Queries", "Total Mentions".
- Table "Mention Rate by Model" — columns: Model (label-mapped: openai→ChatGPT, gemini→Gemini, perplexity→Perplexity, anthropic→Claude), Queries (right), Mentions (right), Rate (right; `RateBadge` pill colored by threshold: ≥60 emerald, ≥30 yellow, else red).

### Actions / interactions
- **"Run Scan" button** (disabled while scanning, label "Starting scan…") → `POST /brands/{id}/scan`; shows blue info banner "Scan started — N jobs enqueued" or "Error: …".
- `BrandNav` tab bar (see §13).
- Empty state CTA **"Generate Prompts"** → `/brands/{id}/prompts`.

### States
- Loading: 3 skeleton bars. Error: red text. Empty (no `totalQueries`): dashed card "No scan data yet / Generate prompts first, then run a scan".

### API calls
- `GET /brands/{id}` → `Brand`.
- `GET /brands/{id}/mention-rate` → `MentionRateResponse` (failure swallowed → null).
- `POST /brands/{id}/scan` → `{ message, jobsEnqueued }`.

### Cross-page nav
- BrandNav tabs; → `/brands/{id}/prompts` (empty state); external brand website.

---

## 4. `/brands/[id]/analytics` — Analytics

**File:** `app/(platform)/brands/[id]/analytics/page.tsx`
**Purpose:** Charts dashboard: mention rate, share of voice, trends, sentiment, prompt gaps.

### Data (interface `Analytics`)
- `overall { totalQueries, mentionCount, mentionRate }`
- `byModel[] { model, totalQueries, mentionCount, mentionRate }`
- `bestModel`, `worstModel` (model key or null)
- `sentiment` — Record<model, { positive, neutral, negative }>
- `trends[] { label, mentionRate, total, mentioned }`
- `gaps[] { promptId, text, category, mentionRate, total }`
- `shareOfVoice[] { brandId, name, mentionCount, mentionRate, shareOfVoice }`

### Widgets
1. **4 stat cards:** Overall Mention Rate (%), Total Queries, Best Model (+rate sub), Worst Model (+rate sub). Model names label-mapped.
2. **Bar chart "Mention Rate by Model"** — recharts `BarChart` (`Bar` dataKey "Mention Rate", barSize 36, Y domain 0–100 with `%` ticks, CartesianGrid, Tooltip).
3. **Pie chart "Share of Voice"** — recharts `PieChart`/`Pie` of `{name, value: shareOfVoice}` with `Cell` colors `['#111827','#6b7280','#d1d5db','#f3f4f6']`, % labels, custom legend list beside it. Fallback (≤1 entry): "Add more brands to compare share of voice".
4. **Area chart "Mention Rate Over Time"** — recharts `AreaChart`/`Area` on `trends` (X = `label`, Y 0–100 %). Fallback (≤1 point): "Need data from multiple weeks to show trend".
5. **Stacked bar "Sentiment Breakdown"** — recharts `BarChart`, 3 stacked `Bar`s (Positive #16a34a, Neutral #9ca3af, Negative #dc2626), Legend, per-model.
6. **"Prompt Gaps" table** (only if `gaps.length > 0`; shows first 10): columns Prompt (text, 2-line clamp), Category, Queries (right), Rate (right, red pill). Header badge "N gaps"; subtitle "Prompts with mention rate < 20% — candidates for GEO content".

### States
- Loading: 4 large skeletons. Error: red text. Empty (`totalQueries === 0`): dashed card "No data yet / Run a scan first to see analytics" (BrandNav still rendered).

### API calls
- `GET /brands/{id}/analytics` → `Analytics`.

### Cross-page nav
- BrandNav only.

### Chart library
- **recharts** (BarChart, Bar, LineChart/Line imported but unused, PieChart/Pie/Cell, AreaChart/Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer).

---

## 5. `/brands/[id]/prompts` — Prompts (2 tabs)

**File:** `app/(platform)/brands/[id]/prompts/page.tsx`
**Purpose:** Manage tracking prompts: AI-generate them, or discover & import real internet queries.

### Shared header
- Title "Prompts", dynamic subtitle: "N prompts across M categories" or "Generate AI prompts or import real queries from the internet".
- Tab switcher (pill segmented control): **"AI Generated"** (count badge) | **"Discover Real Queries"** (green count badge).

### Tab 1 — AI Generated (`prompts`)
- Data (`Prompt`): `_id`, `text`, `category`, `isActive`.
- Prompts grouped by `category`; each group shows colored category chip (style map for: discovery/blue, comparison/purple, recommendation/green, use-case/amber, best-of/orange, organic/teal; fallback gray) + "N prompts" count; list of prompt texts in bordered card with row dividers.
- **"Generate with AI" button** (when 0 prompts; header & empty state) → `POST /brands/{id}/prompts`.
- **"Regenerate" button** (when prompts exist) → `POST /brands/{id}/prompts?regenerate=true`.
- Generating state: blue banner "Generating prompts via Claude... this takes ~10 seconds" + 5 skeleton rows.
- Empty state: dashed card with "Generate with AI" and "Discover Real Queries" (switches tab) buttons.
- Error: red banner.

### Tab 2 — Discover Real Queries (`discover`)
- Data (`RealQuery`): `text`, `source` ('google' | 'reddit'), `category`, `sourceUrl`.
- Info banner: "Real queries from the internet — Pulls actual questions people type on Google + Reddit…".
- **"Discover Real Queries" button** (initial empty state) → `GET /brands/{id}/prompts/discover`.
- Discovering state: spinner + step copy "① Crawling Google Autocomplete + Reddit / ② Claude filtering for relevance / Takes ~15–20 seconds".
- Results UI:
  - Source count chips: "G {n} Google", "R {n} Reddit".
  - **Filter select: source** (All Sources / Google only / Reddit only).
  - **Filter select: category** (All Categories + dynamic categories from results).
  - **"Select all" / "Clear" text buttons**; "{n} selected" counter; **"Refresh"** button (re-runs discover).
  - Selectable query cards (click toggles; custom checkbox; selected = inverted dark style). Each card: query text, source chip (G/R), category chip, "verify ↗" external link to `sourceUrl` (stopPropagation).
  - **Sticky bottom action bar** when selection > 0: "{n} queries selected", "Clear", **"Add {n} to Prompts"** → `POST /brands/{id}/prompts/import` with `{ queries: RealQuery[] }`.
  - Header also shows "Add {n} to Prompts" button when selections exist.
  - Success banner: "Queries added to your prompt pool. Switch to 'AI Generated' tab to see them." (also refetches prompts).
  - Error: red banner / red text under discover button.
- Selection tracked by original index with filtered→original index map.

### API calls
- `GET /brands/{id}/prompts` → `{ count, prompts: Prompt[] }`.
- `POST /brands/{id}/prompts` (optional `?regenerate=true`) → `{ count, prompts }`.
- `GET /brands/{id}/prompts/discover` → `{ queries: RealQuery[], total }`.
- `POST /brands/{id}/prompts/import` — payload `{ queries: RealQuery[] }` → `{ added, total }`.

### Cross-page nav
- BrandNav; external `sourceUrl` links.

---

## 6. `/brands/[id]/results` — Scan Results

**File:** `app/(platform)/brands/[id]/results/page.tsx`
**Purpose:** Paginated raw LLM query results with filters and a slide-over detail panel.

### Data (`QueryResult`)
- `_id`, `model`, `mentioned: boolean`, `sentiment`, `mentionContext`, `response`, `queriedAt`, `promptId { _id, text, category } | null`.
- Response envelope: `{ total, page, results }`. Page size fixed at 50.

### Header
- Title "Scan Results", subtitle "{total} total queries · Click any row to see full response".

### Filters (selects; reset page to 1 on change)
- **Mention filter:** All Results / Mentioned only / Not mentioned → `mentioned=true|false` query param.
- **Model filter:** All Models / ChatGPT / Gemini / Perplexity / Claude → `model=` param.

### Summary cards (3)
- Total Queries (`data.total`), Mentioned (this page) (green), Not Mentioned (this page).

### Table columns
- Prompt (text, clamp-2), Model (colored pill: openai green, gemini blue, perplexity purple, anthropic orange), Mentioned (center ✓ green / ✗ gray), Sentiment (pill: positive green / neutral gray / negative red; "—" when not mentioned), Context (`mentionContext` clamp-1), Date (`queriedAt` localized date, right).
- Row click → opens detail panel.

### Pagination
- "Page X of Y" + Prev/Next buttons (disabled at bounds), only when totalPages > 1.

### Detail slide-over (`ResultPanel`, fixed right 560px + backdrop)
- Header: prompt text (clamp-3) + × close (backdrop click also closes).
- Meta row: model pill, category pill, full `queriedAt` datetime, "✓ Mentioned" + sentiment pill OR "✗ Not Mentioned".
- "Brand Context" block (yellow) — `mentionContext` with brand-name occurrences highlighted (`<mark>`, regex-escaped, case-insensitive).
- "Full Response" block — full text with brand highlighting + **Copy button** ("Copied!" for 2s, `navigator.clipboard`). If `response` empty: placeholder "Full response not stored / Run a new scan to capture full responses".
- Footer: "Result ID: {_id}".

### States
- Loading: 8 skeleton rows. Error: red banner. Empty: dashed card "No results yet / Run a scan to start collecting data".

### API calls
- `GET /brands/{id}` → used for `name` (brand highlight).
- `GET /brands/{id}/results?page=&limit=50[&model=][&mentioned=]` → `{ total, page, results }`.

### Cross-page nav
- BrandNav only.

---

## 7. `/brands/[id]/articles` — Articles

**File:** `app/(platform)/brands/[id]/articles/page.tsx`
**Purpose:** Generate GEO articles from prompts (gap-aware) and export them.

### Layout: two columns + preview below
**Left — "Prompts (N)" list:**
- Each prompt card: optional red "gap" chip (promptId ∈ analytics gaps), text (clamp-2), category chip (same color map as Prompts page), **"Generate Article" button** (per-prompt loading "Generating...").
- **"Show gaps only" / "Gaps only (N)" toggle pill** (shown when gaps exist) filters list to gap prompts.
- Empty states: no prompts → "No prompts yet / Go to Prompts tab…"; gaps filter empty → "No gap prompts found. Run a scan first or show all prompts."
- Scrollable max-h-600.

**Right — "Generated Articles (N)" list:**
- Article card (`Article`: `_id`, `title`, `content`, `status`, `generatedAt`, `promptId{...}|null`): title (clamp-2), generated date, **".md" and ".html" export buttons** (stopPropagation). Card click → sets preview (selected card gets dark border).
- Empty: "No articles yet. Pick a prompt on the left and click Generate."
- Scrollable max-h-600.

**Preview panel (when article selected):**
- "Preview" header, **"Download .md"**, **"Download .html"**, ✕ close. Content rendered as raw markdown in `<pre>` (mono, max-h-96).

### Behaviors
- Generate: `POST /brands/{id}/articles/generate` `{ promptId }` → prepends article to list and auto-opens preview. Error via `alert()`.
- Export: raw `fetch('/api/brands/{id}/articles/{articleId}/export?format=md|html', { credentials:'include' })` → blob download named `article-{id}.{format}`. Failure via `alert('Export failed')`.

### States
- Loading: 4 skeletons. (No explicit error state for initial load; gaps fetch failure swallowed → `{gaps: []}`.)

### API calls
- `GET /brands/{id}/articles` → `{ articles: Article[] }`.
- `GET /brands/{id}/prompts` → `{ prompts: Prompt[] }`.
- `GET /brands/{id}/analytics/gaps` → `{ gaps: Prompt[] }` (errors swallowed).
- `POST /brands/{id}/articles/generate` — `{ promptId }` → `Article`.
- `GET /brands/{id}/articles/{articleId}/export?format=md|html` → file blob (direct fetch, not useApiFetch).

### Cross-page nav
- BrandNav only (Prompts tab referenced in copy).

---

## 8. `/brands/[id]/distribution` — Content Distribution

**File:** `app/(platform)/brands/[id]/distribution/page.tsx`
**Purpose:** Log published content (publications) and measure mention-rate impact (7 days before vs after publish).

### Data (`Publication`)
- `_id`, `title`, `platform`, `platformType` ('reddit'|'medium'|'forum'|'blog'|'directory'|'other'), `url`, `publishedAt`, `mentionRateAtPublish?`, `rateBefore|null`, `rateAfter|null`, `delta|null`.

### Actions / interactions
- **"+ Add Publication" button** toggles inline form.
- **Add form** (grid, all required): Article Title (text), Platform Name (text, e.g. "r/indonesia, Medium, Kompasiana"), Platform Type (select of 6 types, capitalized), Published Date (date, defaults today), URL (url, full-width). Buttons: **"Save Publication"** (disabled/`Saving...` while submitting) and **"Cancel"**. Error via `alert()`. On success: reset form, hide, reload list.
- **Delete** per row → `confirm('Delete this publication?')` then `DELETE`.

### Summary cards (3; only when publications exist)
- Total Publications; With Impact Data (delta ≠ null count); Avg Mention Rate Change (mean delta, `+`/`-` formatted, green/red/gray, "—" if none).

### Table columns
- Title (external link to `url`), Platform (colored pill by `platformType`: reddit orange, medium green, forum purple, blog blue, directory yellow, other gray), Published (date), Before (`rateBefore`% or —, right), After (`rateAfter`% or —, right), Impact (delta with sign, green/red/gray, "No data" if null, right), Delete button column.
- Footnote: "Impact = mention rate change in 7 days before vs 7 days after publication date".

### States
- Loading: centered "Loading..." text. Empty: "No publications yet / Track where you publish content…". Load errors silently ignored.

### API calls
- `GET /brands/{id}/publications/impact` → `Publication[]`.
- `POST /brands/{id}/publications` — payload `{ title, platform, platformType, url, publishedAt }`.
- `DELETE /brands/{id}/publications/{pubId}`.

### Cross-page nav
- BrandNav; external publication URLs.

---

## 9. `/brands/[id]/semantic` — Semantic Intelligence

**File:** `app/(platform)/brands/[id]/semantic/page.tsx`
**Purpose:** On-demand analysis of concepts co-occurring with the brand in LLM responses (GEO semantic proximity).

### Data
- `SemanticProximityData`: `brandId`, `totalMentions`, `concepts[] { concept, count, score }`, `gaps[] { concept, count, score }`, `computedAt`.
- `CooccurrenceData`: `brandId`, `topConcepts[]`, `competitorComparison[] { competitor, concepts: string[] }`.

### Actions / interactions
- **"Run Analysis" button** (disabled/"Analyzing..." while loading) → fires BOTH endpoints in parallel. Analysis is NOT auto-run on mount.

### Widgets (after analysis, when `totalMentions > 0`)
1. 3 stat cards: Mentions Analyzed, Concepts Found, Semantic Gaps (red).
2. "Top Concepts Associated with Your Brand" — horizontal progress bars per concept (label, bar width = `score`% capped 100, score% text).
3. "Semantic Gaps" (if any) — red pill chips per gap concept; subtitle "Concepts your brand SHOULD be associated with but currently isn't"; tip footnote about creating content.
4. "Competitor Concept Comparison" (if `competitorComparison.length > 0`) — per competitor: name + blue concept chips, or "No competitor mentions found in scan data".

### States
- Initial (never run): "Click 'Run Analysis' to start / Requires completed scan data".
- Loading: 🧠 emoji, "Analyzing brand mentions... / This may take 30–60 seconds".
- Zero mentions: "No mentions found / Run a scan first to collect brand mentions".
- Error: red banner.

### API calls
- `GET /brands/{id}/analytics/semantic-proximity` → `SemanticProximityData`.
- `GET /brands/{id}/analytics/cooccurrence` → `CooccurrenceData`.

### Cross-page nav
- BrandNav only.

---

## 10. `/brands/[id]/tools` — Technical Tools

**File:** `app/(platform)/brands/[id]/tools/page.tsx`
**Purpose:** Four GEO utilities behind a button-pill tool selector: llms.txt Generator, Nginx Bot Config, GEO Score Audit, Backlink Targets.

### Tool selector
- 4 pill buttons (active = dark): "llms.txt Generator" (default), "Nginx Bot Config", "GEO Score Audit", "Backlink Targets".

### Tool 1 — llms.txt Generator
- Textarea "Key Facts (one per line, optional)" (mono, 5 rows, multi-line placeholder).
- **"Generate llms.txt" button** (loading "Generating...") → `POST /brands/{id}/articles/tools/llms-txt` with `{ keyFacts: string[] }` (lines split/trimmed) → `{ content }`.
- Output card: "Output — copy to /llms.txt on your domain", **Copy button** (clipboard), `<pre>` mono block (max-h-80).

### Tool 2 — Nginx Bot Config
- Inputs: Domain (text, required to enable button), Key Pages (textarea, one per line, optional).
- **"Generate Config" button** → `POST /brands/{id}/articles/tools/nginx-config` with `{ domain, pages: string[] }` → `{ content }`.
- Output card: "Output — paste inside your server {} block", **Copy button**, `<pre>` (max-h-96).
- Copy mentions bots: GPTBot, ClaudeBot, PerplexityBot.

### Tool 3 — GEO Score Audit
- URL input + **"Audit" button** (disabled w/o URL; loading "Auditing...") → `POST /brands/{id}/articles/tools/geo-score` with `{ url }` → `GEOResult { score: number, checks[] }`.
- Result card: big score number colored by threshold (≥70 green "Good — well optimized", ≥40 yellow "Fair — room for improvement", else red "Poor — needs attention"); checklist rows: ✅/❌, label, impact chip (high red / medium yellow / low gray), recommendation text shown when failed.
- `GEOCheck`: `{ label, passed, impact: 'high'|'medium'|'low', recommendation }`.

### Tool 4 — Backlink Targets
- **"Find Targets" button** (hidden after first load; loading "Finding targets...") → `GET /brands/{id}/articles/tools/backlinks` → `{ targets: BacklinkTarget[] }`.
- Table: Platform (external link, blue), Type (colored pill: reddit orange / medium green / forum blue / directory purple / blog pink / community teal / fallback gray), Why Relevant (text).
- `BacklinkTarget`: `{ platform, type, relevance, url }`.

### States
- Per-tool loading on buttons; all errors via `alert()`.

### API calls
- `POST /brands/{id}/articles/tools/llms-txt` — `{ keyFacts: string[] }` → `{ content }`.
- `POST /brands/{id}/articles/tools/nginx-config` — `{ domain, pages: string[] }` → `{ content }`.
- `POST /brands/{id}/articles/tools/geo-score` — `{ url }` → `GEOResult`.
- `GET /brands/{id}/articles/tools/backlinks` → `{ targets }`.

### Cross-page nav
- BrandNav; external backlink platform URLs.

---

## 11. `/settings` — Settings

**File:** `app/(platform)/settings/page.tsx`
**Purpose:** Account plan display, theme toggle, alert preferences.

### Data (`UserSettings`)
- `email`, `plan`, `alertThreshold`, `alertEmail`, `alertWhatsApp`, `whatsappNumber`.

### Sections
1. **Current Plan card** — plan badge (starter gray / pro blue / agency purple) + **"Manage Billing →" link** → `/settings/billing` (plain `<a>`).
2. **Appearance card** — current theme label with `SunIcon`/`MoonIcon`, design-system **`Toggle`** bound to `useTheme()` from `ThemeProvider` ("Theme for token-based pages (onboarding & new UI)").
3. **Alert Preferences form:**
   - Alert threshold — number input (min 5, max 100), helper "Alert when mention rate drops by this % week-over-week".
   - Checkbox "Email alerts via Resend" (`alertEmail`).
   - Checkbox "WhatsApp alerts via WaConnectHub" (`alertWhatsApp`).
   - Conditional WhatsApp Number text input (placeholder "628123456789") shown only when `alertWhatsApp`.
   - **"Save" button** (loading "Saving…"); "Saved!" confirmation text for 3s. Error via `alert()`.

### States
- Loading: 2 skeleton cards until `/user/me` resolves.

### API calls
- `GET /user/me` → `UserSettings`.
- `PATCH /user/me` — payload `{ alertThreshold, alertEmail, alertWhatsApp, whatsappNumber }`.

### Cross-page nav
- → `/settings/billing`.

---

## 12. `/settings/billing` — Billing & Subscription

**File:** `app/(platform)/settings/billing/page.tsx`
**Purpose:** Show 3 pricing plans, highlight current plan, start Stripe/Midtrans checkout.

### Data
- Current plan from `GET /user/me` (`plan`, defaults 'starter').
- Static `PLANS` array: starter $49 / Rp 750k (25 prompts, 3 models, 4 articles/mo), pro $149 / Rp 2.25jt (100 prompts, all 4 models, 8 articles/mo), agency $399 / Rp 6jt (Unlimited, all 4 models, Unlimited).

### UI / interactions
- "← Settings" back link; header shows "Current plan: {plan}".
- 3 plan cards: name, USD price /mo, IDR price /mo, ✓ feature list (prompts/models/articles). Current plan: emerald border + "Current plan" chip, no buttons.
- Non-current plans (2 buttons each, both disabled during any redirect):
  - **"Pay with Card (USD)"** ("Redirecting…") → `POST /payment/stripe/checkout` `{ plan }` → `{ url }` → `window.location.href`.
  - **"Bayar (IDR)"** ("Redirecting…") → `POST /payment/midtrans/checkout` `{ plan }` → `{ redirectUrl }` → `window.location.href`.
- Errors via `alert()`.

### API calls
- `GET /user/me` → `{ plan }`.
- `POST /payment/stripe/checkout` — `{ plan }` → `{ url }`.
- `POST /payment/midtrans/checkout` — `{ plan }` → `{ redirectUrl }`.

### Cross-page nav
- → `/settings`; external payment redirects.

---

## 13. `/admin` and `/admin/users` — Admin panel

### `/admin` — `app/(platform)/admin/page.tsx`
- Server redirect → `/admin/users`. No UI.

### `/admin/users` — `app/(platform)/admin/users/page.tsx`
**Purpose:** Admin-only user management: stats, search/filter, create user, change plan, toggle admin.

Uses its own inline `authFetch` (raw fetch with `credentials:'include'` + JSON header), NOT `useApiFetch`. Renders its own full-screen `bg-gray-950` shell (max-w-7xl) — visually outside the standard page width.

#### Access control
- `GET /api/admin/users` returning 403 → `router.replace('/brands')` (non-admin bounce).

#### Data
- `AdminUser`: `_id`, `clerkUserId`, `email`, `plan`, `isAdmin`, `lastActiveAt?`, `createdAt`, `brandCount`, `queryCount`.
- `Stats`: `totalUsers`, `activeToday`, `proPlus`, `totalBrands`.

#### Widgets / interactions
- 4 stat cards: Total Users, Active Today (emerald), Pro+ Plans (blue), Total Brands (purple).
- **Search input** (filter by email, client-side) + **plan filter select** (All/Starter/Pro/Agency) + "{n} users" counter.
- Users table — columns: User (plan-colored avatar initial, email, ADMIN amber chip, truncated `clerkUserId` mono), Plan (**inline select styled as badge** → `PATCH /api/admin/users/{id}/plan` `{ plan }`, optimistic update), Brands (count), Queries (count, `id-ID` locale), Last Active (relative time: Just now/Xm/Xh/Xd/Never; emerald if < 1h), Joined (`id-ID` date), Actions (**"Make Admin"/"Revoke Admin"** → `PATCH /api/admin/users/{id}/toggle-admin`, optimistic).
- Empty table row: "No users found."
- **"+ Create User" button** → modal.

#### Create User modal
- Backdrop blur, click-outside & × to close. Fields: Email, Password ("Min. 8 characters"), Plan select. Buttons: Cancel / **"Create User"** ("Creating…").
- `POST /api/admin/users` `{ email, password, plan }`; error text (Indonesian: "Email dan password wajib diisi." / "Gagal membuat user." / "Terjadi kesalahan."); on success closes, resets, reloads data.

#### States
- Loading: full-screen centered spinner. Fetch errors silently swallowed.

#### API calls (note: these are written with explicit `/api` prefix)
- `GET /api/admin/users` → `AdminUser[]`.
- `GET /api/admin/stats` → `Stats`.
- `POST /api/admin/users` — `{ email, password, plan }`.
- `PATCH /api/admin/users/{id}/plan` — `{ plan }`.
- `PATCH /api/admin/users/{id}/toggle-admin`.

#### Cross-page nav
- 403 → `/brands`.

---

## 14. Shared components

### `components/BrandNav.tsx`
- Tab bar rendered inside every brand sub-page. 8 tabs → `/brands/{id}{path}`:
  Overview (`''`), Analytics, Semantic, Distribution, Prompts, Results, Articles, Tools.
- Active detection: exact match for Overview, `startsWith` for others. Active style: emerald bottom border + white text. Horizontal scroll on overflow.

### `components/Sidebar.tsx`
- Fixed left sidebar (w-56, sticky, dark) in `(platform)` layout.
- Brand header: `FratelloLogo` + "Fratello" wordmark.
- Nav links: **Brands** (`/brands`), **Settings** (`/settings`) — active = `pathname.startsWith`.
- **Admin link** (`/admin/users`, amber, ⚙) — only when `user.isAdmin`.
- Footer user chip: avatar initial, email, plan; click opens dropdown with **"Sign out"** → `POST /api/auth/logout` then `router.push('/sign-in')`.
- Fetches `GET /api/user/me` on every pathname change; renders `null` (no sidebar) until user loads / when unauthenticated.

---

## 15. Deduplicated API endpoint list (entire platform frontend)

All via `/api` proxy. ★ = called with raw `fetch`, not `useApiFetch`.

**Brands**
1. `GET /brands` — list user brands
2. `POST /brands` — `{ name, website, industry, competitors[] }`
3. `GET /brands/{id}` — brand detail (also used by Results for brand name)
4. `GET /brands/{id}/mention-rate`
5. `POST /brands/{id}/scan` — enqueue scan jobs

**Prompts**
6. `GET /brands/{id}/prompts`
7. `POST /brands/{id}/prompts` (+ `?regenerate=true`)
8. `GET /brands/{id}/prompts/discover`
9. `POST /brands/{id}/prompts/import` — `{ queries[] }`

**Results & analytics**
10. `GET /brands/{id}/results?page=&limit=50[&model=][&mentioned=]`
11. `GET /brands/{id}/analytics`
12. `GET /brands/{id}/analytics/gaps`
13. `GET /brands/{id}/analytics/semantic-proximity`
14. `GET /brands/{id}/analytics/cooccurrence`

**Articles & tools**
15. `GET /brands/{id}/articles`
16. `POST /brands/{id}/articles/generate` — `{ promptId }`
17. ★ `GET /brands/{id}/articles/{articleId}/export?format=md|html` — blob download
18. `POST /brands/{id}/articles/tools/llms-txt` — `{ keyFacts[] }`
19. `POST /brands/{id}/articles/tools/nginx-config` — `{ domain, pages[] }`
20. `POST /brands/{id}/articles/tools/geo-score` — `{ url }`
21. `GET /brands/{id}/articles/tools/backlinks`

**Distribution**
22. `GET /brands/{id}/publications/impact`
23. `POST /brands/{id}/publications` — `{ title, platform, platformType, url, publishedAt }`
24. `DELETE /brands/{id}/publications/{pubId}`

**User / auth**
25. ★ `GET /user/me` — used by Settings, Billing, Sidebar
26. `PATCH /user/me` — `{ alertThreshold, alertEmail, alertWhatsApp, whatsappNumber }`
27. ★ `POST /auth/logout` (Sidebar)

**Payments**
28. `POST /payment/stripe/checkout` — `{ plan }` → `{ url }`
29. `POST /payment/midtrans/checkout` — `{ plan }` → `{ redirectUrl }`

**Admin** (★ all raw fetch with explicit `/api` prefix)
30. `GET /admin/users`
31. `GET /admin/stats`
32. `POST /admin/users` — `{ email, password, plan }`
33. `PATCH /admin/users/{id}/plan` — `{ plan }`
34. `PATCH /admin/users/{id}/toggle-admin`

**Total: 34 unique endpoints** (33 backend routes + the blob-export variant of articles).

---

## 16. Shared components & utilities used by these pages

| Item | Path | Used by |
|---|---|---|
| `useApiFetch` | `frontend/lib/useApiFetch.ts` | All pages except admin/users & blob export. Wraps fetch with `/api` base, `credentials:'include'`, JSON headers, throws `Error(err.error)` on !ok. |
| `BrandNav` | `frontend/components/BrandNav.tsx` | All 8 brand sub-pages |
| `Sidebar` | `frontend/components/Sidebar.tsx` | `(platform)` layout |
| `Button` (design system) | `frontend/components/ui/Button` | brands list (Onboarding CTA) |
| `Toggle` (design system) | `frontend/components/ui/Toggle` | settings (theme) |
| `useTheme` / `ThemeProvider` | `frontend/components/providers/ThemeProvider` | settings |
| `ArrowRightIcon`, `SunIcon`, `MoonIcon` | `frontend/components/onboarding/icons` | brands list, settings |
| `FratelloLogo` | `frontend/components/onboarding/FratelloLogo` | Sidebar |
| recharts components | npm `recharts` | analytics page only |

Notes for redesign parity:
- Most legacy pages use raw Tailwind classes/hex (NOT design tokens) — redesign must convert to tokens per `DESIGN_SYSTEM.md`.
- Brand sub-pages are inconsistent: overview/settings/billing/admin/brands-list are dark themed; analytics/prompts/results/articles/distribution/semantic/tools are still light themed (`bg-white`, `text-gray-900`).
- Error handling is inconsistent: inline banners (brands, prompts, results), `alert()` (articles, distribution, tools, settings, billing), silent swallow (distribution load, admin, sidebar).
- Recurring color semantics to preserve: model pills (openai/ChatGPT green, gemini blue, perplexity purple, anthropic/Claude orange), sentiment (positive green / neutral gray / negative red), rate thresholds (≥60 good, ≥30 mid, <30 bad; GEO score ≥70/≥40), category chips (discovery blue, comparison purple, recommendation green, use-case amber, best-of orange, organic teal).

---

## 17. Chart / visualization libraries (from `frontend/package.json`)

- **`recharts` ^3.8.1** — only chart library; used solely in `brands/[id]/analytics` (BarChart, PieChart, AreaChart, stacked bars; LineChart imported but unused). Semantic page uses hand-rolled div progress bars, not a library.
- Animation libs present (not charts): `framer-motion` ^12.40.0, `gsap` ^3.15.0.
- Icons: `@hugeicons/react` + `@hugeicons/core-free-icons`.
- Also in deps: `@clerk/nextjs` (legacy, auth now custom JWT), `@sentry/nextjs`, `nodemailer`.
