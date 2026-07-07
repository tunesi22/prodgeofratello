import type { Post } from '../types'

export const post: Post = {
  slug: 'ai-crawler-gptbot-claudebot-perplexitybot-panduan',
  category: 'Panduan',
  date: '2026-07-04',
  title: 'Kenalan dengan AI Crawler: GPTBot, ClaudeBot, PerplexityBot, dan Cara Mengelolanya',
  excerpt:
    'Sebelum brand Anda bisa disebut AI, situs Anda harus bisa dirayapi oleh AI crawler. Kenali bot-bot ini dan pastikan Anda tidak sengaja memblokirnya.',
  sections: [
    {
      body: 'Setiap mesin AI yang menjawab pertanyaan berbasis web memiliki crawler sendiri untuk mengumpulkan informasi terbaru dari internet. Sayangnya, banyak website secara tidak sengaja memblokir crawler ini melalui konfigurasi robots.txt atau firewall yang terlalu ketat — membuat brand tersebut praktis tidak terlihat oleh AI.',
    },
    {
      heading: 'Crawler AI utama yang perlu Anda kenali',
      body: 'GPTBot (OpenAI) merayapi konten untuk melatih dan memperkaya jawaban ChatGPT. ClaudeBot (Anthropic) melakukan hal serupa untuk Claude. PerplexityBot mengindeks konten secara real-time untuk menjawab kueri Perplexity. Googlebot sendiri kini juga menjadi sumber data untuk Gemini dan AI Overview. Masing-masing memiliki user-agent yang bisa diidentifikasi di access log server Anda.',
    },
    {
      heading: 'Cara memeriksa apakah crawler AI bisa mengakses situs Anda',
      body: 'Periksa file robots.txt Anda di domain-anda.com/robots.txt. Jika ada baris "Disallow: /" tanpa pengecualian untuk user-agent AI di atas, crawler tersebut tidak bisa membaca konten Anda sama sekali. Anda juga bisa memeriksa access log server untuk melihat apakah bot-bot ini benar-benar pernah mengunjungi situs Anda dalam 30 hari terakhir.',
    },
    {
      heading: 'Konfigurasi yang direkomendasikan',
      body: 'Untuk brand yang ingin memaksimalkan visibilitas AI, izinkan akses penuh untuk halaman publik (produk, blog, tentang kami) tapi tetap blokir halaman sensitif seperti dashboard internal, halaman checkout, atau data pelanggan. Ini sama persis dengan prinsip robots.txt untuk Googlebot, hanya diperluas untuk mencakup user-agent AI.',
    },
    {
      heading: 'Jangan sampai konten Anda diblokir tanpa disadari',
      body: 'Beberapa provider hosting dan CDN kini menyediakan opsi "blokir AI crawler" secara default sebagai fitur privasi — niatnya baik, tapi bisa jadi bumerang bagi brand yang justru ingin disebut AI. Fratello merekomendasikan brand untuk secara eksplisit meninjau ulang konfigurasi ini setidaknya sekali per kuartal, terutama setelah migrasi hosting atau perubahan CDN.',
    },
  ],
}
