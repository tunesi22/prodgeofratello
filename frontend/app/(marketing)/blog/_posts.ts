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
  {
    slug: 'geo-vs-seo-mana-lebih-penting-2026',
    category: 'Strategi',
    date: '27 Juni 2026',
    title: 'GEO vs SEO: Mana yang Lebih Penting di 2026?',
    excerpt:
      'SEO belum mati, tapi GEO tumbuh jauh lebih cepat. Inilah perbandingan jujur keduanya dan bagaimana brand Indonesia harus membagi prioritas di tahun 2026.',
    sections: [
      {
        body: 'Pertanyaan ini semakin sering muncul di kalangan marketer Indonesia: apakah masih worth it menghabiskan budget untuk SEO, sementara trafik dari pencarian AI terus naik? Jawabannya tidak sesederhana "pilih salah satu" — tapi ada nuansa penting yang perlu dipahami.',
      },
      {
        heading: 'Kondisi SEO di 2026',
        body: 'SEO tradisional masih relevan. Google masih memproses miliaran kueri per hari dan masih menjadi entry point utama untuk banyak kategori pencarian — terutama pencarian lokal, produk e-commerce, dan konten how-to. Namun, trafik organik dari Google mulai tergerus oleh fitur AI Overview yang muncul di posisi paling atas dan menjawab pertanyaan tanpa perlu klik.',
      },
      {
        heading: 'Kebangkitan GEO',
        body: 'GEO tumbuh dari nol menjadi disiplin pemasaran yang diakui hanya dalam dua tahun terakhir. Pemicunya jelas: ChatGPT kini digunakan lebih dari 400 juta orang per bulan, Perplexity tumbuh 10x dalam setahun, dan Gemini semakin terintegrasi ke ekosistem Google. Semakin banyak konsumen yang melewati tahap "browsing" dan langsung ke "tanya AI, langsung beli".',
      },
      {
        heading: 'Perbedaan mendasar cara kerja keduanya',
        body: 'SEO bekerja melalui sinyal teknis: backlink, kecepatan halaman, struktur URL, keyword density. GEO bekerja melalui sinyal kepercayaan dan otoritas: seberapa sering brand disebut di sumber yang dipercaya AI, seberapa konsisten narasi tentang brand di berbagai platform, dan seberapa positif sentimen di ulasan dan diskusi online.',
      },
      {
        heading: 'Mana yang lebih efisien untuk brand Indonesia?',
        body: 'Untuk brand dengan budget terbatas: fokuskan 60% ke GEO, 40% ke SEO. Alasannya: kompetisi GEO di Indonesia masih jauh lebih rendah dibanding SEO, sehingga effort yang sama menghasilkan dampak yang lebih besar. Untuk brand enterprise: jalankan keduanya secara paralel karena banyak sinyal GEO (konten berkualitas, ulasan positif, sebutan di media) juga menguatkan SEO.',
      },
      {
        heading: 'Kesimpulan',
        body: 'SEO dan GEO bukan kompetitor — mereka saling menguatkan. Konten yang bagus untuk GEO (otoritatif, informatif, terpercaya) juga bagus untuk SEO. Yang berbeda adalah metrik keberhasilannya: SEO diukur dari peringkat dan klik, GEO diukur dari mention rate dan sentiment score di jawaban AI.',
      },
    ],
  },
  {
    slug: 'chatgpt-search-kalahkan-google-5-kategori',
    category: 'Berita',
    date: '27 Juni 2026',
    title: 'ChatGPT Search Resmi Unggul dari Google di 5 Kategori Pencarian Ini',
    excerpt:
      'Riset terbaru Juni 2026 mengungkap ChatGPT Search mulai mengambil pangsa pasar Google di kategori rekomendasi produk, perjalanan, keuangan, kesehatan, dan teknologi.',
    sections: [
      {
        body: 'Selama bertahun-tahun, pertanyaan "apakah ada yang bisa mengalahkan Google?" selalu dijawab dengan "belum". Tapi data dari riset independen yang dirilis minggu ini mulai menggambarkan realitas yang berbeda — setidaknya untuk lima kategori pencarian tertentu.',
      },
      {
        heading: 'Lima kategori di mana ChatGPT Search unggul',
        body: 'Riset yang melibatkan 12.000 pengguna di Asia Tenggara menunjukkan ChatGPT Search lebih dipilih dibanding Google untuk: (1) rekomendasi produk dengan banyak pilihan, (2) perencanaan perjalanan dan itinerary, (3) pertanyaan keuangan personal, (4) informasi kesehatan yang membutuhkan penjelasan mendalam, dan (5) perbandingan produk teknologi. Alasan utamanya: jawaban AI lebih langsung dan tidak memaksa pengguna membaca 10 tautan berbeda.',
      },
      {
        heading: 'Apa artinya untuk brand?',
        body: 'Jika brand Anda bermain di salah satu dari lima kategori ini, artinya calon pelanggan Anda kini lebih mungkin menemukan rekomendasi melalui ChatGPT dibanding Google. Pertanyaannya bukan lagi "apakah situs saya ada di halaman 1 Google?" tapi "apakah AI menyebut brand saya saat ditanya tentang kategori produk saya?"',
      },
      {
        heading: 'Google tidak diam',
        body: 'Sebagai respons, Google terus memperluas AI Overview dan mengintegrasikan Gemini lebih dalam ke hasil pencarian. Ironisnya, ini justru memperkuat urgensi GEO: brand kini harus dioptimalkan tidak hanya untuk algoritma pencarian Google, tapi juga untuk cara Gemini memilih informasi yang ditampilkan di AI Overview.',
      },
      {
        heading: 'Tren yang akan terus berlanjut',
        body: 'Analis memprediksi bahwa pada akhir 2026, lebih dari 30% pencarian yang sebelumnya masuk ke Google akan beralih ke mesin AI. Bagi brand yang sudah membangun visibilitas AI hari ini, ini adalah keunggulan kompetitif yang signifikan. Bagi brand yang belum mulai, setiap hari adalah keterlambatan.',
      },
    ],
  },
  {
    slug: 'perplexity-ai-100-juta-pengguna',
    category: 'Berita',
    date: '27 Juni 2026',
    title: 'Perplexity AI Tembus 100 Juta Pengguna Aktif — Apa Dampaknya untuk Brand?',
    excerpt:
      'Platform AI search Perplexity mengumumkan pencapaian 100 juta pengguna aktif bulanan per Juni 2026. Ini bukan sekadar angka — ini sinyal pergeseran besar perilaku konsumen.',
    sections: [
      {
        body: 'Perplexity AI, mesin pencari berbasis AI yang diluncurkan pada 2022, baru saja mengumumkan pencapaian yang mengejutkan industri: 100 juta pengguna aktif per bulan per Juni 2026. Setahun lalu, angkanya masih di kisaran 10 juta. Pertumbuhan 10x dalam 12 bulan ini bukan anomali — ini adalah konfirmasi bahwa AI search sudah mainstream.',
      },
      {
        heading: 'Kenapa Perplexity tumbuh begitu cepat?',
        body: 'Perplexity unggul karena model bisnisnya yang unik: setiap jawaban dilengkapi dengan sumber yang bisa diklik, sehingga terasa lebih terpercaya dibanding jawaban AI yang tidak transparan. Ini menarik pengguna yang sebelumnya ragu menggunakan AI karena takut halusinasi. Selain itu, Perplexity secara agresif membangun integrasi dengan berbagai perangkat dan platform, termasuk Samsung dan beberapa operator telekomunikasi besar.',
      },
      {
        heading: 'Perplexity dan cara ia memilih brand untuk disebut',
        body: 'Berbeda dengan ChatGPT yang lebih bergantung pada data training, Perplexity aktif mengindeks web secara real-time. Artinya, brand yang konsisten menghasilkan konten segar — artikel blog, ulasan terbaru, press release — memiliki peluang lebih besar untuk muncul di jawaban Perplexity. Ini membuat strategi konten menjadi komponen krusial dalam GEO untuk Perplexity.',
      },
      {
        heading: 'Implikasi untuk strategi brand di Indonesia',
        body: 'Perplexity kini masuk dalam daftar platform yang wajib dipantau, bukan hanya ChatGPT dan Gemini. Brand Indonesia yang aktif di Perplexity bisa membangun keunggulan awal sebelum kompetitor menyadari urgensinya. Fratello memantau Perplexity sebagai salah satu dari empat mesin AI utama yang dilacak setiap minggunya.',
      },
    ],
  },
  {
    slug: 'brand-lokal-indonesia-viral-chatgpt-juni-2026',
    category: 'Studi Kasus',
    date: '27 Juni 2026',
    title: '5 Brand Lokal Indonesia yang Paling Sering Disebut ChatGPT di Juni 2026',
    excerpt:
      'Dari ribuan brand lokal Indonesia, hanya segelintir yang konsisten muncul di rekomendasi ChatGPT. Apa yang membuat mereka berbeda?',
    sections: [
      {
        body: 'Setiap bulan, tim riset Fratello menganalisis pola penyebutan brand Indonesia di berbagai mesin AI. Di Juni 2026, kami menemukan pola menarik: brand-brand yang paling sering muncul bukan selalu yang paling besar secara revenue — tapi yang paling kuat secara jejak digital.',
      },
      {
        heading: 'Apa yang membuat brand lokal disebut AI?',
        body: 'Dari analisis kami, ada tiga faktor yang konsisten muncul pada brand yang sering disebut ChatGPT: pertama, mereka memiliki konten edukatif yang kuat di website dan blog mereka. Kedua, mereka aktif merespons dan mengumpulkan ulasan di berbagai platform — Google Maps, Tokopedia, Shopee. Ketiga, mereka sering disebutkan di artikel media online, forum diskusi, dan komunitas niche yang relevan.',
      },
      {
        heading: 'Pola yang bisa ditiru',
        body: 'Brand-brand ini tidak mengeluarkan budget marketing yang luar biasa besar. Yang membedakan mereka adalah konsistensi. Mereka rutin memproduksi konten, aktif meminta ulasan dari pelanggan, dan membangun hubungan dengan komunitas online yang relevan. Ini adalah fondasi GEO yang bisa direplikasi oleh brand dengan skala apapun.',
      },
      {
        heading: 'Kesempatan yang masih terbuka lebar',
        body: 'Di mayoritas kategori produk Indonesia, "persaingan AI" masih sangat rendah. Banyak kategori di mana ChatGPT hampir tidak bisa menyebut satu pun brand lokal — yang berarti brand pertama yang mengisi kekosongan ini akan mendapat keunggulan besar. Audit GEO adalah cara tercepat untuk mengetahui apakah kategori Anda termasuk yang masih kosong.',
      },
    ],
  },
  {
    slug: 'google-ai-overview-update-juni-2026',
    category: 'Berita',
    date: '27 Juni 2026',
    title: 'Google AI Overview: Update Besar Juni 2026 dan Dampaknya untuk Brand',
    excerpt:
      'Google merilis pembaruan signifikan pada fitur AI Overview di akhir Juni 2026. Tampilan baru, cakupan lebih luas, dan cara baru AI memilih brand untuk disebut.',
    sections: [
      {
        body: 'Google AI Overview — fitur yang menampilkan ringkasan berbasis AI di bagian paling atas hasil pencarian — kini hadir di lebih dari 40 negara dan mencakup hampir semua kategori kueri. Update Juni 2026 membawa perubahan signifikan yang langsung berdampak pada visibilitas brand di pencarian Google.',
      },
      {
        heading: 'Apa yang berubah di update Juni 2026?',
        body: 'Pertama, AI Overview kini muncul untuk lebih banyak jenis kueri, termasuk pencarian produk lokal dan rekomendasi layanan. Kedua, format tampilannya berubah: kini lebih sering menyebut nama brand secara eksplisit disertai alasan singkat. Ketiga, Google menambahkan fitur "brand comparison" di beberapa kategori, di mana AI secara langsung membandingkan dua atau tiga brand dalam satu jawaban.',
      },
      {
        heading: 'Bagaimana Gemini memilih brand yang disebut?',
        body: 'Berdasarkan analisis kami terhadap ratusan AI Overview, Gemini cenderung menyebut brand yang: (1) memiliki halaman Google Business Profile yang lengkap dan aktif, (2) memiliki rating tinggi dengan jumlah ulasan yang signifikan, (3) sering disebutkan di situs berita dan artikel yang diindeks Google, dan (4) memiliki konten website yang relevan dengan kueri yang ditanyakan pengguna.',
      },
      {
        heading: 'Strategi adaptasi untuk brand',
        body: 'Brand yang ingin muncul di AI Overview perlu memastikan tiga hal: profil Google Business Profile diperbarui secara rutin, konten website menjawab pertanyaan yang sering ditanyakan konsumen (bukan hanya menjual produk), dan aktif mengelola reputasi online melalui respons ulasan dan kehadiran di media.',
      },
      {
        heading: 'Dampak terhadap trafik organik',
        body: 'Data awal menunjukkan halaman yang disebut di AI Overview mengalami peningkatan trafik branded search — orang yang melihat nama brand di AI Overview kemudian mencari nama brand tersebut secara langsung. Ini menciptakan pola trafik baru yang berbeda dari SEO tradisional dan menjadi argumen kuat untuk mulai menginvestasikan waktu di GEO.',
      },
    ],
  },
  {
    slug: 'strategi-geo-industri-fnb-2026',
    category: 'Strategi',
    date: '26 Juni 2026',
    title: 'Strategi GEO untuk Industri F&B Indonesia: Panduan Lengkap 2026',
    excerpt:
      'Industri makanan dan minuman adalah salah satu yang paling aktif ditanyakan ke mesin AI. Ini panduan GEO spesifik untuk brand F&B yang ingin mendominasi rekomendasi AI.',
    sections: [
      {
        body: 'Setiap hari, jutaan konsumen Indonesia bertanya ke ChatGPT, Gemini, dan Perplexity tentang rekomendasi restoran, produk makanan, minuman kekinian, dan brand kuliner lokal. Industri F&B adalah salah satu kategori dengan volume pertanyaan AI tertinggi — dan sayangnya, masih banyak brand F&B yang belum optimal secara GEO.',
      },
      {
        heading: 'Prompt yang paling sering ditanyakan ke AI untuk kategori F&B',
        body: 'Dari analisis kami, ada beberapa pola prompt yang mendominasi: "kopi susu lokal terbaik 2026", "brand minuman boba yang worth it", "snack sehat Indonesia yang enak", "restoran fine dining Jakarta yang recommended", "produk makanan UMKM yang viral". Brand yang muncul sebagai jawaban pertanyaan-pertanyaan ini mendapat exposure yang luar biasa tanpa biaya iklan.',
      },
      {
        heading: 'Langkah 1: Optimalkan Google Business Profile',
        body: 'Untuk brand F&B, Google Business Profile (GBP) adalah fondasi GEO yang paling penting. Pastikan semua informasi lengkap dan akurat: jam operasional, menu, foto produk berkualitas tinggi, dan kategori bisnis yang tepat. Yang sering terlewat: foto harus diperbarui secara rutin (minimal sebulan sekali) karena Gemini memprioritaskan informasi yang fresh.',
      },
      {
        heading: 'Langkah 2: Bangun ulasan yang kuat',
        body: 'Rating Google, Tokopedia, dan GoFood/GrabFood adalah sinyal kuat yang dibaca AI. Target minimal: 4.5 bintang dengan lebih dari 100 ulasan. Cara paling efektif: buat sistem sederhana untuk meminta ulasan dari pelanggan yang sudah beli, misalnya QR code di packaging atau follow-up WhatsApp setelah pembelian.',
      },
      {
        heading: 'Langkah 3: Produksi konten yang menjawab pertanyaan konsumen',
        body: 'Blog adalah aset jangka panjang yang sering diabaikan brand F&B. Artikel seperti "Cara membedakan kopi arabika dan robusta berkualitas" atau "Apa yang membuat boba premium berbeda dari yang biasa" membangun otoritas brand di mata AI. Konten ini bukan hanya berguna untuk GEO, tapi juga untuk SEO dan edukasi konsumen.',
      },
      {
        heading: 'Langkah 4: Aktif di media dan komunitas online',
        body: 'AI belajar dari apa yang ditulis tentang brand Anda di internet. Press release di media makanan, review dari food blogger, diskusi di forum seperti Kaskus atau Reddit Indonesia — semua ini membantu AI memahami reputasi dan positioning brand Anda. Pertimbangkan untuk aktif berkolaborasi dengan content creator makanan untuk membangun jejak digital yang lebih kuat.',
      },
    ],
  },
  {
    slug: 'geo-brand-fashion-lokal-indonesia',
    category: 'Strategi',
    date: '26 Juni 2026',
    title: 'Kenapa Brand Fashion Lokal Indonesia Harus Serius di GEO Sekarang',
    excerpt:
      'Industri fashion lokal Indonesia sedang booming — tapi di mesin AI, hanya segelintir brand yang dikenal. Ini peluang besar yang belum banyak dimanfaatkan.',
    sections: [
      {
        body: 'Indonesia adalah salah satu pasar fashion dengan pertumbuhan tercepat di Asia Tenggara. Brand lokal seperti Erigo, Tangan, dan berbagai label indie berkembang pesat. Namun ketika konsumen bertanya ke AI tentang "brand fashion lokal Indonesia yang recommended", gambarannya masih sangat terbatas — kebanyakan AI hanya menyebut dua atau tiga nama yang sama.',
      },
      {
        heading: 'Kenapa fashion adalah kategori GEO yang sangat strategis?',
        body: 'Pertanyaan tentang fashion adalah salah satu yang paling sering ditanyakan ke mesin AI. Dari "outfit formal pria Indonesia yang bagus" hingga "brand batik modern untuk anak muda" — volume pertanyaannya sangat tinggi. Dan karena kompetisi GEO di fashion lokal masih rendah, brand yang bergerak lebih awal bisa mendominasi kategori ini.',
      },
      {
        heading: 'Apa yang perlu dioptimalkan?',
        body: 'Untuk brand fashion, tiga area paling krusial adalah: pertama, deskripsi produk yang kaya konteks (bukan hanya spesifikasi, tapi juga cerita di balik produk, bahan yang digunakan, dan cocok untuk ocasion apa). Kedua, konten yang menempatkan brand dalam konteks budaya Indonesia — ini yang membuat AI menyebut brand Anda saat ditanya tentang fashion lokal. Ketiga, ulasan dari pelanggan yang menyebut spesifik detail produk, bukan sekadar "bagus" atau "recommended".',
      },
      {
        heading: 'Belajar dari brand fashion global',
        body: 'Brand fashion global seperti Uniqlo dan Zara sangat sering disebut di rekomendasi AI karena mereka memiliki konten yang sangat terstruktur: panduan ukuran, panduan styling, deskripsi material yang detail. Brand fashion lokal bisa meniru pendekatan ini dengan skala yang lebih kecil tapi dengan keunikan lokal yang tidak dimiliki brand global.',
      },
    ],
  },
  {
    slug: 'panduan-konten-disukai-mesin-ai',
    category: 'Panduan',
    date: '25 Juni 2026',
    title: 'Panduan Menulis Konten yang Disukai Mesin AI dan Berpeluang Disebut',
    excerpt:
      'Ada pola tertentu dalam konten yang sering dikutip atau disebut oleh ChatGPT, Gemini, dan Perplexity. Pelajari cara menulisnya mulai hari ini.',
    sections: [
      {
        body: 'Tidak semua konten diciptakan sama di mata mesin AI. Ada karakteristik tertentu yang membuat sebuah konten lebih sering dikutip, diparafrase, atau dijadikan dasar rekomendasi oleh AI. Memahami pola ini adalah kunci untuk membangun strategi konten GEO yang efektif.',
      },
      {
        heading: 'Karakteristik 1: Menjawab pertanyaan secara langsung',
        body: 'Mesin AI dirancang untuk menjawab pertanyaan. Konten yang paling sering dikutip adalah konten yang struktur tulisannya juga berbentuk tanya-jawab, atau minimal dimulai dengan pertanyaan yang kemudian dijawab secara tuntas. Hindari tulisan yang berputar-putar dan terlalu banyak pendahuluan sebelum sampai ke inti jawaban.',
      },
      {
        heading: 'Karakteristik 2: Menggunakan data dan angka spesifik',
        body: 'AI lebih mempercayai konten yang menyebut angka spesifik dibanding klaim generik. "Produk kami meningkatkan penjualan" lebih lemah dibanding "brand yang menggunakan strategi ini mengalami peningkatan mention rate rata-rata 47% dalam 3 bulan." Sertakan data, hasil riset, atau statistik yang bisa diverifikasi.',
      },
      {
        heading: 'Karakteristik 3: Struktur yang jelas dengan heading yang deskriptif',
        body: 'Mesin AI membaca struktur dokumen. Konten dengan heading yang jelas dan deskriptif (bukan sekadar "Bagian 1", "Bagian 2") jauh lebih mudah diproses AI. Gunakan heading yang merupakan pertanyaan atau pernyataan yang berdiri sendiri — sehingga bahkan tanpa membaca isinya, heading-nya sudah informatif.',
      },
      {
        heading: 'Karakteristik 4: Membangun otoritas dengan depth, bukan length',
        body: 'Konten panjang belum tentu lebih baik. Yang lebih penting adalah kedalaman: satu artikel yang membahas satu topik secara sangat komprehensif lebih bernilai dibanding sepuluh artikel pendek yang hanya menyentuh permukaan. Fokus pada satu topik, bahas dari berbagai sudut, dan berikan perspektif yang tidak mudah ditemukan di tempat lain.',
      },
      {
        heading: 'Karakteristik 5: Konsistensi brand voice dan terminologi',
        body: 'AI membangun pemahaman tentang brand dari berbagai sumber. Semakin konsisten Anda menggunakan terminologi dan positioning yang sama di semua konten — website, blog, ulasan, media sosial — semakin jelas "identitas" brand Anda di mata AI. Inkonsistensi dalam messaging bisa membingungkan AI dan melemahkan visibilitas.',
      },
    ],
  },
  {
    slug: '5-kesalahan-geo-brand-indonesia',
    category: 'Panduan',
    date: '25 Juni 2026',
    title: '5 Kesalahan GEO yang Paling Sering Dilakukan Brand Indonesia',
    excerpt:
      'Banyak brand Indonesia sudah mulai sadar pentingnya GEO, tapi melakukan kesalahan yang justru menghambat visibilitas mereka di mesin AI. Apakah Anda melakukan salah satunya?',
    sections: [
      {
        body: 'Sejak kami mulai bekerja dengan puluhan brand Indonesia, ada pola kesalahan yang kami lihat berulang kali. Kesalahan ini tidak fatal, tapi memperlambat pertumbuhan visibilitas AI secara signifikan. Kenali kesalahan-kesalahan ini sebelum Anda jatuh ke jebakan yang sama.',
      },
      {
        heading: 'Kesalahan 1: Hanya fokus pada satu mesin AI',
        body: 'Banyak brand yang mengoptimalkan hanya untuk ChatGPT karena paling populer. Padahal, Gemini, Perplexity, dan Claude masing-masing memiliki basis pengguna yang signifikan dan cara yang berbeda dalam memilih informasi. Strategi GEO yang efektif harus mencakup semua mesin utama, karena setiap konsumen memiliki preferensi AI yang berbeda.',
      },
      {
        heading: 'Kesalahan 2: Mengabaikan ulasan negatif',
        body: 'AI tidak hanya membaca ulasan positif — ia memproses semua data yang tersedia, termasuk ulasan negatif yang tidak direspons. Brand yang membiarkan ulasan negatif tanpa respons memberikan sinyal buruk ke mesin AI. Setiap ulasan negatif harus direspons secara profesional dan konstruktif — ini justru bisa menjadi sinyal positif tentang kualitas customer service brand Anda.',
      },
      {
        heading: 'Kesalahan 3: Konten yang terlalu promosi',
        body: 'Mesin AI sangat baik mendeteksi konten yang terlalu promosi atau tidak objektif. Konten yang isinya 90% pujian tentang produk sendiri hampir tidak pernah dikutip oleh AI. Konten yang lebih sering dikutip adalah yang memberikan nilai edukatif, membandingkan pilihan secara jujur, atau membantu konsumen membuat keputusan yang lebih baik.',
      },
      {
        heading: 'Kesalahan 4: Tidak konsisten dalam produksi konten',
        body: 'GEO bukan sprint, ini maraton. Banyak brand yang semangat di awal — memproduksi banyak konten dalam satu bulan — lalu berhenti karena tidak melihat hasil instan. Padahal AI memprioritaskan brand yang konsisten aktif dari waktu ke waktu. Lebih baik satu artikel berkualitas per minggu secara konsisten dibanding sepuluh artikel sekaligus lalu diam selama dua bulan.',
      },
      {
        heading: 'Kesalahan 5: Tidak mengukur hasilnya',
        body: 'Kesalahan paling mahal adalah melakukan aktivitas GEO tanpa mengukur apakah visibilitas AI benar-benar naik. Tanpa data, Anda tidak tahu mana yang bekerja dan mana yang tidak. Ini alasan utama mengapa Fratello ada — memberikan data kuantitatif tentang visibilitas AI sehingga brand bisa mengambil keputusan berdasarkan fakta, bukan asumsi.',
      },
    ],
  },
  {
    slug: 'geo-umkm-indonesia-panduan-2026',
    category: 'Panduan',
    date: '24 Juni 2026',
    title: 'Cara UMKM Indonesia Bisa Bersaing di Era GEO Tanpa Budget Besar',
    excerpt:
      'GEO bukan hanya untuk brand besar. UMKM dengan strategi yang tepat justru bisa membangun keunggulan AI yang sulit dikejar brand enterprise. Inilah caranya.',
    sections: [
      {
        body: 'Ada miskonsepsi yang perlu diluruskan: GEO bukan domain eksklusif brand besar dengan tim marketing yang besar dan budget yang tidak terbatas. Justru sebaliknya — UMKM memiliki keunggulan unik dalam ekosistem GEO yang tidak dimiliki brand enterprise.',
      },
      {
        heading: 'Keunggulan UMKM dalam GEO',
        body: 'UMKM biasanya memiliki niche yang lebih spesifik, komunitas yang lebih loyal, dan cerita brand yang lebih autentik. Semua ini adalah sinyal positif bagi mesin AI. Sementara brand besar berjuang untuk mendominasi kategori yang luas, UMKM bisa mendominasi sub-kategori yang spesifik — dan seringkali, itulah yang ditanyakan konsumen ke AI.',
      },
      {
        heading: 'Langkah prioritas untuk UMKM dengan resource terbatas',
        body: 'Jika Anda hanya punya waktu dua jam per minggu untuk GEO, alokasikan seperti ini: 45 menit untuk memperbarui dan merespons ulasan di semua platform, 45 menit untuk menulis satu artikel blog yang menjawab pertanyaan umum pelanggan, dan 30 menit untuk memastikan profil Google Business Profile akurat dan foto terbaru sudah diupload.',
      },
      {
        heading: 'Niche adalah kekuatan, bukan kelemahan',
        body: 'Semakin spesifik niche Anda, semakin mudah AI mengenali dan merekomendasikan brand Anda dalam konteks yang tepat. "Produsen keripik tempe premium Malang dengan varian rasa inovatif" jauh lebih mudah diingat dan direkomendasikan AI dibanding "brand snack Indonesia". Kunci: definisikan niche Anda sejelas mungkin di semua platform.',
      },
      {
        heading: 'Tool gratis yang bisa dimanfaatkan UMKM',
        body: 'Sebelum berinvestasi di platform berbayar, maksimalkan tool gratis: Google Business Profile (gratis dan sangat berpengaruh untuk Gemini), Google Search Console untuk memantau visibilitas di pencarian, dan fitur tanya-jawab di platform marketplace seperti Tokopedia dan Shopee yang sering dibaca AI sebagai referensi reputasi brand.',
      },
    ],
  },
  {
    slug: 'mengapa-gen-z-percaya-rekomendasi-ai',
    category: 'Riset',
    date: '24 Juni 2026',
    title: 'Riset: 73% Konsumen Gen Z Indonesia Percaya Rekomendasi AI Lebih dari Iklan',
    excerpt:
      'Survei terbaru terhadap 3.000 konsumen muda Indonesia mengungkap pergeseran kepercayaan yang dramatis dari iklan ke rekomendasi AI. Ini implikasinya untuk brand.',
    sections: [
      {
        body: 'Survei yang dilakukan oleh lembaga riset independen pada Mei-Juni 2026 terhadap 3.000 konsumen berusia 18-28 tahun di Indonesia menghasilkan temuan yang mengejutkan banyak praktisi marketing: 73% responden menyatakan lebih mempercayai rekomendasi dari mesin AI dibanding iklan berbayar saat mengambil keputusan pembelian.',
      },
      {
        heading: 'Mengapa Gen Z percaya AI?',
        body: 'Alasan utama yang dikemukakan responden: AI dianggap tidak punya kepentingan finansial untuk mempromosikan produk tertentu (64% responden), AI memberikan perbandingan yang lebih objektif dibanding iklan (58%), dan AI bisa ditanya tentang kelemahan produk — sesuatu yang tidak akan pernah dilakukan iklan (71%). Persepsi ini mungkin tidak selalu akurat, tapi itulah yang dipercaya konsumen.',
      },
      {
        heading: 'Pola pembelian yang berubah',
        body: 'Yang lebih mengejutkan: 41% responden menyatakan pernah membeli produk yang direkomendasikan AI tanpa melakukan riset tambahan. Ini menunjukkan tingkat konversi dari rekomendasi AI yang sangat tinggi dibanding channel marketing lainnya. Bandingkan dengan tingkat kepercayaan terhadap influencer marketing yang terus menurun di kelompok usia yang sama.',
      },
      {
        heading: 'Implikasi untuk strategi brand',
        body: 'Temuan ini mengubah cara kita melihat funnel pembelian. Jika Gen Z langsung bertanya ke AI dan langsung membeli berdasarkan rekomendasinya, maka "memenangkan AI" menjadi sama pentingnya dengan memenangkan awareness dan consideration di channel tradisional. Brand yang direkomendasikan AI untuk kategori tertentu secara efektif melewati banyak tahapan funnel yang biasanya memerlukan biaya besar.',
      },
      {
        heading: 'Tren yang akan menguat',
        body: 'Generasi yang tumbuh dengan AI sebagai asisten personal akan semakin mengandalkan AI untuk keputusan konsumsi. Anak yang hari ini berusia 15 tahun dan terbiasa bertanya ke AI untuk segala hal — akan menjadi konsumen dengan purchasing power besar dalam 5-10 tahun. Brand yang mulai membangun visibilitas AI hari ini sedang berinvestasi untuk pasar masa depan.',
      },
    ],
  },
  {
    slug: 'geo-score-cara-mengukur-visibilitas-ai',
    category: 'Produk',
    date: '23 Juni 2026',
    title: 'GEO Score: Cara Mengukur Visibilitas Brand Anda di Mesin AI Secara Akurat',
    excerpt:
      'Visibilitas AI tidak bisa diukur dengan metrik SEO biasa. Fratello memperkenalkan GEO Score — framework pengukuran komprehensif untuk era AI search.',
    sections: [
      {
        body: 'Salah satu tantangan terbesar dalam GEO adalah pengukuran. Tidak seperti SEO yang memiliki metrik yang sudah mapan — peringkat keyword, domain authority, organic traffic — GEO memerlukan cara baru untuk mengukur keberhasilan. Fratello mengembangkan framework GEO Score untuk menjawab kebutuhan ini.',
      },
      {
        heading: 'Apa itu GEO Score?',
        body: 'GEO Score adalah angka 0-100 yang merepresentasikan kekuatan visibilitas AI sebuah brand. Skor ini dihitung dari empat komponen utama: Mention Rate (seberapa sering brand disebutkan dari total prompt yang dikirim), Sentiment Score (seberapa positif konteks penyebutan brand), Position Score (apakah brand disebutkan pertama, kedua, atau terakhir dalam jawaban AI), dan Coverage Score (di berapa mesin AI brand disebutkan secara konsisten).',
      },
      {
        heading: 'Bagaimana GEO Score dihitung?',
        body: 'Setiap minggu, Fratello mengirim bank prompt yang relevan ke empat mesin AI. Respons setiap mesin dianalisis untuk menentukan apakah brand disebutkan, dalam konteks apa, dan di posisi mana. Data ini diagregasi dan dinormalisasi menjadi skor 0-100. Brand dengan skor di atas 70 dianggap memiliki visibilitas AI yang kuat; di bawah 30 menunjukkan ada gap serius yang perlu segera diatasi.',
      },
      {
        heading: 'Menggunakan GEO Score untuk keputusan strategis',
        body: 'GEO Score paling berguna ketika dilacak dari waktu ke waktu. Penurunan skor yang tiba-tiba bisa mengindikasikan perubahan pada algoritma AI atau munculnya kompetitor baru yang mulai mengambil share of voice AI. Kenaikan skor bisa mengkonfirmasi bahwa strategi konten atau kampanye ulasan yang sedang dijalankan bekerja dengan baik.',
      },
      {
        heading: 'Benchmark industri',
        body: 'Berdasarkan data dari ratusan brand yang menggunakan Fratello, rata-rata GEO Score brand yang baru mulai berkisar di 15-25. Brand yang sudah aktif berinvestasi dalam konten dan reputasi digital selama 6-12 bulan biasanya mencapai skor 45-65. Brand-brand dengan visibilitas AI terkuat di kategorinya umumnya memiliki skor di atas 75.',
      },
    ],
  },
  {
    slug: 'claude-vs-chatgpt-untuk-brand-indonesia',
    category: 'Riset',
    date: '23 Juni 2026',
    title: 'Claude vs ChatGPT: Mana yang Lebih Sering Merekomendasikan Brand Lokal Indonesia?',
    excerpt:
      'Setiap mesin AI memiliki karakteristik berbeda dalam memilih brand yang disebut. Inilah temuan dari analisis 10.000 prompt terhadap Claude dan ChatGPT untuk brand Indonesia.',
    sections: [
      {
        body: 'Claude (Anthropic) dan ChatGPT (OpenAI) adalah dua mesin AI dengan basis pengguna terbesar di Indonesia. Tapi apakah keduanya merekomendasikan brand dengan cara yang sama? Tim riset Fratello menganalisis 10.000 prompt yang relevan untuk brand Indonesia dan menemukan perbedaan yang menarik.',
      },
      {
        heading: 'Perbedaan dalam memilih sumber informasi',
        body: 'ChatGPT cenderung lebih bergantung pada data training dan pengetahuan yang sudah ada, sementara Claude dengan fitur web search-nya lebih aktif mencari informasi terkini. Ini berarti untuk brand yang baru saja mendapat banyak coverage media atau ulasan positif dalam beberapa bulan terakhir, Claude lebih mungkin menangkap perkembangan terbaru tersebut.',
      },
      {
        heading: 'Perbedaan dalam gaya rekomendasi',
        body: 'ChatGPT cenderung memberikan daftar lebih panjang dengan penjelasan singkat per brand. Claude cenderung memberikan daftar lebih pendek tapi dengan penjelasan yang lebih mendalam dan nuanced. Implikasinya: brand yang ingin disebut ChatGPT perlu hadir di banyak tempat secara konsisten, sementara untuk Claude, kedalaman informasi tentang brand di satu sumber yang kuat bisa lebih efektif.',
      },
      {
        heading: 'Temuan mengejutkan: Brand lokal lebih sering disebut Claude',
        body: 'Dari analisis kami, Claude secara konsisten menyebut lebih banyak brand lokal Indonesia dibanding ChatGPT untuk kueri yang sama. Hipotesis kami: Claude memiliki threshold yang lebih rendah untuk menyebut brand yang kurang terkenal secara global tapi kuat secara lokal, sementara ChatGPT lebih bias ke brand yang sudah dikenal secara internasional.',
      },
      {
        heading: 'Implikasi praktis',
        body: 'Strategi GEO yang optimal harus memperhitungkan karakteristik masing-masing mesin. Tidak ada pendekatan one-size-fits-all. Brand yang ingin hasil maksimal harus memantau visibilitasnya di semua mesin secara terpisah dan menyesuaikan strategi konten berdasarkan data dari masing-masing platform.',
      },
    ],
  },
  {
    slug: 'ulasan-google-maps-pengaruhi-rekomendasi-ai',
    category: 'Panduan',
    date: '22 Juni 2026',
    title: 'Bagaimana Ulasan Google Maps Secara Langsung Mempengaruhi Rekomendasi AI',
    excerpt:
      'Ulasan Google Maps bukan hanya untuk menarik pelanggan baru — data ulasan digunakan langsung oleh Gemini dan AI lain untuk menentukan brand mana yang layak direkomendasikan.',
    sections: [
      {
        body: 'Banyak pelaku usaha yang menganggap ulasan Google Maps hanya penting untuk konversi langsung — seseorang melihat rating tinggi, lalu memilih untuk datang atau membeli. Tapi peran ulasan jauh lebih besar dari itu: data ulasan adalah salah satu input terpenting yang digunakan mesin AI untuk menentukan reputasi dan relevansi sebuah brand.',
      },
      {
        heading: 'Bagaimana AI membaca ulasan?',
        body: 'Mesin AI tidak hanya melihat rating bintang. Mereka memproses teks ulasan untuk memahami aspek spesifik yang sering dipuji atau dikritik. Ulasan yang menyebut "pelayanan cepat", "produk konsisten", atau "value for money" memberikan sinyal positif yang kuat. Ulasan negatif yang tidak direspons memberikan sinyal bahwa brand kurang peduli terhadap feedback pelanggan.',
      },
      {
        heading: 'Volume vs kualitas ulasan',
        body: 'Untuk memenangkan rekomendasi AI, Anda membutuhkan keduanya. 1.000 ulasan dengan rating 3.5 bintang lebih lemah dibanding 200 ulasan dengan rating 4.8 bintang yang masing-masing berisi teks deskriptif. AI memprioritaskan kualitas narasi, bukan hanya kuantitas. Ulasan yang panjang dan spesifik jauh lebih bernilai dibanding "bagus banget!" tanpa penjelasan.',
      },
      {
        heading: 'Strategi membangun ulasan yang optimal',
        body: 'Cara paling efektif: kirim pesan follow-up ke pelanggan setelah transaksi dengan template yang memudahkan mereka menulis ulasan yang detail. Contoh: "Halo [nama], terima kasih sudah membeli [produk]. Boleh bantu kami dengan ulasan singkat? Jika berkenan, ceritakan apa yang paling Anda sukai tentang [aspek spesifik produk]." Template ini mendorong ulasan yang lebih spesifik dan berguna untuk GEO.',
      },
      {
        heading: 'Respons ulasan adalah sinyal GEO yang sering diabaikan',
        body: 'Brand yang secara konsisten merespons ulasan — baik positif maupun negatif — menunjukkan tanda-tanda "bisnis yang aktif dan peduli" yang disukai mesin AI. Respons yang baik terhadap ulasan negatif bahkan bisa membalikkan persepsi: AI memahami bahwa bisnis yang serius menangani keluhan adalah bisnis yang bisa dipercaya.',
      },
    ],
  },
  {
    slug: 'tren-geo-asia-tenggara-indonesia-memimpin',
    category: 'Riset',
    date: '22 Juni 2026',
    title: 'Tren GEO di Asia Tenggara: Indonesia Paling Cepat Adopsi AI Search',
    excerpt:
      'Laporan terbaru menunjukkan Indonesia adalah pasar dengan adopsi AI search tertinggi di Asia Tenggara, tapi juga dengan kesenjangan GEO terbesar. Inilah peluangnya.',
    sections: [
      {
        body: 'Laporan terbaru yang menganalisis perilaku digital di enam negara Asia Tenggara menempatkan Indonesia di posisi pertama untuk adopsi AI search — melampaui Thailand, Vietnam, Malaysia, Filipina, dan Singapura. Namun di sisi lain, laporan yang sama menunjukkan bahwa brand Indonesia paling tertinggal dalam mengoptimalkan kehadiran mereka di mesin AI.',
      },
      {
        heading: 'Angka adopsi AI search di Indonesia',
        body: 'Per Juni 2026, diperkirakan lebih dari 45 juta pengguna internet Indonesia aktif menggunakan setidaknya satu mesin AI search setiap minggunya. Ini naik dari 12 juta pada awal 2025. Faktor pendorong utama: penetrasi smartphone yang tinggi, generasi muda yang tech-savvy, dan meningkatnya kepercayaan terhadap AI setelah banyak kasus penggunaan sehari-hari terbukti berguna.',
      },
      {
        heading: 'Kesenjangan GEO: peluang yang mendesak',
        body: 'Paradoksnya: meskipun konsumen Indonesia paling aktif bertanya ke AI, brand Indonesia paling minim mengoptimalkan kehadiran mereka di AI. Ini menciptakan kesenjangan supply-demand yang besar: ada jutaan pertanyaan tentang produk lokal Indonesia yang ditanyakan ke AI setiap hari, tapi AI tidak memiliki cukup informasi berkualitas untuk menjawabnya dengan merekomendasikan brand lokal yang tepat.',
      },
      {
        heading: 'Perbandingan dengan Singapura dan Malaysia',
        body: 'Brand di Singapura dan Malaysia sudah mulai mengadopsi strategi GEO lebih awal, didorong oleh ekosistem startup yang lebih mature dan kesadaran marketing yang lebih tinggi. Brand Singapura rata-rata memiliki GEO Score 2.3x lebih tinggi dibanding brand Indonesia di kategori yang sama. Ini adalah gap yang harus dan bisa ditutup — tapi window peluangnya terbatas.',
      },
      {
        heading: 'Proyeksi ke depan',
        body: 'Berdasarkan trajektori pertumbuhan saat ini, Indonesia diperkirakan akan menjadi salah satu dari lima pasar GEO terbesar di dunia pada 2028. Brand yang mulai berinvestasi dalam GEO hari ini sedang membangun fondasi untuk dominasi pasar yang akan sangat sulit digeser kompetitor — mirip dengan brand yang menguasai halaman pertama Google di era SEO awal 2000-an.',
      },
    ],
  },
  {
    slug: 'studi-kasus-brand-kuliner-naik-3x-mention-ai',
    category: 'Studi Kasus',
    date: '21 Juni 2026',
    title: 'Studi Kasus: Brand Kuliner Ini Naik 3x Penyebutan AI Hanya dalam 60 Hari',
    excerpt:
      'Bagaimana sebuah brand kopi lokal meningkatkan GEO Score dari 18 menjadi 67 dalam dua bulan dengan strategi yang bisa direplikasi brand mana pun.',
    sections: [
      {
        body: 'Studi kasus ini adalah salah satu yang paling sering ditanyakan oleh pengguna baru Fratello: "Berapa lama sampai terlihat hasilnya?" Jawaban terpendek: dengan strategi yang tepat dan eksekusi yang konsisten, 60 hari sudah cukup untuk melihat perubahan yang signifikan. Ini adalah kisah salah satu brand kopi lokal yang membuktikannya.',
      },
      {
        heading: 'Kondisi awal: GEO Score 18',
        body: 'Brand kopi ini memiliki produk yang diakui berkualitas oleh pelanggan setia mereka, tapi hampir tidak terlihat di mesin AI. Ketika tim mereka mengetik "rekomendasi kopi specialty lokal" di ChatGPT, nama mereka tidak muncul sama sekali. GEO Score awal mereka adalah 18 — termasuk dalam kategori "hampir tidak terlihat".',
      },
      {
        heading: 'Strategi yang dieksekusi',
        body: 'Selama 60 hari, mereka fokus pada tiga area: (1) Memproduksi 8 artikel blog edukatif tentang kopi — mulai dari panduan brewing, perbedaan jenis biji kopi, hingga guide memilih kopi untuk pemula. (2) Menjalankan kampanye ulasan aktif — mengirim pesan ke 500 pelanggan lama dan berhasil mendapatkan 200 ulasan baru dengan rata-rata rating 4.7 bintang. (3) Mengirim press release ke 10 media F&B online Indonesia tentang produk terbaru mereka.',
      },
      {
        heading: 'Hasil setelah 60 hari',
        body: 'GEO Score naik dari 18 menjadi 67. Mention rate di ChatGPT naik dari 4% menjadi 31% untuk prompt kategori kopi lokal. Di Perplexity, yang lebih responsif terhadap konten terbaru, kenaikannya bahkan lebih dramatis: dari 2% menjadi 47%. Yang paling terasa secara bisnis: mereka mulai menerima pesanan dari pelanggan yang eksplisit menyebutkan "saya menemukan kalian dari ChatGPT".',
      },
      {
        heading: 'Pelajaran yang bisa diambil',
        body: 'Tidak ada magic formula — hasilnya datang dari konsistensi dalam tiga area yang saling menguatkan: konten, reputasi, dan media coverage. Yang menarik: biaya total untuk strategi ini relatif rendah. Sebagian besar effort adalah waktu dan kreativitas, bukan budget iklan besar. Ini membuktikan bahwa GEO adalah salah satu channel dengan ROI tertinggi jika dieksekusi dengan benar.',
      },
    ],
  },
  {
    slug: 'roadmap-geo-brand-indonesia-2026',
    category: 'Strategi',
    date: '27 Juni 2026',
    title: 'Roadmap GEO 2026: Yang Harus Brand Indonesia Siapkan Mulai Hari Ini',
    excerpt:
      'Landscape AI search berubah cepat. Inilah roadmap 6 bulan yang bisa langsung dieksekusi brand Indonesia untuk membangun dominasi di mesin AI sebelum kompetitor.',
    sections: [
      {
        body: 'Pertengahan 2026 adalah titik infleksi untuk GEO di Indonesia. Konsumen sudah banyak yang menggunakan AI search, tapi brand yang mengoptimalkan kehadiran AI mereka masih sangat sedikit. Ini window of opportunity yang terbuka — dan enam bulan ke depan adalah waktu terbaik untuk bergerak.',
      },
      {
        heading: 'Bulan 1-2: Audit dan fondasi',
        body: 'Langkah pertama adalah memahami posisi Anda saat ini. Jalankan audit GEO untuk mengetahui: di mana brand Anda disebut (dan tidak disebut), dengan sentimen apa, dan untuk prompt seperti apa. Bersamaan dengan itu, pastikan fondasi digital Anda solid: Google Business Profile lengkap dan akurat, profil di semua marketplace relevan diperbarui, dan website memiliki halaman yang menjawab pertanyaan umum konsumen.',
      },
      {
        heading: 'Bulan 3-4: Membangun konten dan reputasi',
        body: 'Dengan fondasi yang solid, mulai produksi konten secara konsisten. Target minimal: dua artikel blog per minggu, dengan topik yang dipilih berdasarkan pertanyaan yang sering ditanyakan ke AI di kategori Anda. Paralel dengan ini, jalankan kampanye ulasan aktif — targetkan 50 ulasan baru per bulan dengan kualitas tinggi (teks deskriptif, bukan hanya bintang).',
      },
      {
        heading: 'Bulan 5-6: Amplifikasi dan monitoring',
        body: 'Setelah konten dan reputasi mulai terbangun, saatnya memperkuat sinyal eksternal. Kirim pitching ke media online di kategori Anda, kolaborasi dengan komunitas yang relevan, dan pertimbangkan kerjasama dengan content creator yang audiensnya sesuai dengan target pasar Anda. Monitor GEO Score setiap minggu untuk memvalidasi mana yang bekerja.',
      },
      {
        heading: 'Metrik keberhasilan yang harus dipantau',
        body: 'Untuk setiap bulan, pantau: GEO Score keseluruhan, mention rate per mesin AI, sentiment score, dan jumlah mesin AI yang menyebut brand Anda. Selain itu, pantau juga branded search di Google — peningkatan GEO biasanya diikuti peningkatan pencarian nama brand secara langsung, karena konsumen yang melihat nama brand di AI kemudian mencarinya lebih jauh di Google.',
      },
      {
        heading: 'Mengapa sekarang adalah waktu terbaik',
        body: 'Enam bulan pertama brand yang bergerak di GEO biasanya mengalami kenaikan paling cepat — karena kompetisi masih rendah dan setiap konten baru yang diproduksi langsung memberikan dampak yang terasa. Semakin banyak brand yang masuk ke GEO, semakin keras persaingan untuk mendapat share of voice AI. Mulai sekarang berarti membangun moat yang akan semakin sulit diikuti kompetitor nanti.',
      },
    ],
  },
  {
    slug: 'perplexity-pages-fitur-baru-brand',
    category: 'Berita',
    date: '27 Juni 2026',
    title: 'Perplexity Pages: Fitur Terbaru yang Mengubah Cara Brand Muncul di AI Search',
    excerpt:
      'Perplexity meluncurkan Pages — format konten baru yang memungkinkan brand dan kreator mempublikasikan konten yang secara langsung diindeks dan dikutip oleh Perplexity AI.',
    sections: [
      {
        body: 'Perplexity baru saja merilis pembaruan fitur yang bisa mengubah cara brand mendekati GEO: Perplexity Pages. Fitur ini memungkinkan siapa saja — termasuk brand — untuk mempublikasikan konten terstruktur yang secara eksplisit diindeks dan diprioritaskan oleh mesin Perplexity saat menjawab pertanyaan yang relevan.',
      },
      {
        heading: 'Apa itu Perplexity Pages?',
        body: 'Perplexity Pages adalah format konten khusus di ekosistem Perplexity yang mirip dengan artikel Wikipedia tapi bisa dibuat oleh siapa saja. Konten yang dipublikasikan di Perplexity Pages mendapat perlakuan khusus dari algoritma Perplexity — lebih mungkin dikutip sebagai sumber saat pengguna menanyakan topik yang relevan.',
      },
      {
        heading: 'Mengapa ini penting untuk brand?',
        body: 'Selama ini, brand tidak punya cara langsung untuk "menaruh" konten mereka di dalam ekosistem mesin AI. GEO selama ini bersifat tidak langsung: brand membuat konten di website, berharap AI mengindeks dan mengutipnya. Perplexity Pages membuka jalur yang lebih langsung: brand bisa mempublikasikan konten di dalam platform Perplexity sendiri, dengan jaminan konten tersebut diperhatikan oleh algoritma.',
      },
      {
        heading: 'Cara memanfaatkan Perplexity Pages untuk GEO',
        body: 'Strategi yang paling efektif: buat Pages yang bersifat edukatif tentang kategori produk Anda — bukan halaman promosi. Misalnya, brand sepatu bisa membuat Pages tentang "Panduan memilih sepatu lari berdasarkan jenis kaki" — konten yang berguna untuk konsumen tapi secara alami memposisikan brand sebagai otoritas di kategori tersebut. Brand yang pertama mengisi Pages di kategori niche mereka akan mendapat keuntungan first-mover yang signifikan.',
      },
      {
        heading: 'Integrasi dengan strategi GEO keseluruhan',
        body: 'Perplexity Pages bukan pengganti strategi GEO yang sudah ada — ini adalah lapisan tambahan. Tetap penting untuk membangun konten di website sendiri, mengelola ulasan, dan membangun reputasi di media. Tapi bagi brand yang sudah memiliki fondasi GEO yang solid, Perplexity Pages adalah cara untuk mempercepat visibilitas di salah satu mesin AI dengan pertumbuhan pengguna tercepat saat ini.',
      },
    ],
  },
]

export function getPostBySlug(slug: string): Post | undefined {
  return posts.find((p) => p.slug === slug)
}
