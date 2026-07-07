/**
 * Bilingual marketing copy (Indonesian + English). Single source of truth for
 * every visible string on the landing page, nav, and footer, so the language
 * toggle swaps the whole surface. Deliberately written WITHOUT em dashes.
 *
 * Icons/structure live in the components; this file is text only. `en` is typed
 * as `typeof id`, so the two languages must stay structurally identical.
 */

const id = {
  nav: {
    items: [
      { label: 'Fitur', href: '#fitur' },
      { label: 'Cara Kerja', href: '#cara-kerja' },
      { label: 'Solusi', href: '#solusi' },
      { label: 'Blog', href: '/blog' },
      { label: 'Tentang', href: '/about' },
      { label: 'Pertanyaan Umum', href: '#faq' },
    ],
    login: 'Masuk',
    demo: 'Jadwalkan Demo',
  },
  hero: {
    kicker: 'Platform GEO: Lacak, Analisis, Optimalkan',
    titleBefore: 'Buat brand Anda dibaca',
    titleAfter: 'lalu direkomendasikan ke manusia.',
    demo: 'Jadwalkan Demo',
    secondary: 'Lihat cara kerjanya',
  },
  preview: {
    caption:
      'Bukan laporan PDF bulanan, melainkan dasbor langsung yang diperbarui otomatis. Semua angka di sini hanya contoh tampilan produk.',
  },
  engines: {
    title: 'Memantau empat mesin AI yang paling sering ditanyai pelanggan Anda',
    auto: 'Dipantau otomatis',
    fivex: '5x per model',
  },
  ticker: {
    eyebrow: 'Permintaan yang terus tumbuh',
    count: 2_400_000,
    suffix: '+',
    label: 'pertanyaan seperti ini ditanyakan ke mesin AI setiap bulan',
    prompts: [
      'sepatu lari terbaik 2026',
      'rekomendasi sneakers harian',
      'sepatu olahraga yang awet',
      'brand sepatu lokal terbaik',
      'sepatu kerja paling nyaman',
      'sepatu untuk kaki lebar',
      'sepatu lari murah berkualitas',
      'sneakers putih serbaguna',
    ],
  },
  shift: {
    eyebrow: 'Pergeseran sedang terjadi',
    title: 'Pelanggan kini bertanya ke AI, bukan hanya ke Google.',
    lead: 'Saat seseorang meminta rekomendasi ke ChatGPT atau Perplexity, jawabannya hanya menyebut beberapa nama. Jika model tidak mengenal brand Anda, Anda tidak terlihat, dan tidak ada halaman kedua untuk menyusul.',
    seoTag: 'SEO, cara lama',
    seoBody: 'Mengejar kata kunci untuk muncul di daftar tautan. Pengguna masih harus mengeklik dan memilih sendiri.',
    geoTag: 'GEO, cara baru',
    geoBody: 'Membuat brand Anda disebut di dalam jawaban AI. AI yang memilihkan, dan hanya ada sedikit nama di sana.',
    answerLabel: 'Jawaban AI',
    answerText: 'Untuk itu, beberapa pilihan terbaik adalah',
    answerBrand: 'brand Anda',
    answerTail: 'dan beberapa lainnya.',
    seoPos: 'brand Anda (posisi 4)',
  },
  how: {
    eyebrow: 'Cara kerja',
    title: 'Lacak. Analisis. Optimalkan. Lalu ulangi.',
    lead: 'Visibilitas di AI bukan proyek sekali jadi, melainkan siklus. Fratello menjalankan ketiganya secara otomatis lewat antrian pekerjaan, sehingga angka Anda terus diperbarui tanpa kerja manual.',
    stepLabel: 'Langkah',
    steps: [
      { title: 'Lacak', desc: 'Fratello menanyakan prompt kategori Anda ke empat model AI, lima kali per model, dan mencatat setiap kali brand Anda disebut.' },
      { title: 'Analisis', desc: 'Lihat tingkat penyebutan, pangsa suara, dan sentimen Anda dibanding kompetitor, lengkap dengan celah yang perlu ditutup.' },
      { title: 'Optimalkan', desc: 'Buat artikel dan distribusi yang menutup celah, lalu pantau angka Anda naik di setiap model.' },
    ],
    loopNote: 'Setiap optimasi memberi data baru untuk dilacak, sehingga siklusnya terus berputar.',
  },
  features: {
    eyebrow: 'Fitur',
    title: 'Satu mesin, dari tidak terlihat menjadi direkomendasikan.',
    lead: 'Semua kemampuan bekerja sebagai satu sistem, dari melihat posisi Anda hari ini sampai menyebarkan konten yang menaikkannya.',
    tabs: ['Pelacakan', 'Analitik', 'Sitasi', 'Audit GEO', 'Naikkan Peringkat', 'Artikel AI', 'Distribusi'],
    lacak: {
      eyebrow: 'Lacak',
      title: 'Pelacakan penyebutan di empat model, berjalan sendiri.',
      lead: 'Fratello menjalankan prompt kategori Anda ke ChatGPT, Gemini, Perplexity, dan Claude, masing-masing lima kali, lalu mencatat setiap kali brand Anda disebut. Semuanya lewat antrian pekerjaan.',
      bullets: [
        'Pelacakan 4 model dalam satu kali jalan.',
        'Tiap prompt diuji 5x agar tingkat penyebutan stabil.',
        'Riset pertanyaan nyata yang ditanyakan calon pelanggan.',
      ],
    },
    analisis: {
      eyebrow: 'Analisis',
      title: 'Tingkat penyebutan, pangsa suara, sentimen, dan tren dalam satu layar.',
      lead: 'Berhenti menebak. Lihat persis seberapa sering Anda muncul, dibanding kompetitor mana, dengan nada bicara apa, dan ke arah mana trennya bergerak.',
      bullets: [
        'Pangsa suara dibanding kompetitor langsung.',
        'Sentimen positif, netral, atau negatif.',
        'Ketahui model AI mana yang perlu diperbaiki lebih dulu.',
      ],
    },
    optimize: {
      eyebrow: 'Optimalkan',
      title: 'Dari celah yang ditemukan menjadi tindakan yang menaikkan angka.',
    },
    audit: { title: 'Audit GEO', desc: 'Skor kesiapan GEO, generator llms.txt, dan konfigurasi bot AI untuk Nginx.', checklist: ['Skor kesiapan GEO', 'Generator llms.txt', 'Konfigurasi bot AI (Nginx)'] },
    semantic: {
      title: 'Naikkan Peringkat AI',
      desc: 'Optimasi kedekatan semantik agar brand Anda muncul dekat konsep yang relevan.',
      points: ['Petakan kedekatan brand dengan konsep relevan', 'Temukan celah makna yang perlu ditutup', 'Muncul berdampingan dengan kata kunci penting'],
    },
    citations: {
      title: 'Sitasi',
      desc: 'Sumber dan tautan yang dirujuk AI saat menyebut brand Anda.',
      points: ['Lihat sumber yang dirujuk tiap model AI', 'Pahami konten apa yang paling berpengaruh', 'Temukan peluang sitasi baru'],
    },
    article: {
      title: 'Artikel AI',
      desc: 'Artikel yang dioptimalkan untuk AI dari celah pelacakan, siap terbit.',
      points: ['Dibuat dari celah pelacakan nyata', 'Dioptimalkan agar dikutip mesin AI', 'Keluar siap terbit dalam Markdown atau HTML'],
    },
    distribution: {
      title: 'Distribusi & Dampak',
      desc: 'Sebarkan konten ke sumber yang dirujuk AI, lalu ukur dampaknya pada visibilitas.',
      tags: ['Reddit', 'Forum', 'Publikasi', 'Dampak terukur'],
      points: ['Sebarkan ke sumber yang dirujuk AI', 'Pantau status tiap publikasi', 'Ukur dampaknya pada visibilitas'],
    },
  },
  comparison: {
    eyebrow: 'Manual vs otomatis',
    title: 'Yang lain mengerjakannya dengan tangan. Fratello menjalankan mesinnya.',
    lead: 'Jasa GEO manual menagih per jam dan mengirim laporan sesekali. Fratello berjalan terus-menerus, melacak, menganalisis, dan membantu mengoptimalkan tanpa menunggu orang.',
    aspect: 'Aspek',
    manual: 'Manual / Agensi',
    rows: [
      { label: 'Pengujian', manual: 'Dicek sesekali, sering hanya satu model', fratello: 'Empat model, 5x per prompt, otomatis' },
      { label: 'Frekuensi', manual: 'Laporan bulanan', fratello: 'Pemantauan berkelanjutan lewat antrian' },
      { label: 'Pangsa suara & sentimen', manual: 'Jarang, dihitung manual', fratello: 'Otomatis dan langsung di dasbor' },
      { label: 'Sitasi sumber', manual: 'Tidak terlacak', fratello: 'Sumber yang dirujuk AI tercatat' },
      { label: 'Pembuatan konten', manual: 'Ditulis manual, lambat', fratello: 'Artikel AI dari celah nyata, siap terbit' },
      { label: 'Biaya & skala', manual: 'Mahal per laporan', fratello: 'Berlangganan, berskala penuh' },
    ],
  },
  solutions: {
    eyebrow: 'Solusi',
    title: 'Dibuat untuk bisnis yang pelanggannya sudah bertanya ke AI.',
    lead: 'Apa pun industri Anda, polanya sama: calon pelanggan meminta rekomendasi ke AI sebelum memilih. Fratello memastikan nama Anda ikut disebut.',
    items: [
      { name: 'UMKM', desc: 'Bersaing lewat visibilitas AI, bukan anggaran iklan.' },
      { name: 'Agensi', desc: 'Kelola dan laporkan GEO banyak klien dari satu tempat.' },
      { name: 'E-commerce', desc: 'Muncul saat AI merekomendasikan produk di kategori Anda.' },
      { name: 'SaaS & Startup', desc: 'Jadi jawaban andalan saat orang menanyakan alat terbaik.' },
      { name: 'F&B & Restoran', desc: 'Direkomendasikan saat orang mencari tempat makan.' },
      { name: 'Kesehatan & Klinik', desc: 'Bangun kepercayaan lewat sebutan yang akurat dan positif.' },
      { name: 'Properti', desc: 'Tampil saat calon pembeli menanyakan kawasan dan hunian.' },
      { name: 'Industri lainnya', desc: 'Tidak melihat industri Anda? Fratello tetap bisa membantu.' },
    ],
  },
  stats: [
    { value: '3', label: 'Langkah otomatis', desc: 'Lacak, Analisis, dan Optimalkan berputar dalam satu siklus tanpa kerja manual.' },
    { value: '4 Model', label: 'Dipantau sekaligus', desc: 'ChatGPT, Gemini, Perplexity, dan Claude dalam satu tempat.' },
    { value: '5x', label: 'Per prompt per model', desc: 'Tiap pertanyaan diuji lima kali agar tingkat penyebutan akurat.' },
    { value: '100%', label: 'Otomatis', desc: 'Antrian pekerjaan menjalankan pelacakan tanpa kerja manual.' },
  ],
  faq: {
    eyebrow: 'Pertanyaan umum',
    title: 'Hal yang biasanya ditanyakan sebelum mulai.',
    items: [
      { q: 'Apa itu GEO?', a: 'GEO (Generative Engine Optimization) adalah upaya agar brand Anda disebut dan direkomendasikan oleh mesin AI seperti ChatGPT dan Perplexity, bukan sekadar peringkat di Google.' },
      { q: 'Apa bedanya GEO dengan SEO?', a: 'SEO mengejar kata kunci di mesin pencari klasik. GEO mengejar pertanyaan utuh dan kedekatan makna di dalam jawaban AI. Keduanya saling melengkapi, tetapi diukur dan dioptimalkan dengan cara yang berbeda.' },
      { q: 'Mengapa tiap prompt diuji lima kali?', a: 'Jawaban AI tidak selalu sama. Menanyakannya lima kali per model membuat tingkat penyebutan Anda akurat dan mewakili, bukan kebetulan dari satu kali pengecekan.' },
      { q: 'Model AI apa saja yang dipantau?', a: 'ChatGPT, Gemini, Perplexity, dan Claude, keempatnya dipantau otomatis dalam satu dasbor.' },
      { q: 'Apakah saya perlu tim teknis?', a: 'Tidak. Pelacakan berjalan otomatis, dan artikel keluar sebagai berkas siap terbit yang tinggal Anda unggah.' },
      { q: 'Bagaimana cara memulainya?', a: 'Jadwalkan demo untuk melihat Fratello bekerja langsung pada brand Anda, lalu pilih paket yang sesuai dengan kebutuhan Anda.' },
    ],
  },
  closing: {
    title: 'Lihat di mana brand Anda berdiri di mata AI.',
    lead: 'Jadwalkan demo dan kami tunjukkan langsung bagaimana Fratello bekerja pada brand Anda.',
    demo: 'Jadwalkan Demo',
    login: 'Masuk ke akun',
  },
  about: {
    hero: {
      eyebrow: 'Tentang Fratello',
      title: 'Platform yang membuat brand Anda dikenal, dipercaya, dan direkomendasikan oleh AI.',
      lead: 'Fratello melacak, menganalisis, dan menaikkan seberapa sering brand Anda disebut ChatGPT, Gemini, Perplexity, dan Claude ketika calon pelanggan bertanya rekomendasi.',
      pitch: 'Lacak seberapa sering AI menyebut brand Anda, temukan celahnya, lalu generate otomatis konten yang menutupnya, semua dalam satu platform.',
    },
    problem: {
      eyebrow: 'Kenapa ini penting',
      title: 'Pelanggan sudah pindah dari Google ke AI. Brand Anda ikut pindah belum?',
      body: [
        'Selama lebih dari dua dekade, SEO menentukan siapa yang ditemukan secara online. Kini jutaan orang tidak lagi mengetik di Google lalu memilih dari sepuluh tautan, mereka langsung bertanya ke ChatGPT, Gemini, atau Perplexity dan mengikuti jawabannya.',
        'Masalahnya, AI biasanya hanya menyebut satu atau dua nama per jawaban. Kalau brand Anda belum punya cukup jejak digital untuk "dipelajari" AI, Anda bukan cuma kalah bersaing, Anda benar-benar tidak ada dalam percakapan itu.',
      ],
    },
    framework: {
      eyebrow: 'Metodologi',
      title: 'Tiga lapis yang menentukan apakah AI menyebut brand Anda.',
      lead: 'GEO bukan versi baru dari SEO. Cara kerjanya berbeda, dan tiga lapis ini menjadi dasar setiap fitur Fratello.',
      layers: [
        {
          title: 'Questions, bukan keywords',
          desc: 'LLM belajar dari pertanyaan utuh, bukan potongan kata kunci. Optimasi harus berbasis intent lengkap, misalnya "distributor terigu grosir terpercaya Jakarta", bukan sekadar "distributor terigu".',
        },
        {
          title: 'Semantic proximity',
          desc: 'Brand Anda harus muncul berdekatan secara makna dengan konsep yang relevan di dalam korpus yang dipelajari AI. Contoh: brand F&B perlu co-occur dengan "halal certified" dan "trusted supplier", bukan cuma nama brand-nya sendiri.',
        },
        {
          title: 'Source: percakapan dan publikasi',
          desc: 'AI belajar dari percakapan publik (forum, Reddit, Q&A) dan artikel. Semakin sering brand Anda muncul di sumber ini dengan konteks yang tepat, semakin tinggi kemungkinan disebut.',
        },
      ],
    },
    differentiators: {
      eyebrow: 'Yang membuat Fratello berbeda',
      title: 'Bukan sekadar tracking. Sistem tertutup dari data sampai konten.',
      items: [
        {
          title: 'Proprietary backbone',
          desc: 'Semantic Intelligence adalah engine internal yang menganalisis bukan cuma seberapa sering brand disebut, tapi kenapa disebut atau tidak, dan apa langkah selanjutnya.',
        },
        {
          title: 'Closed-loop system',
          desc: 'Lacak, temukan celah, buat konten, distribusikan, lalu lacak lagi, semua dalam satu platform. Kompetitor kebanyakan hanya menangani satu atau dua tahap ini.',
        },
        {
          title: 'Akurasi statistik',
          desc: 'Setiap prompt diuji 5 kali per model, bukan sekali. Hasilnya merepresentasikan distribusi probabilistik jawaban AI yang sebenarnya, bukan snapshot satu momen.',
        },
        {
          title: 'Indonesia-first',
          desc: 'Pembayaran Midtrans IDR, alert WhatsApp, dan pemahaman konteks pasar lokal yang tidak dimiliki kebanyakan platform global.',
        },
        {
          title: 'Skala tanpa biaya per klien',
          desc: 'Paket Agency mengelola banyak brand dari satu akun berlangganan, bukan biaya per klien seperti agensi manual.',
        },
      ],
    },
    features: {
      eyebrow: 'Semua yang Anda dapat',
      title: 'Sepuluh kemampuan, satu alur kerja.',
      lead: 'Dari melihat posisi Anda hari ini sampai menyebarkan konten yang menaikkannya, semua bekerja sebagai satu sistem.',
      items: [
        { title: 'Brand Mention Tracker', desc: 'Tracking otomatis di ChatGPT, Gemini, Perplexity, dan Claude, 5x per prompt per model untuk akurasi statistik.' },
        { title: 'Analytics Dashboard', desc: 'Mention rate per model, share of voice vs kompetitor, tren mingguan, breakdown sentimen, dan tabel celah prompt.' },
        { title: 'Prompt Pool Generator', desc: 'AI menyusun 25 pertanyaan relevan dari nama brand dan industri Anda, terbagi dalam 5 kategori intent.' },
        { title: 'GEO Content Engine', desc: 'Artikel 600 sampai 900 kata dengan struktur LLM-friendly, dibuat langsung dari celah yang ditemukan, siap diunduh dan diterbitkan.' },
        { title: 'Semantic Intelligence', desc: 'Analisis kedekatan semantik, deteksi celah konsep, dan perbandingan konsep dengan kompetitor.' },
        { title: 'Content Distribution Tracker', desc: 'Catat di mana konten dipublikasikan dan ukur dampaknya pada mention rate, sebelum vs sesudah.' },
        { title: 'Technical GEO Tools', desc: 'Generator llms.txt, konfigurasi Nginx untuk AI bot, dan audit skor GEO berbasis 7 kriteria teknis.' },
        { title: 'Alert System', desc: 'Notifikasi email dan WhatsApp otomatis saat mention rate turun melewati ambang yang Anda tentukan.' },
        { title: 'Auto-Scan Scheduler', desc: 'Atur frekuensi scan (manual, harian, mingguan), platform berjalan tanpa perlu dipicu manual.' },
        { title: 'Multi-brand & Multi-plan', desc: 'Basic, Pro, dan Agency, dengan dukungan pembayaran Stripe (USD) dan Midtrans (IDR).' },
      ],
    },
    audience: {
      eyebrow: 'Untuk siapa',
      title: 'Dibuat untuk siapa pun yang pelanggannya sudah bertanya ke AI.',
      items: [
        { title: 'Brand owner', desc: 'Yang ingin tahu seberapa terlihat brand mereka di mata AI, dan apa yang harus diperbaiki.' },
        { title: 'Agensi digital marketing', desc: 'Yang ingin menawarkan layanan GEO ke kliennya tanpa membangun tooling sendiri.' },
        { title: 'Tim konten', desc: 'Yang butuh tahu persis konten apa yang harus dibuat selanjutnya, berdasarkan data, bukan tebakan.' },
        { title: 'E-commerce & startup', desc: 'Yang mulai sadar traffic dari AI lebih bernilai dari traffic pencarian biasa.' },
      ],
    },
    pricing: {
      eyebrow: 'Investasi',
      title: 'Tiga paket, semuanya scan harian.',
      lead: 'Kuota dihitung per bulan untuk jumlah artikel. Scan tetap 1x per hari di semua paket.',
      plans: [
        { name: 'Basic', price: '$49', priceIdr: 'Rp750rb', period: '/bulan', prompts: '40 prompt', models: '1 model (Gemini)', articles: '5 artikel/bulan' },
        { name: 'Pro', price: '$149', priceIdr: 'Rp2.25jt', period: '/bulan', prompts: '100 prompt', models: '4 model (semua)', articles: '30 artikel/bulan', highlight: true },
        { name: 'Agency', price: '$399', priceIdr: 'Rp6jt', period: '/bulan', prompts: '300 prompt', models: '4 model (semua)', articles: '100 artikel/bulan' },
      ],
    },
    closing: {
      title: 'Lihat sendiri di mana posisi brand Anda sekarang.',
      lead: 'Jadwalkan demo dan kami tunjukkan langsung hasil audit GEO untuk brand Anda.',
      demo: 'Jadwalkan Demo',
      secondary: 'Baca panduan GEO di blog',
    },
  },
  footer: {
    tagline: 'Buat brand Anda terbaca AI dan direkomendasikan ke manusia.',
    ctaTitle: 'Siap dilihat oleh AI?',
    ctaBody: 'Lihat seberapa sering brand Anda muncul di jawaban AI, lalu naikkan angkanya.',
    columns: [
      { title: 'Platform', links: [{ label: 'Fitur', href: '#fitur' }, { label: 'Cara Kerja', href: '#cara-kerja' }, { label: 'Solusi', href: '#solusi' }, { label: 'Pertanyaan Umum', href: '#faq' }] },
      { title: 'Perusahaan', links: [{ label: 'Masuk', href: '/sign-in' }] },
    ],
    rights: 'Platform GEO untuk pasar Indonesia.',
    legal: [{ label: 'Kebijakan Privasi', href: '/kebijakan-privasi' }, { label: 'Ketentuan Layanan', href: '/ketentuan-layanan' }],
  },
}

