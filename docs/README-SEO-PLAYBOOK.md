# Fratello — SEO Specialist Playbook

> Onboarding guide for a new GEO/SEO specialist. Read this before you touch your
> first brand. Written in English for review; can be localized to Indonesian on
> request. Everything here was verified against the live product, including the
> parts that do not yet behave the way the UI implies (see "Gotchas").

---

## 1. What Fratello is, and what your job is

Fratello is a **GEO (Generative Engine Optimization)** platform. SEO is about
ranking on Google. GEO is about getting a brand **named and recommended inside AI
answers** (ChatGPT, Gemini, Perplexity, Claude). When someone asks an AI
"best baking supply shop in Indonesia," your job is to make the brand show up in
that answer, framed positively.

**Your job in one sentence:** raise a brand's **mention rate** (how often AI names
it) across the four AI models, and prove that it is going up over time.

You do this by running a repeatable loop: build the right questions, measure how
often the brand appears, find the gaps, fix the website and create content for
those gaps, distribute it where AIs read, then re-measure.

---

## 2. The GEO model in 60 seconds (why the tool is built this way)

Fratello is built on three layers:

1. **Unit of optimization = questions, not keywords.** You do not chase
   "baking supplies." You chase the full question a real person types into an AI:
   "where can I buy quality baking supplies cheaply?" In Fratello these questions
   are called **prompts**.
2. **Semantic proximity.** It is not enough to be mentioned. The brand must
   co-occur near the right concepts ("trusted," "fast delivery," "Jakarta"). The
   **Boost your AI Ranking** page measures and grows this.
3. **Source: conversation + journal.** AIs learn from public conversation (Reddit,
   forums) and publications (articles, Medium, blogs). Getting the brand discussed
   in those places is what actually moves the needle. The **Research**,
   **Backlink Targets**, and **Distribution** features serve this layer.

**The core metric** is **mention rate**:

```
mention rate = (answers that named the brand) / (total answers) x 100
```

Because AIs are non-deterministic, Fratello asks each question **5 times per model, across 4 models** (so each prompt = 20 AI answers per scan) and averages.

---

## 3. The core loop (this is your weekly job)

```
  1. Set up the brand            (Onboarding)
        |
  2. Build the prompt pool       (Prompts  +  AI Prompt Research)
        |
  3. Run a scan                  (Overview -> Run Scan)
        |
  4. Read the baseline           (Overview report card  +  Agents Insights)
        |
  5. Diagnose the gaps           (Content Opportunities, Boost AI Ranking, Citations)
        |
  6. Fix the website (on-page)   (GEO Audit Tools: score, llms.txt, Nginx config)
        |
  7. Create content for gaps     (AI Articles / Artikel AI -> publish on the site)
        |
  8. Distribute off-site         (Backlink Targets -> publish -> log in To-Do)
        |
  9. Track impact                (To-Do / Distribution: before vs after)
        |
 10. Re-scan, compare, repeat    (weekly; watch the trend climb)
```

On-site work (steps 6-7) makes the brand **machine-readable**. Off-site work
(steps 5, 8) makes the brand **co-occur with the right concepts in the sources AIs
read**. You alternate between them every cycle.

---

## 4. The platform map (the sidebar)

The left sidebar is grouped. Every item is bilingual (Indonesian / English).
**Important quirk:** several menu labels do not match their URL path, so do not
navigate by guessing the URL.

| Group | Menu (EN / ID) | What it actually is | URL |
|---|---|---|---|
| (pinned) | Getting Started / Panduan Awal | 3-step setup checklist | `/getting-started` |
| Brand Insights | Overview / Ringkasan | The AI Visibility Report Card + Run Scan | `/brands/{id}` |
| | Prompts / Prompts | Build & view the question pool | `/brands/{id}/prompts` |
| | Citations / Jawaban AI | The raw AI answers (evidence) | `/brands/{id}/results` |
| | Agents Insights / Analitik AI | All the charts and metrics | `/brands/{id}/analytics` |
| AI Visibility | AI Prompt Research / Riset Pertanyaan | Discover real Google + Reddit questions | `/brands/{id}/research` |
| | GEO Audit Tools / Tools Audit GEO | Score the site + generate llms.txt / Nginx | `/brands/{id}/tools` |
| Recommendations | Boost your AI Ranking / Naikkan Ranking AI | Semantic proximity + concept gaps | `/brands/{id}/semantic` |
| | AI Articles / Artikel AI | Generate GEO-optimized articles | `/brands/{id}/articles` |
| | To-Do / Daftar Tugas | Content distribution log + impact | `/brands/{id}/distribution` |
| Admin | All Projects / Semua Project | Switch between brands | `/brands` |
| | Billing / Tagihan | Plan + upgrade | `/settings/billing` |
| | Monitor Usage / Pemakaian | Quota usage | `/usage` |
| | Manage Users / Kelola User | (admins only) | `/admin/users` |

