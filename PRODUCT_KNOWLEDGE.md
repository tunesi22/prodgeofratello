# Product Knowledge — GEO Platform

---

## Apa itu GEO?

**GEO (Generative Engine Optimization)** adalah strategi untuk membuat brand kamu disebut oleh AI seperti ChatGPT, Gemini, Perplexity, dan Claude ketika orang-orang nanya sesuatu yang relevan dengan bisnis kamu.

### GEO vs SEO — apa bedanya?

| | SEO | GEO |
|---|---|---|
| Target | Google ranking | AI mention |
| Unit | Keyword | Question / intent |
| Output | Link di search result | Disebut langsung di jawaban AI |
| Cara kerja | Backlink + keyword density | Semantic proximity + source authority |
| Ukuran sukses | Posisi #1 di Google | Mention rate % di LLM |

### Kenapa GEO penting sekarang?

Orang udah mulai nanya ke AI dulu sebelum Google. Kalau brand kamu gak disebut di jawaban ChatGPT waktu orang nanya *"aplikasi padel terbaik di Jakarta"* — kamu invisible. Bukan karena produkmu jelek, tapi karena LLM gak punya cukup informasi tentang kamu.

GEO adalah cara untuk ngisi gap itu.

---

## Cara kerja GEO (framework Raymond Chin)

Ada 3 lapis yang harus dioptimasi:

**1. Questions, bukan keywords**
LLM belajar dari pertanyaan, bukan fragmen kata. Optimasi harus berbasis intent lengkap: *"distributor terigu grosir terpercaya Jakarta"* — bukan cuma *"distributor terigu"*.

**2. Semantic proximity**
Brand kamu harus muncul dekat secara semantik dengan konsep-konsep yang relevan di korpus LLM. Contoh: kalau brand kamu di industri F&B, harus co-occur dengan *"halal certified"*, *"free delivery"*, *"trusted supplier"* — bukan cuma nama brand-nya doang yang muncul.

**3. Source: conversation + journal**
LLM belajar dari percakapan publik (Reddit, forum, Q&A) dan artikel/publikasi. Makin banyak kamu ada di sumber-sumber ini dengan konteks yang relevan, makin tinggi mention rate kamu.

---

## Fitur Platform Kita

### 1. Brand Mention Tracker
Tracking otomatis seberapa sering brand kamu disebut di 4 LLM utama:
- ChatGPT (GPT-4o)
- Gemini 2.0 Flash
- Perplexity Sonar
- Claude Haiku

Setiap prompt di-query **5x per model** untuk akurasi statistik. Total: 1 brand = 500 query jobs per scan.

**Output:** Mention rate % per model, overall score, tabel hasil per prompt.

---

### 2. Analytics Dashboard
Visualisasi lengkap performa brand di AI:

- **Mention Rate per Model** — bar chart, model mana yang paling sering sebut kamu
- **Share of Voice** — pie chart, kamu vs kompetitor
- **Trend over Time** — area chart, naik/turun tiap minggu
- **Sentiment Breakdown** — positif/netral/negatif
- **Prompt Gap Table** — prompt mana yang mention rate-nya < 20% (butuh konten baru)

---

### 3. Prompt Pool Generator
Input: nama brand + industri → Claude auto-generate **25 pertanyaan relevan** dalam 5 kategori:
- Discovery (orang pertama kali nyari)
- Comparison (lagi bandingin pilihan)
- Recommendation (minta saran)
- Use-case (spesifik kebutuhan)
- Best-of (list terbaik)

Ini yang jadi dasar semua tracking. Bukan keyword, tapi questions.

---

### 4. GEO Content Engine
Generate artikel yang dioptimasi untuk di-capture LLM, langsung dari gap analysis:

- Ambil prompt dengan mention rate rendah (gap)
- Claude generate artikel 600–900 kata yang strukturnya LLM-friendly (H1, H2, FAQ, definisi)
- Download sebagai `.md` atau `.html` — siap publish di website klien

---

### 5. Semantic Intelligence *(Fase 5 — proprietary)*
Fitur ini yang bikin platform kita beda dari semua kompetitor:

**Semantic Proximity Analysis**
Analisa konsep apa yang co-occur dengan brand kamu di jawaban AI. Contoh output:
- "fast delivery" — 78% mentions
- "trusted supplier" — 45% mentions
- "halal certified" — 12% mentions ← gap

**Semantic Gap Detection**
Identifikasi konsep yang SEHARUSNYA dekat dengan brand kamu tapi belum muncul di AI responses. Ini yang jadi target konten berikutnya.