const en: typeof id = {
  nav: {
    items: [
      { label: 'Features', href: '#fitur' },
      { label: 'How it works', href: '#cara-kerja' },
      { label: 'Solutions', href: '#solusi' },
      { label: 'Blog', href: '/blog' },
      { label: 'About', href: '/about' },
      { label: 'FAQ', href: '#faq' },
    ],
    login: 'Sign in',
    demo: 'Book a demo',
  },
  hero: {
    kicker: 'GEO platform: Track, Analyze, Optimize',
    titleBefore: 'Make your brand read by',
    titleAfter: 'then recommended to people.',
    demo: 'Book a demo',
    secondary: 'See how it works',
  },
  preview: {
    caption:
      'Not a monthly PDF, but a live dashboard that updates automatically. Every figure here is only a sample of the product.',
  },
  engines: {
    title: 'Tracking the four AI engines your customers ask most',
    auto: 'Tracked automatically',
    fivex: '5x per model',
  },
  ticker: {
    eyebrow: 'Demand that keeps growing',
    count: 2_400_000,
    suffix: '+',
    label: 'questions like these are asked to AI engines every month',
    prompts: [
      'best running shoes 2026',
      'everyday sneaker recommendations',
      'durable sport shoes',
      'best local shoe brands',
      'most comfortable work shoes',
      'shoes for wide feet',
      'affordable quality running shoes',
      'versatile white sneakers',
    ],
  },
  shift: {
    eyebrow: 'A shift is happening',
    title: 'Customers now ask AI, not just Google.',
    lead: 'When someone asks ChatGPT or Perplexity for a recommendation, the answer names only a few brands. If the model does not know yours, you are invisible, and there is no second page to catch up on.',
    seoTag: 'SEO, the old way',
    seoBody: 'Chasing keywords to appear in a list of links. The user still has to click and choose for themselves.',
    geoTag: 'GEO, the new way',
    geoBody: 'Getting your brand named inside the AI answer. The AI chooses, and only a few names make it in.',
    answerLabel: 'AI answer',
    answerText: 'For that, some of the best options are',
    answerBrand: 'your brand',
    answerTail: 'among a few others.',
    seoPos: 'your brand (position 4)',
  },
  how: {
    eyebrow: 'How it works',
    title: 'Track. Analyze. Optimize. Then repeat.',
    lead: 'AI visibility is not a one-off project, it is a cycle. Fratello runs all three steps automatically through a job queue, so your numbers keep updating without manual work.',
    stepLabel: 'Step',
    steps: [
      { title: 'Track', desc: 'Fratello asks your category prompts to four AI models, five times per model, and records every time your brand is mentioned.' },
      { title: 'Analyze', desc: 'See your mention rate, share of voice, and sentiment against competitors, along with the gaps to close.' },
      { title: 'Optimize', desc: 'Create articles and distribution that close the gaps, then watch your numbers rise across every model.' },
    ],
    loopNote: 'Every optimization gives new data to track, so the cycle keeps turning.',
  },
  features: {
    eyebrow: 'Features',
    title: 'One engine, from invisible to recommended.',
    lead: 'Every capability works as one system, from seeing where you stand today to distributing the content that lifts you.',
    tabs: ['Tracking', 'Analytics', 'Citations', 'GEO Audit', 'Boost Ranking', 'AI Articles', 'Distribution'],
    lacak: {
      eyebrow: 'Track',
      title: 'Mention tracking across four models, running on its own.',
      lead: 'Fratello runs your category prompts to ChatGPT, Gemini, Perplexity, and Claude, five times each, then records every time your brand is mentioned. All through a job queue.',
      bullets: [
        'Four models tracked in a single run.',
        'Each prompt tested 5x for a stable mention rate.',
        'Research the real questions prospects ask.',
      ],
    },
    analisis: {
      eyebrow: 'Analyze',
      title: 'Mention rate, share of voice, sentiment, and trend on one screen.',
      lead: 'Stop guessing. See exactly how often you appear, against which competitors, in what tone, and which way the trend is moving.',
      bullets: [
        'Share of voice against direct competitors.',
        'Sentiment that is positive, neutral, or negative.',
        'Know which AI model to fix first.',
      ],
    },
    optimize: {
      eyebrow: 'Optimize',
      title: 'From the gaps you find to the actions that move the numbers.',
    },
    audit: { title: 'GEO Audit', desc: 'GEO readiness score, llms.txt generator, and AI bot config for Nginx.', checklist: ['GEO readiness score', 'llms.txt generator', 'AI bot config (Nginx)'] },
    semantic: {
      title: 'Boost AI Ranking',
      desc: 'Semantic proximity optimization so your brand appears near relevant concepts.',
      points: ['Map how close your brand sits to key concepts', 'Find the meaning gaps to close', 'Appear alongside the terms that matter'],
    },
    citations: {
      title: 'Citations',
      desc: 'The sources and links AI cites when it mentions your brand.',
      points: ['See the sources each AI model cites', 'Understand which content carries weight', 'Find new citation opportunities'],
    },
    article: {
      title: 'AI Articles',
      desc: 'AI-optimized articles built from tracking gaps, ready to publish.',
      points: ['Built from real tracking gaps', 'Optimized to be cited by AI engines', 'Exported ready to publish in Markdown or HTML'],
    },
    distribution: {
      title: 'Distribution & Impact',
      desc: 'Distribute content to the sources AI cites, then measure the impact on visibility.',
      tags: ['Reddit', 'Forums', 'Publications', 'Measured impact'],
      points: ['Distribute to the sources AI cites', 'Track the status of each publication', 'Measure the impact on visibility'],
    },
  },
  comparison: {
    eyebrow: 'Manual vs automated',
    title: 'Others do it by hand. Fratello runs the engine.',
    lead: 'Manual GEO services bill by the hour and send occasional reports. Fratello runs continuously, tracking, analyzing, and helping you optimize without waiting on people.',
    aspect: 'Aspect',
    manual: 'Manual / Agency',
    rows: [
      { label: 'Testing', manual: 'Checked occasionally, often one model', fratello: 'Four models, 5x per prompt, automated' },
      { label: 'Frequency', manual: 'Monthly reports', fratello: 'Continuous monitoring via the queue' },
      { label: 'Share of voice & sentiment', manual: 'Rare, counted by hand', fratello: 'Automatic and real-time on the dashboard' },
      { label: 'Source citations', manual: 'Not tracked', fratello: 'The sources AI cites are recorded' },
      { label: 'Content creation', manual: 'Written manually, slow', fratello: 'AI articles from real gaps, ready to publish' },
      { label: 'Cost & scale', manual: 'Expensive per report', fratello: 'Subscription, fully scalable' },
    ],
  },
  solutions: {
    eyebrow: 'Solutions',
    title: 'Built for businesses whose customers already ask AI.',
    lead: 'Whatever your industry, the pattern is the same: prospects ask AI for a recommendation before choosing. Fratello makes sure your name is mentioned too.',
    items: [
      { name: 'Small business', desc: 'Compete on AI visibility, not ad budget.' },
      { name: 'Agencies', desc: 'Manage and report GEO for many clients in one place.' },
      { name: 'E-commerce', desc: 'Show up when AI recommends products in your category.' },
      { name: 'SaaS & Startups', desc: 'Become the default answer when people ask for the best tool.' },
      { name: 'F&B & Restaurants', desc: 'Get recommended when people look for a place to eat.' },
      { name: 'Health & Clinics', desc: 'Build trust through accurate, positive mentions.' },
      { name: 'Property', desc: 'Appear when buyers ask AI about areas and homes.' },
      { name: 'Other industries', desc: 'Do not see your industry? Fratello can still help.' },
    ],
  },
  stats: [
    { value: '3', label: 'Automated steps', desc: 'Track, Analyze, and Optimize loop in one cycle with no manual work.' },
    { value: '4 Models', label: 'Tracked at once', desc: 'ChatGPT, Gemini, Perplexity, and Claude in one place.' },
    { value: '5x', label: 'Per prompt per model', desc: 'Every question is tested five times for an accurate mention rate.' },
    { value: '100%', label: 'Automated', desc: 'A job queue runs the tracking with no manual work.' },
  ],
  faq: {
    eyebrow: 'FAQ',
    title: 'What people usually ask before starting.',
    items: [
      { q: 'What is GEO?', a: 'GEO (Generative Engine Optimization) is the practice of getting your brand mentioned and recommended by AI engines like ChatGPT and Perplexity, not just ranked on Google.' },
      { q: 'How is GEO different from SEO?', a: 'SEO chases keywords on classic search engines. GEO chases full questions and meaning proximity inside AI answers. They complement each other, but are measured and optimized differently.' },
      { q: 'Why is each prompt tested five times?', a: 'AI answers are not always the same. Asking five times per model makes your mention rate accurate and representative, not a fluke from a single check.' },
      { q: 'Which AI models are tracked?', a: 'ChatGPT, Gemini, Perplexity, and Claude, all tracked automatically in one dashboard.' },
      { q: 'Do I need a technical team?', a: 'No. Tracking runs automatically, and articles come out as ready-to-publish files you simply upload.' },
      { q: 'How do I get started?', a: 'Book a demo to see Fratello work on your brand directly, then choose the plan that fits your needs.' },
    ],
  },
  closing: {
    title: 'See where your brand stands in the eyes of AI.',
    lead: 'Book a demo and we will show you exactly how Fratello works on your brand.',
    demo: 'Book a demo',
    login: 'Sign in to your account',
  },
  about: {
    hero: {
      eyebrow: 'About Fratello',
      title: 'The platform that makes your brand known, trusted, and recommended by AI.',
      lead: 'Fratello tracks, analyzes, and raises how often your brand is mentioned by ChatGPT, Gemini, Perplexity, and Claude when prospects ask for a recommendation.',
      pitch: 'Track how often AI mentions your brand, find the gaps, and automatically generate content that closes them, all in one platform.',
    },
    problem: {
      eyebrow: 'Why this matters',
      title: 'Customers already moved from Google to AI. Has your brand moved with them?',
      body: [
        'For over two decades, SEO decided who got found online. Now millions of people no longer type into Google and scan ten links, they ask ChatGPT, Gemini, or Perplexity directly and follow the answer.',
        'The problem is AI usually names only one or two brands per answer. If yours does not have enough of a digital footprint for AI to "learn" from, you are not just losing the competition, you simply are not part of the conversation.',
      ],
    },
    framework: {
      eyebrow: 'Methodology',
      title: 'Three layers that decide whether AI mentions your brand.',
      lead: 'GEO is not just a new version of SEO. It works differently, and these three layers are the foundation of every Fratello feature.',
      layers: [
        {
          title: 'Questions, not keywords',
          desc: 'LLMs learn from full questions, not keyword fragments. Optimization has to target complete intent, like "trusted wholesale flour distributor Jakarta", not just "flour distributor".',
        },
        {
          title: 'Semantic proximity',
          desc: 'Your brand needs to appear close in meaning to relevant concepts inside the corpus AI learns from. Example: an F&B brand needs to co-occur with "halal certified" and "trusted supplier", not just its own name in isolation.',
        },
        {
          title: 'Source: conversation and publications',
          desc: 'AI learns from public conversation (forums, Reddit, Q&A) and articles. The more your brand appears in these sources with the right context, the higher the chance it gets mentioned.',
        },
      ],
    },
    differentiators: {
      eyebrow: 'What makes Fratello different',
      title: 'Not just tracking. A closed loop from data to content.',
      items: [
        {
          title: 'Proprietary backbone',
          desc: 'Semantic Intelligence is an internal engine that analyzes not just how often a brand is mentioned, but why it is or is not, and what to do next.',
        },
        {
          title: 'Closed-loop system',
          desc: 'Track, find the gap, create content, distribute it, then track again, all in one platform. Most competitors only handle one or two of these stages.',
        },
        {
          title: 'Statistical accuracy',
          desc: 'Every prompt is tested 5 times per model, not once. The result represents the actual probabilistic distribution of AI answers, not a single-moment snapshot.',
        },
        {
          title: 'Indonesia-first',
          desc: 'Midtrans IDR payments, WhatsApp alerts, and an understanding of local market context that most global platforms lack.',
        },
        {
          title: 'Scale without per-client cost',
          desc: 'The Agency plan manages many brands from a single subscription, not a per-client fee like a manual agency.',
        },
      ],
    },
    features: {
      eyebrow: 'Everything you get',
      title: 'Ten capabilities, one workflow.',
      lead: 'From seeing where you stand today to distributing the content that lifts you, everything works as one system.',
      items: [
        { title: 'Brand Mention Tracker', desc: 'Automatic tracking across ChatGPT, Gemini, Perplexity, and Claude, 5x per prompt per model for statistical accuracy.' },
        { title: 'Analytics Dashboard', desc: 'Mention rate per model, share of voice against competitors, weekly trend, sentiment breakdown, and a prompt gap table.' },
        { title: 'Prompt Pool Generator', desc: 'AI builds 25 relevant questions from your brand name and industry, split across 5 intent categories.' },
        { title: 'GEO Content Engine', desc: '600 to 900 word articles with an LLM-friendly structure, built straight from the gaps found, ready to download and publish.' },
        { title: 'Semantic Intelligence', desc: 'Semantic proximity analysis, concept gap detection, and concept comparison against competitors.' },
        { title: 'Content Distribution Tracker', desc: 'Record where content was published and measure its impact on mention rate, before versus after.' },
        { title: 'Technical GEO Tools', desc: 'llms.txt generator, Nginx config for AI bots, and a GEO score audit based on 7 technical criteria.' },
        { title: 'Alert System', desc: 'Automatic email and WhatsApp notifications when mention rate drops past a threshold you set.' },
        { title: 'Auto-Scan Scheduler', desc: 'Set the scan frequency (manual, daily, weekly), the platform runs without needing a manual trigger.' },
        { title: 'Multi-brand & Multi-plan', desc: 'Basic, Pro, and Agency, with Stripe (USD) and Midtrans (IDR) payment support.' },
      ],
    },
    audience: {
      eyebrow: 'Who it is for',
      title: 'Built for anyone whose customers already ask AI.',
      items: [
        { title: 'Brand owners', desc: 'Who want to know how visible their brand is to AI, and what to fix.' },
        { title: 'Digital marketing agencies', desc: 'Who want to offer GEO services to clients without building their own tooling.' },
        { title: 'Content teams', desc: 'Who need to know exactly what content to create next, based on data, not guesswork.' },
        { title: 'E-commerce & startups', desc: 'Who are realizing AI traffic is worth more than ordinary search traffic.' },
      ],
    },
    pricing: {
      eyebrow: 'Investment',
      title: 'Three plans, all with a daily scan.',
      lead: 'Quota is counted per month for articles. Scans stay at 1x per day on every plan.',
      plans: [
        { name: 'Basic', price: '$49', priceIdr: 'Rp750k', period: '/month', prompts: '40 prompts', models: '1 model (Gemini)', articles: '5 articles/month' },
        { name: 'Pro', price: '$149', priceIdr: 'Rp2.25M', period: '/month', prompts: '100 prompts', models: '4 models (all)', articles: '30 articles/month', highlight: true },
        { name: 'Agency', price: '$399', priceIdr: 'Rp6M', period: '/month', prompts: '300 prompts', models: '4 models (all)', articles: '100 articles/month' },
      ],
    },
    closing: {
      title: 'See for yourself where your brand stands right now.',
      lead: 'Book a demo and we will show you a real GEO audit for your brand.',
      demo: 'Book a demo',
      secondary: 'Read the GEO guides on our blog',
    },
  },
  footer: {
    tagline: 'Make your brand readable to AI and recommended to people.',
    ctaTitle: 'Ready to be seen by AI?',
    ctaBody: 'See how often your brand appears in AI answers, then raise the number.',
    columns: [
      { title: 'Platform', links: [{ label: 'Features', href: '#fitur' }, { label: 'How it works', href: '#cara-kerja' }, { label: 'Solutions', href: '#solusi' }, { label: 'FAQ', href: '#faq' }] },
      { title: 'Company', links: [{ label: 'Sign in', href: '/sign-in' }] },
    ],
    rights: 'The GEO platform for the Indonesian market.',
    legal: [{ label: 'Privacy Policy', href: '/kebijakan-privasi' }, { label: 'Terms of Service', href: '/ketentuan-layanan' }],
  },
}

export type { Lang } from './locale'
import type { Lang } from './locale'
export type MarketingCopy = typeof id
export const MARKETING_COPY: Record<Lang, MarketingCopy> = { id, en }
