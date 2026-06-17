# GEOnineten - Fitur Platform

GEOnineten adalah platform SaaS untuk melacak dan meningkatkan visibilitas brand di
jawaban AI assistant: ChatGPT (OpenAI), Gemini, Perplexity, dan Claude (Anthropic).
Platform mengukur seberapa sering sebuah brand disebut, menganalisis konteksnya, lalu
membantu menutup celah lewat konten dan distribusi yang dioptimalkan untuk LLM.

---

## Fitur inti (engine)

### 1. Brand Mention Tracker
Lacak seberapa sering brand Anda disebut oleh AI. Setiap prompt dikueri 5 kali per
model untuk akurasi statistik. Setiap hasil mencatat apakah brand disebut, sentimennya
(positif/netral/negatif), dan kalimat konteks tempat brand muncul. Mendukung 4 model:
ChatGPT, Gemini, Perplexity, dan Claude. Eksekusi berjalan lewat antrian BullMQ
sehingga non-blocking dan otomatis di-retry bila gagal.

### 2. Prompt Pool Generator
Hasilkan otomatis 25 pertanyaan relevan memakai AI dalam lima kategori inti: Discovery,
Comparison, Recommendation, Use-Case, dan Best-Of (alur discovery juga dapat
memunculkan kategori "organic"). Prompt sengaja tidak menyebut nama brand secara
langsung agar menguji organic mention.

### 3. Analytics Dashboard
Visualisasi lengkap performa brand: mention rate per model, mention rate keseluruhan,
model terbaik dan terburuk, breakdown sentimen, tren mingguan (hingga 12 minggu),
analisis prompt gap (prompt dengan mention rate di bawah 20 persen), dan share of voice
antar brand dalam satu akun.

### 4. GEO Content Engine
Hasilkan artikel otomatis dari gap analysis. Artikel 600-900 kata yang menyebut brand
secara natural 3-5 kali, distrukturkan khusus agar mudah dipahami dan diindeks oleh
LLM. Output dapat diekspor dalam format Markdown atau HTML.

### 5. Semantic Intelligence
Analisis konsep apa saja yang muncul bersama brand di jawaban AI:
- **Semantic Proximity**: konsep yang paling sering muncul bersama brand, masing-masing
  diberi skor frekuensi.
- **Semantic Gap Detection**: konsep yang seharusnya diasosiasikan dengan brand tetapi
  belum muncul, sehingga menjadi roadmap konten.
- **Competitor Comparison**: bandingkan konsep unggulan kompetitor vs brand Anda sebagai
  panduan positioning.

### 6. Content Distribution Tracker
Catat konten yang sudah dipublikasikan (Reddit, Medium, forum, blog, dan lainnya) lalu
ukur dampaknya terhadap mention rate: bandingkan periode sebelum vs sesudah publikasi,
hitung impact score, dan identifikasi platform distribusi paling efektif.

### 7. Technical GEO Tools
Empat alat teknis untuk optimasi brand di crawler AI:
- **llms.txt Generator**: buat berkas informasi brand yang dapat dibaca AI crawler
  (GPTBot, ClaudeBot, PerplexityBot).
- **Nginx Bot Routing Config**: konfigurasi Nginx untuk mendeteksi bot dan menyajikan
  konten yang ramah AI.
- **GEO Score Audit**: audit website dan beri skor 0-100 berdasarkan kriteria optimasi
  GEO, lengkap dengan rekomendasi prioritas.
- **Backlink Target Finder**: sarankan platform publikasi terbaik berdasarkan industri
  untuk distribusi konten.

### 8. Alert System
Kirim notifikasi otomatis via email dan WhatsApp ketika mention rate turun melebihi
threshold yang dapat dikonfigurasi. Pengecekan dijalankan terjadwal; threshold dan
kanal notifikasi dapat diatur per user.

### 9. Auto-Scan Scheduler
Jadwalkan scan otomatis per brand (harian atau mingguan) tanpa perlu trigger manual,
dijalankan lewat cron service.

### 10. Payment & Plan System
Tiga tier plan (Starter, Pro, Agency) dengan pembayaran via Stripe (USD global) dan
Midtrans (IDR Indonesia). Fitur di-gate otomatis sesuai plan: kuota artikel, jumlah
model, dan jumlah prompt.

### 11. Admin Panel
Kelola seluruh user platform: lihat daftar user, ubah plan secara manual, dan pantau
statistik brand di seluruh platform.

---

## Dashboard & pengalaman pengguna

### Laporan Visibilitas AI
Halaman laporan bertanggal dan berlabel brand yang merangkum mention rate, performa per
model, sentimen, tren, dan peluang teratas. Dapat dicetak atau disimpan sebagai PDF
langsung dari browser, cocok sebagai deliverable untuk klien.

### Antrian "Lakukan Berikutnya"
Daftar aksi berprioritas di halaman Ringkasan yang menggabungkan tiga sinyal: gap
konten, pemeriksaan audit GEO yang gagal, dan celah semantik. Diurutkan berdasarkan
dampak sehingga spesialis langsung tahu langkah paling berpengaruh berikutnya.

### Dashboard Portofolio Multi-Brand
Halaman Semua Project menampilkan mention rate tiap brand beserta perubahan minggu ke
minggu, dirangkum dari data analytics tiap brand. Berguna untuk pengguna agensi yang
memantau banyak klien sekaligus.

### Onboarding Terpandu & Scan Pertama
Alur onboarding enam langkah (brand, website, industri, kompetitor) dilanjutkan setup
terpandu: buat prompt sekali klik lalu jalankan scan pertama, sehingga dashboard tidak
kosong setelah brand baru dibuat.

### Getting Started
Checklist langkah awal yang melacak progres nyata (sudah punya project, sudah punya
prompt, sudah punya hasil scan) untuk memandu pengguna baru sampai memperoleh data
pertama.

### Riset Pertanyaan
Halaman untuk mengeksplorasi pertanyaan dan prompt di ruang brand sebelum
memasukkannya ke prompt pool.

### Pemakaian Kuota
Halaman yang menunjukkan berapa banyak kuota paket (prompt, artikel, model) yang sudah
terpakai di seluruh project.

### Dwibahasa & tema
Seluruh antarmuka tersedia dalam Bahasa Indonesia dan Inggris, serta tema terang dan
gelap, dan dapat diganti kapan saja.

---

## Autentikasi & akun

Autentikasi memakai JWT yang disimpan di cookie, dengan password di-hash memakai bcrypt.
Tersedia register, login, logout, dan endpoint profil. Setiap request frontend membawa
cookie tersebut untuk mengakses API yang dilindungi.
