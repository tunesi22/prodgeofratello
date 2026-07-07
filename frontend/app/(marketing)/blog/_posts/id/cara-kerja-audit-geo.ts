import type { Post } from '../types'

export const post: Post = {
  "slug": "cara-kerja-audit-geo",
  "category": "Produk",
  "date": '2026-06-07',
  "title": "Bagaimana Audit GEO Fratello Bekerja di Balik Layar",
  "excerpt": "Kami mengirim ratusan prompt ke empat mesin AI setiap minggu untuk mengukur seberapa sering dan seberapa positif brand Anda disebut — inilah cara kami melakukannya.",
  "sections": [
    {
      "body": "Salah satu pertanyaan paling sering kami terima dari pengguna baru: \"Bagaimana kalian tahu apa yang dikatakan AI tentang brand saya?\" Jawabannya adalah proses yang kami sebut Audit GEO — dan di artikel ini kami jelaskan secara transparan cara kerjanya."
    },
    {
      "heading": "Langkah 1: Menyusun bank prompt",
      "body": "Setiap brand memiliki kategori dan konteks yang berbeda. Sebelum mulai memantau, Fratello menyusun bank prompt yang relevan untuk brand tersebut. Misalnya untuk brand sepatu lokal, promptnya bisa berupa: \"sepatu lari lokal terbaik 2026\", \"rekomendasi sneakers nyaman untuk harian\", \"brand sepatu Indonesia yang kualitasnya bagus\". Bank prompt ini dibangun dari riset kata kunci, tren pencarian, dan input langsung dari brand."
    },
    {
      "heading": "Langkah 2: Mengirim prompt ke empat mesin AI",
      "body": "Fratello mengirimkan setiap prompt ke ChatGPT (OpenAI), Gemini (Google), Perplexity, dan Claude (Anthropic) — empat mesin yang paling banyak digunakan konsumen saat ini. Setiap mesin memiliki karakteristik berbeda dalam merespons: Perplexity lebih berbasis web real-time, sementara ChatGPT lebih bergantung pada data training. Karena itu, brand perlu terlihat di semua, bukan hanya satu."
    },
    {
      "heading": "Langkah 3: Menganalisis respons",
      "body": "Setelah respons diterima, sistem kami menganalisis tiga hal: apakah brand disebutkan (mention rate), bagaimana sentimen penyebutannya — positif, netral, atau negatif (sentiment score), dan di posisi mana brand disebutkan dalam jawaban (ranking position). Data ini dikumpulkan dari setiap prompt di setiap mesin, menghasilkan ribuan titik data per bulan."
    },
    {
      "heading": "Langkah 4: Melacak perubahan dari waktu ke waktu",
      "body": "Satu snapshot tidak cukup. Fratello menjalankan audit ini secara berkala — idealnya mingguan — sehingga brand bisa melihat tren: apakah visibilitas naik setelah merilis konten baru? Apakah ada mesin AI tertentu yang mulai menyebut brand setelah ulasan positif bermunculan? Tren inilah yang membantu brand memahami apa yang bekerja."
    },
    {
      "heading": "Langkah 5: Melaporkan dalam dasbor",
      "body": "Semua data dirangkum dalam dasbor Fratello yang bisa diakses kapan saja. Tidak ada laporan PDF bulanan yang sudah basi saat dibaca — data diperbarui secara otomatis dan bisa di-drill down per mesin, per prompt, atau per periode. Brand bisa langsung melihat di mana mereka kuat dan di mana ada celah yang perlu diisi."
    }
  ]
}
