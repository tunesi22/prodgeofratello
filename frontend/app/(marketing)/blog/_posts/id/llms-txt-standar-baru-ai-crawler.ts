import type { Post } from '../types'

export const post: Post = {
  slug: 'llms-txt-standar-baru-ai-crawler',
  category: 'Panduan',
  date: '2026-07-05',
  title: 'llms.txt: Standar Baru yang Membantu AI Memahami Website Anda',
  excerpt:
    'Seperti robots.txt untuk mesin pencari, llms.txt adalah file sederhana yang membantu mesin AI memahami konten website Anda lebih cepat dan lebih akurat. Inilah cara kerjanya.',
  sections: [
    {
      body: 'Selama bertahun-tahun, robots.txt menjadi cara standar website berkomunikasi dengan crawler mesin pencari. Kini, seiring mesin AI seperti ChatGPT, Claude, dan Perplexity semakin aktif menjelajahi web untuk menjawab pertanyaan pengguna, muncul standar baru yang serupa: llms.txt.',
    },
    {
      heading: 'Apa itu llms.txt?',
      body: 'llms.txt adalah file teks sederhana yang diletakkan di root domain (contoh: hifratello.com/llms.txt) berisi ringkasan terstruktur tentang website Anda — apa bisnisnya, halaman-halaman penting apa saja yang tersedia, dan konteks yang membantu AI memahami konten Anda tanpa harus merayapi seluruh situs secara mendalam.',
    },
    {
      heading: 'Kenapa ini penting untuk GEO?',
      body: 'Mesin AI memiliki keterbatasan dalam memproses seluruh isi sebuah website setiap kali menjawab pertanyaan. llms.txt memberikan "ringkasan eksekutif" yang memudahkan AI mengambil konteks yang tepat dengan cepat. Brand yang menyediakan llms.txt yang jelas berpotensi lebih mudah dan lebih akurat direpresentasikan saat disebut AI.',
    },
    {
      heading: 'Struktur dasar llms.txt yang efektif',
      body: 'Format yang direkomendasikan komunitas mencakup: judul dan deskripsi singkat brand, daftar halaman penting dengan tautan dan ringkasan satu kalimat per halaman, dan bagian opsional berisi FAQ singkat. Hindari mengisi file ini dengan bahasa pemasaran berlebihan — AI merespons lebih baik pada bahasa yang faktual dan langsung ke inti.',
    },
    {
      heading: 'Bagaimana Fratello membantu',
      body: 'Fitur audit teknis Fratello dapat men-generate draf llms.txt otomatis berdasarkan struktur website Anda, termasuk konfigurasi routing untuk crawler AI populer (GPTBot, ClaudeBot, PerplexityBot). Ini adalah salah satu langkah teknis termudah yang bisa langsung diterapkan brand untuk meningkatkan keterbacaan situsnya di mata mesin AI.',
    },
  ],
}