**Competitor Concept Comparison**
Lihat konsep apa yang competitor kamu punya tapi kamu belum. Langsung jadi roadmap konten.

---

### 6. Content Distribution Tracker
Track di mana kamu publish konten + ukur dampaknya ke mention rate:

- Catat: platform (Reddit, Medium, Forum, Blog), URL, tanggal publish
- Platform otomatis hitung: mention rate 7 hari sebelum vs 7 hari sesudah publish
- Output: Impact score per publikasi (+3%, -1%, etc.)
- Identifikasi platform mana yang paling efektif untuk industri kamu

---

### 7. Technical GEO Tools

**llms.txt Generator**
File khusus yang kasih tau AI tentang brand kamu — nama, industri, key facts, usage policy. Dipasang di root domain (`yourdomain.com/llms.txt`).

**Nginx Bot Routing Config**
Config snippet untuk detect GPTBot, ClaudeBot, PerplexityBot dan serve mereka konten yang optimal. Copy-paste ke server klien.

**GEO Score Audit**
Input URL → platform cek 7 kriteria teknis:
1. llms.txt present
2. FAQ section
3. Brand definition heading
4. Structured lists (5+ items)
5. Meta description (50+ chars)
6. JSON-LD schema markup
7. Sitemap reference

Output: Score 0–100 + checklist rekomendasi.

**Backlink Target Finder**
Claude suggest 10 platform spesifik berdasarkan industri — subreddit, Medium tags, forum, direktori — tempat terbaik untuk publish konten biar di-index LLM.

---

### 8. Alert System
Notifikasi otomatis kalau mention rate drop:

- Deteksi: week-over-week drop > threshold (default 20%)
- Channel: Email (via Resend) + WhatsApp (via WaConnectHub)
- Konfigurasi: user bisa set threshold sendiri

---

### 9. Auto-Scan Scheduler
Set frekuensi scan: Manual / Daily / Weekly — platform jalan otomatis tanpa harus trigger manual.

---

### 10. Payment & Plan
| Plan | Harga | Prompts | Models | Artikel/bulan |
|---|---|---|---|---|
| Basic | $49/bulan | 40 | 1 (Gemini) | 5 |
| Pro | $149/bulan | 100 | semua (4) | 30 |
| Agency | $399/bulan | 300 | semua (4) | 100 |

Payment: **Stripe (USD)** untuk market global, **Midtrans (IDR)** untuk market Indonesia.

---

## Kenapa Harus Pakai Punya Kita?

### vs Kompetitor (promptingcompany.com dan sejenisnya)

| | Mereka | Kita |
|---|---|---|
| Cara kerja | Manual audit | Fully automated |
| Tracking | Snapshot | Continuous + trend |
| Content | Rekomendasi manual | Auto-generate via AI |
| Semantic analysis | Tidak ada | ✅ Proprietary |
| Distribution tracking | Tidak ada | ✅ With impact delta |
| Payment Indonesia | Tidak ada | ✅ Midtrans IDR |
| Alert otomatis | Tidak ada | ✅ Email + WhatsApp |
| Price | $500+/bulan (agency fee) | Mulai $49/bulan (self-serve) |

### Keunggulan utama

**1. Proprietary backbone**
Semantic Intelligence (Fase 5) adalah engine internal yang gak dimiliki kompetitor mana pun. Bukan cuma tracking mention, tapi analisa *kenapa* brand disebut atau tidak disebut — dan apa yang harus dilakukan.

**2. Closed-loop system**
Track → Analisa gap → Generate konten → Distribute → Track lagi. Semua dalam satu platform. Kompetitor cuma handle 1-2 tahap.

**3. Statistical accuracy**
Query 5x per prompt per model (bukan 1x). Hasilnya represent distribusi probabilistik LLM yang sebenarnya, bukan snapshot satu momen.

**4. Indonesia-first**
Midtrans IDR, WhatsApp alert, dan understanding konteks lokal. Platform global tidak punya ini.

**5. Scalable pricing**
Agency bisa manage banyak klien dari satu account. Bukan per-klien fee, tapi unlimited brands di plan Agency.

---

## Target User

- **Brand owner** yang mau tau seberapa visible mereka di AI
- **Digital marketing agency** yang mau tawarkan layanan GEO ke kliennya
- **Content team** yang butuh tau konten apa yang harus dibuat selanjutnya
- **E-commerce / startup** yang mulai nyadar traffic dari AI lebih valuable dari Google

---

## One-liner Pitch

> *"Track how often AI mentions your brand, find the gaps, and automatically generate content that closes them — all in one platform."*
