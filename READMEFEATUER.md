# GEOnineten — Fitur Platform

GEOnineten adalah platform SaaS untuk melacak dan meningkatkan visibilitas brand di jawaban AI assistant — ChatGPT, Gemini, Perplexity, dan Claude.

---

## Fitur

### 1. Brand Mention Tracker
Lacak seberapa sering brand kamu disebut oleh AI. Setiap prompt dikueri 5 kali per model untuk akurasi statistik. Setiap hasil mencatat apakah brand disebut, sentimennya (positif/netral/negatif), dan kalimat konteks di mana brand muncul. Mendukung 4 model: ChatGPT, Gemini, Perplexity, dan Claude.

### 2. Prompt Pool Generator
Generate otomatis 25 pertanyaan relevan menggunakan AI dalam 5 kategori: Discovery, Comparison, Recommendation, Use-Case, dan Best-Of. Prompt tidak menyebut nama brand secara langsung agar menguji organic mention.

### 3. Analytics Dashboard
Visualisasi lengkap performa brand: mention rate per model, overall mention rate, best & worst model, breakdown sentimen, tren 12 minggu, prompt gap analysis (prompt dengan mention rate < 20%), dan share of voice antar brand dalam satu akun.

### 4. GEO Content Engine
Generate artikel otomatis dari hasil gap analysis. Artikel 600–900 kata dengan menyebut brand secara natural 3–5 kali, distrukturisasi khusus agar mudah dipahami dan diindeks oleh LLM. Output bisa diexport dalam format Markdown atau HTML.

### 5. Semantic Intelligence
Analisis konsep apa saja yang muncul bersama brand di jawaban AI:
- **Semantic Proximity** — top 20 konsep yang paling sering muncul bersama brand, masing-masing diberi skor frekuensi
- **Semantic Gap Detection** — konsep yang seharusnya diasosiasikan dengan brand tapi belum muncul, jadi roadmap konten
- **Competitor Comparison** — bandingkan konsep unggulan kompetitor vs brand kamu untuk panduan positioning

### 6. Content Distribution Tracker
Catat konten yang sudah dipublikasikan (Reddit, Medium, forum, blog, dll) dan ukur dampaknya terhadap mention rate: bandingkan 7 hari sebelum vs sesudah publish, hitung impact score, dan identifikasi platform distribusi paling efektif.

### 7. Technical GEO Tools
Empat generator teknis untuk optimasi brand di crawler AI:
- **llms.txt Generator** — buat file informasi brand yang bisa dibaca AI crawler (GPTBot, ClaudeBot, PerplexityBot)
- **Nginx Bot Routing Config** — konfigurasi Nginx untuk deteksi dan sajikan konten AI-friendly ke bot
- **GEO Score Audit** — audit website dan beri skor 0–100 berdasarkan 7 kriteria optimasi GEO, lengkap dengan rekomendasi prioritas
- **Backlink Target Finder** — sarankan 10 platform publikasi terbaik berdasarkan industri untuk distribusi konten

### 8. Alert System
Kirim notifikasi otomatis via email dan WhatsApp ketika mention rate turun melebihi threshold yang bisa dikonfigurasi. Cek dilakukan setiap minggu, threshold dan channel notifikasi bisa diatur per user.

### 9. Auto-Scan Scheduler
Jadwalkan scan otomatis per brand: harian atau mingguan, tanpa perlu trigger manual.

### 10. Payment & Plan System
Tiga tier plan (Starter, Pro, Agency) dengan pembayaran via Stripe (USD global) dan Midtrans (IDR Indonesia). Fitur di-gate otomatis sesuai plan: kuota artikel, pilihan model, dan jumlah prompt.

### 11. Admin Panel
Kelola seluruh user platform: lihat daftar user, ubah plan secara manual, dan monitor statistik brand di seluruh platform.