Each brand is a **project**. The dropdown at the top of the sidebar switches the
active project. Theme (light/dark) and language live in **Account Settings**.

---

## 5. Page-by-page guide

### Getting Started (Panduan Awal)
A 3-step checklist: create the project, set up prompts, run a scan. Use it on day
one; it just links you to the right pages.

### Overview / Ringkasan — the AI Visibility Report Card
This is the brand's home page and your daily glance. It shows:
- **The headline:** "Your brand appears in X% of AI answers" with a week-over-week
  arrow and a plain reading (strong / decent / low).
- **Three stats:** total questions checked, total mentions, **best model** (the AI
  that names the brand most).
- **Mention Rate by AI Model:** a bar per AI so you see which engine is weak.
- **Mention Sentiment:** positive / neutral / negative split.
- **Top Opportunities:** up to 3 prompts with the lowest mention rate, each with a
  "Create content" shortcut.
- **The Run Scan button** lives here (top right).

If a brand has never been scanned, this page is an empty state with two buttons
that send you to set up prompts.

### Prompts
The question pool. Two ways to fill it:
- **Generate with AI** — one click produces **25** natural-language questions
  across 5 categories in about 10 seconds. Great for a cold start.
- Or import real questions from **AI Prompt Research** (next page).

Categories (each prompt is tagged with one): **Discovery** (exploring options),
**Comparison** (brand vs brand), **Recommendation** (asking for a pick),
**Use case** (a specific need), **Best of** (best-in-class lists), **Organic**
(general topic questions). Aim to cover all of them.

> Prompts are deliberately **brand-neutral** — they never contain the brand name,
> because the whole point is to see whether the AI names the brand on its own.

### AI Prompt Research / Riset Pertanyaan
This pulls **real questions people actually type** on Google Autocomplete and
Reddit (not AI-invented ones), then Claude filters them down to the ones relevant
to the brand's industry. You review the list, tick the relevant ones, and click
"Add to Prompts." Each question shows its source (Google/Reddit) with a "verify"
link so you can read the original thread.

**When to use which:** Generate with AI to seed the pool fast, then use Research to
validate it with real-demand questions and to discover where the conversation is
already happening (those Reddit/forum threads are also your distribution targets).

### Run Scan (button on Overview)
Queries every active prompt against all 4 AIs, 5 times each, and records whether
the brand was named and in what tone. A live progress card shows how many checks
are done. **Scans are slow** (only a few AI calls run at once) — a 25-prompt scan
is 500 AI calls and usually takes several minutes. You can leave the page; just
reload later to see the final numbers.

### Citations / Jawaban AI — the evidence
The raw feed of individual AI answers, newest first. This is where numbers become
real sentences. Each row shows the question, which AI answered, when it was
checked, and a clear status: **"Mentioned positively / neutrally / negatively"**
or **"Not mentioned."** Filter by model and by mention status.

Click any row to open the detail drawer: it highlights the exact sentence where
the brand appears and shows the full answer. **Use this to verify** before you act
on a number — confirm a "mention" is a real recommendation (not an accidental word
match) and that the positive/negative label is actually right.

### Agents Insights / Analitik AI — all the charts
The full analytics. Read it top to bottom:
- **Report card:** overall mention rate + week-over-week, total queries, best &
  worst model (with the spread between them).
- **Mention Rate Over Time:** the trend line by week. You want it climbing.
- **Mention Rate by Model:** find the shortest bar — that's the AI to fix.
- **Brand Visibility Distribution:** how this project's mention volume compares to
  **your other projects** (see the SoV caveat in section 10).
- **Sentiment:** overall donut + per-model split.
- **Content Opportunities:** the table of prompts under 20% mention rate, each with
  a "Create content" link. This is your to-do list.
- A **timeframe selector** (top right) exists; only **Weekly** is active today.

