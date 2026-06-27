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

export type Lang = 'id' | 'en'
export type MarketingCopy = typeof id
export const MARKETING_COPY: Record<Lang, MarketingCopy> = { id, en }
