export type Section = { heading?: string; body: string }

export type Post = {
  slug: string
  category: string
  date: string
  title: string
  excerpt: string
  sections: Section[]
}

export const posts: Post[] = [
  {
    slug: 'apa-itu-geo',
    category: 'Panduan',
    date: '20 Juni 2026',
    title: 'Apa itu GEO? Panduan Lengkap Generative Engine Optimization',
    excerpt:
      'GEO adalah praktik mengoptimalkan konten brand agar direkomendasikan oleh mesin AI seperti ChatGPT, Gemini, dan Perplexity — bukan hanya muncul di hasil pencarian Google.',
    sections: [
      {
        body: 'Selama lebih dari dua dekade, SEO (Search Engine Optimization) menjadi strategi utama brand untuk ditemukan secara online. Namun lanskap digital berubah cepat. Kini, jutaan orang tidak lagi membuka Google dan memilih tautan — mereka langsung bertanya ke mesin AI dan mengikuti rekomendasinya.',
      },
      {
        heading: 'Apa itu GEO?',
        body: 'GEO (Generative Engine Optimization) adalah praktik mengoptimalkan konten, reputasi, dan kehadiran digital sebuah brand agar mesin AI seperti ChatGPT, Gemini, Perplexity, dan Claude menyebutnya secara positif saat menjawab pertanyaan yang relevan.',
      },
      {
        heading: 'Bedanya dengan SEO',
        body: 'SEO berfokus pada peringkat di halaman hasil pencarian (SERP). GEO berfokus pada apakah brand Anda disebut dan direkomendasikan di dalam jawaban yang dihasilkan AI. Pada SEO, user masih memilih sendiri tautan mana yang diklik. Pada GEO, AI yang memilih — dan sering kali hanya menyebut satu atau dua brand.',
      },
      {
        heading: 'Mengapa ini penting sekarang?',
        body: 'Data kami menunjukkan lebih dari 2,4 juta pertanyaan bertipe "rekomendasi produk" dikirimkan ke mesin AI setiap bulan — dan angka ini terus tumbuh. Jika brand Anda tidak hadir dalam jawaban itu, pesaing Anda yang mendapat kepercayaan konsumen.',
      },
      {
        heading: 'Tiga pilar GEO',
        body: 'Pertama, kredibilitas konten: mesin AI cenderung menyebut brand yang memiliki konten berkualitas, otoritatif, dan konsisten di berbagai platform. Kedua, reputasi eksternal: ulasan, sebutan di media, dan backlink relevan membantu AI "belajar" tentang brand Anda. Ketiga, struktur data: informasi yang terstruktur dan mudah dipahami mesin (schema markup, FAQ terstruktur) meningkatkan kemungkinan disebutkan.',
      },
      {
        heading: 'Langkah awal yang bisa Anda ambil',
        body: 'Mulailah dengan mengaudit visibilitas AI brand Anda: tanyakan langsung ke ChatGPT atau Gemini tentang kategori produk Anda dan lihat siapa yang disebut. Jika brand Anda tidak muncul, itu sinyal bahwa ada gap yang perlu diisi. Fratello mengotomatiskan proses ini dengan mengirim ratusan prompt ke empat mesin AI setiap minggu, lalu melaporkan hasilnya dalam satu dasbor.',
      },
    ],
  },
  {
    slug: 'mengapa-brand-harus-peduli-ai',
    category: 'Strategi',
    date: '14 Juni 2026',
    title: 'Mengapa Brand Harus Mulai Peduli dengan Visibilitas AI Sekarang',
    excerpt:
      'Setiap bulan lebih dari 2,4 juta pertanyaan tentang produk diajukan ke mesin AI. Jika brand Anda tidak terlihat di sana, pesaing Anda yang akan direkomendasikan.',
    sections: [
      {
        body: 'Ada pergeseran besar dalam cara konsumen mencari rekomendasi. Dahulu mereka mengetik di Google, memindai sepuluh tautan teratas, dan memilih. Sekarang mereka bertanya ke AI dan menerima satu jawaban yang sudah dikurasi. Perbedaan ini terdengar kecil, tapi implikasinya bagi brand sangat besar.',
      },
      {
        heading: 'Dari sepuluh pilihan menjadi satu rekomendasi',
        body: 'Di halaman hasil pencarian Google, brand bisa bersaing untuk sepuluh posisi teratas. Di jawaban AI, sering kali hanya ada satu atau dua brand yang disebut. Ini bukan lagi soal siapa yang ada di halaman pertama — ini soal siapa yang disebut sama sekali.',
      },
      {
        heading: 'Angka yang tidak bisa diabaikan',
        body: 'Berdasarkan data yang kami kumpulkan, lebih dari 2,4 juta pertanyaan bertema rekomendasi produk dan layanan dikirimkan ke mesin AI populer setiap bulan. Kategori yang paling aktif: kuliner, fashion, teknologi, keuangan, dan kesehatan. Jika bisnis Anda berada di salah satu kategori ini, kemungkinan besar calon pelanggan Anda sudah menanyakan rekomendasi ke AI — dan menerima nama brand lain.',
      },
      {
        heading: 'Siapa yang paling rentan?',
        body: 'Brand yang belum membangun reputasi digital yang kuat paling berisiko. Mesin AI belajar dari data yang tersedia: artikel, ulasan, sebutan di forum, dan konten resmi. Brand yang minim jejak digital akan "tidak terlihat" oleh AI, bukan karena produknya buruk, tapi karena informasinya tidak cukup untuk dipelajari.',
      },
      {
        heading: 'Jendela peluang yang masih terbuka',
        body: 'Kabar baiknya: ekosistem GEO masih sangat muda. Mayoritas brand belum mengukur visibilitas AI mereka, apalagi mengoptimalkannya. Ini berarti brand yang bergerak sekarang bisa membangun posisi yang kuat sebelum kompetisi memanas. Dalam dunia SEO, brand yang masuk lebih awal menikmati keunggulan bertahun-tahun. GEO berpotensi sama.',
      },
      {
        heading: 'Apa yang harus dilakukan?',
        body: 'Langkah pertama adalah mengukur. Anda tidak bisa mengoptimalkan sesuatu yang tidak Anda ukur. Mulai dengan mengetahui seberapa sering brand Anda disebutkan, dalam konteks apa, dan di mesin AI mana. Dari data itulah strategi yang tepat bisa dibangun.',
      },
    ],
  },
  {
    slug: 'cara-kerja-audit-geo',
    category: 'Produk',
    date: '7 Juni 2026',
    title: 'Bagaimana Audit GEO Fratello Bekerja di Balik Layar',
    excerpt:
      'Kami mengirim ratusan prompt ke empat mesin AI setiap minggu untuk mengukur seberapa sering dan seberapa positif brand Anda disebut — inilah cara kami melakukannya.',
    sections: [
      {
        body: 'Salah satu pertanyaan paling sering kami terima dari pengguna baru: "Bagaimana kalian tahu apa yang dikatakan AI tentang brand saya?" Jawabannya adalah proses yang kami sebut Audit GEO — dan di artikel ini kami jelaskan secara transparan cara kerjanya.',
      },
      {
        heading: 'Langkah 1: Menyusun bank prompt',
        body: 'Setiap brand memiliki kategori dan konteks yang berbeda. Sebelum mulai memantau, Fratello menyusun bank prompt yang relevan untuk brand tersebut. Misalnya untuk brand sepatu lokal, promptnya bisa berupa: "sepatu lari lokal terbaik 2026", "rekomendasi sneakers nyaman untuk harian", "brand sepatu Indonesia yang kualitasnya bagus". Bank prompt ini dibangun dari riset kata kunci, tren pencarian, dan input langsung dari brand.',
      },
      {
        heading: 'Langkah 2: Mengirim prompt ke empat mesin AI',
        body: 'Fratello mengirimkan setiap prompt ke ChatGPT (OpenAI), Gemini (Google), Perplexity, dan Claude (Anthropic) — empat mesin yang paling banyak digunakan konsumen saat ini. Setiap mesin memiliki karakteristik berbeda dalam merespons: Perplexity lebih berbasis web real-time, sementara ChatGPT lebih bergantung pada data training. Karena itu, brand perlu terlihat di semua, bukan hanya satu.',
      },
      {
        heading: 'Langkah 3: Menganalisis respons',
        body: 'Setelah respons diterima, sistem kami menganalisis tiga hal: apakah brand disebutkan (mention rate), bagaimana sentimen penyebutannya — positif, netral, atau negatif (sentiment score), dan di posisi mana brand disebutkan dalam jawaban (ranking position). Data ini dikumpulkan dari setiap prompt di setiap mesin, menghasilkan ribuan titik data per bulan.',
      },
      {
        heading: 'Langkah 4: Melacak perubahan dari waktu ke waktu',
        body: 'Satu snapshot tidak cukup. Fratello menjalankan audit ini secara berkala — idealnya mingguan — sehingga brand bisa melihat tren: apakah visibilitas naik setelah merilis konten baru? Apakah ada mesin AI tertentu yang mulai menyebut brand setelah ulasan positif bermunculan? Tren inilah yang membantu brand memahami apa yang bekerja.',
      },
      {
        heading: 'Langkah 5: Melaporkan dalam dasbor',
        body: 'Semua data dirangkum dalam dasbor Fratello yang bisa diakses kapan saja. Tidak ada laporan PDF bulanan yang sudah basi saat dibaca — data diperbarui secara otomatis dan bisa di-drill down per mesin, per prompt, atau per periode. Brand bisa langsung melihat di mana mereka kuat dan di mana ada celah yang perlu diisi.',
      },
    ],
  },
]

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}