### GEO Audit Tools / Tools Audit GEO — fix the website
- **GEO Score Audit:** paste any URL, get a 0-100 score and a checklist of 7 things
  AIs look for (llms.txt, FAQ section, a "What is [brand]?" definition, structured
  lists, meta description, JSON-LD schema, sitemap). Failed items show first with
  fix instructions; "Copy all recommendations" gives you a checklist to hand the
  client's developer.
- **llms.txt generator:** builds a small brand fact-file to upload to the domain
  root so AI crawlers describe the brand accurately. (This is also audit check #1.)
- **Nginx config generator:** a server snippet so the site welcomes AI bots
  (GPTBot, ClaudeBot, PerplexityBot). For the client's developer.
- **Backlink Targets:** an AI-generated list of Reddit/Medium/forum/directory
  places where the brand should get mentioned — your off-site distribution targets.

### Boost your AI Ranking / Naikkan Ranking AI — semantic gaps
Analyzes the brand's existing mentions and extracts the **concepts AIs already
associate with it**, then shows **missing concepts** a strong brand in this
industry should own, plus the concepts **competitors** own. Those missing concepts
are content briefs: write content that naturally pairs the brand with them. Run it
after you have scan data.

### AI Articles / Artikel AI — generate content
Pick a prompt (use the "Gaps only" toggle to focus on weak ones) and generate a
GEO-optimized article: H1 + intro + H2 sections + an FAQ + conclusion, ~600-900
words, with the brand named naturally a few times. Download as Markdown or HTML.
**You publish it on the brand's own website** — Fratello does not publish for you.
The "Create content" links on the analytics gaps deep-link straight here with the
prompt pre-selected.

### To-Do / Daftar Tugas — distribution log + impact
After you publish content somewhere (the brand site, a Reddit thread, a Medium
post), log it here with its URL and publish date. Fratello compares the mention
rate in the **7 days before vs 7 days after** each publish date and shows you the
delta, so you can see whether a placement actually moved the needle.

### Settings / Billing / Usage
- **Settings:** notification sensitivity (alerts when mention rate drops by 5/20/50
  points week-over-week), email/WhatsApp channels, theme, language.
- **Billing:** the current plan and upgrade (Stripe in USD, Midtrans in IDR).
- **Usage:** quota usage per brand (prompts, articles, models).

---

## 6. Your first day with a new brand (runbook)

1. **Create the project.** Use Onboarding or "New project": brand name, website,
   industry, real competitors. (Replace the auto-suggested placeholder competitors
   with the real ones.)
2. **Build the prompt pool.** Go to **Prompts** and click **Generate with AI**
   (you must do this — it does not happen automatically). Then go to
   **AI Prompt Research**, discover real questions, and import the relevant ones.
   Aim to cover all 6 categories; ~25-50 prompts is a healthy start.
3. **Run the first scan** from the Overview. Wait (several minutes); reload to see
   results.
4. **Read the baseline** on Overview + Agents Insights. Note the overall mention
   rate, the weakest model, and the sentiment split.
5. **Audit the site** in GEO Audit Tools. Generate llms.txt and the Nginx config;
   send the failed-check recommendations + those two files to the client's dev.
6. **Pick the top 3 gaps** from Content Opportunities and generate articles; hand
   them to the client to publish.
7. **Get distribution targets** (Backlink Targets), publish/seed content there, and
   **log each placement** in To-Do.
8. **Schedule a weekly re-scan** habit and watch the trend line.

---

## 7. How to read the numbers

| Metric | Good | Needs work |
|---|---|---|
| Overall mention rate | >= 60% strong | < 30% low; 30-59% decent |
| Week-over-week | up arrow | flat or down |
| By-model bars | tall and even | one very short bar = invisible on that AI |
| Sentiment | large green (positive) wedge | visible red, or mostly neutral (named but not endorsed) |
| Content Opportunities | short/empty table | long table = many questions where the brand is invisible |
| Trend line | climbing week over week | flat near the bottom |

A **mention** means the AI named the brand. **Sentiment** is how it talked about
it *when it named it* (positive = recommended/praised, negative = criticized,
neutral = mentioned without judgement).

---

## 8. Turning numbers into actions

| You see | Do this |
|---|---|
| A prompt under 20% (Content Opportunities) | Click "Create content," generate an article for that exact question, publish it. |
| One model far behind the others | Open Citations, filter to that model + "Not mentioned," read what it recommends instead, then target the sources that engine cites. |
| Red / "Mentioned negatively" rows | Open the row, read the actual complaint wording, address the underlying issue and the public sources behind it. |
| Mostly neutral sentiment | Push content that frames the brand with positive attributes ("trusted," "leading") in the contexts AIs cite. |
| Missing concepts (Boost AI Ranking) | Treat each as a content brief; write content pairing the brand with that concept. |
| Low GEO Audit score | Fix the failed checks (start with the high-impact ones), generate + ship llms.txt and the Nginx config. |
| Want competitor comparison | Create a separate project for each competitor and scan it (see section 10). |

---

## 9. Plan limits (what each tier is meant to allow)

| Plan | Prompts | Models | Articles / month | Price |
|---|---|---|---|---|
| Starter ($49) | 25 | 3 | 4 | Rp 750k |
| Pro ($149) | 100 | 4 (all) | 8 | Rp 2.25jt |
| Agency ($399) | unlimited | 4 (all) | unlimited | Rp 6jt |

> Note: these caps are shown in the UI but are **not currently enforced** in the
> backend (see Gotchas). Treat them as the intended limits for client conversations.

---

## 10. Gotchas & honest caveats (read this so you are not misled)

These are real behaviors of the current build. Knowing them saves you confusion.

1. **Prompts are NOT auto-created when you add a brand.** The setup screen says
   "we automatically create prompts" — that is not true yet. You must open Prompts
   and click **Generate with AI**, or import from Research. Without prompts, a scan
   cannot run.
2. **Scans are slow and have no real progress feed.** Progress is estimated by
   counting new results; the live tracker stops watching after ~6 minutes even if
   the scan is still running. Big scans finish in the background — just reload the
   page later.
3. **"Share of Voice" / Brand Visibility Distribution is same-account, not
   competitors.** It compares this project to **your other projects**, not to the
   market. With one project it is 100%. To benchmark a real competitor, **create a
   separate project for that competitor and scan it**, then compare mention rates.
4. **Sentiment and mention detection are simple heuristics.** "Mentioned" is a
   literal text match of the brand name (so a typo or paraphrase reads as "not
   mentioned," and a common-word brand name can over-count). Sentiment is a
   keyword counter, English-only, with no "not" handling. **Always verify on the
   Citations page** before acting on a sentiment label.
5. **"Regenerate" prompts deletes ALL prompts**, including ones you imported from
   Research, then makes a fresh AI set. Do not regenerate after you have curated a
   pool — you will lose the imported questions.
6. **There is no per-prompt edit / delete / pause.** To remove a bad prompt today
   you regenerate the whole pool (destructive). Build the pool carefully.
7. **Trends are weekly only.** The Daily/Monthly timeframe options are "coming
   soon." Week-over-week needs at least 2 weeks of scan history to show anything.
8. **The Citations summary cards count only the current page**, not the whole
   brand. For true brand-wide totals, use Agents Insights.
9. **Articles are downloadable files you publish manually.** Fratello generates
   the Markdown/HTML; the client deploys it. "Ready to publish" does not mean
   published, and nothing auto-triggers a re-scan afterward.
10. **Article generation uses Claude only**, even though scanning uses all 4 models.
11. **Drop alerts may not fire reliably yet** (a known backend issue) — do not
    depend on them; check the dashboard yourself.
12. **GEO Audit checks read raw HTML**, so a site that renders content with
    JavaScript can fail checks even when the page looks fine to a human. Re-check
    the actual page source if a result looks wrong.
13. **Menu labels do not match URLs** (Citations -> /results, Boost -> /semantic,
    To-Do -> /distribution). Navigate via the sidebar.

---

## 11. Glossary

- **GEO** — Generative Engine Optimization: getting a brand into AI answers.
- **Prompt** — a brand-neutral question Fratello asks the AIs to test for mentions.
- **Mention rate** — % of AI answers that named the brand (the core KPI).
- **Scan** — one full run of every prompt x 4 models x 5 repeats.
- **Sentiment** — how an AI talked about the brand when it named it.
- **Gap / Content Opportunity** — a prompt where the brand is mentioned in under
  20% of answers; your content to-do.
- **Semantic proximity** — the concepts AIs associate with the brand.
- **llms.txt** — a brand fact-file at the domain root for AI crawlers.
- **Share of Voice (here)** — this project's mention volume vs your other projects
  (not competitors — see Gotcha #3).
- **Model** — one of the four AIs tracked: ChatGPT (OpenAI), Gemini, Perplexity,
  Claude (Anthropic).

---

*Maintained by the Fratello team. If something in the product contradicts this
guide, the product changed — tell the team so this stays accurate.*
