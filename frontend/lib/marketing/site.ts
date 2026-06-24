/**
 * Marketing site configuration: the public hifratello.com surface.
 *
 * The site is Indonesian-first (formal "Anda" register, Indonesian slugs) per the
 * SEO strategy in docs/silo-map.md. Nav + footer + sitemap all derive from the
 * structures here so the information architecture stays in one place.
 */

export const SITE = {
  name: 'Fratello',
  // Canonical production origin (no trailing slash). Update when the domain ships.
  url: 'https://hifratello.com',
  locale: 'id_ID',
  // Book a Demo (primary CTA) points at the existing waitlist page for now.
  demoHref: '/fratello',
  loginHref: '/sign-in',
  tagline: 'Buat brand Anda terbaca AI dan direkomendasikan ke manusia.',
} as const

export interface NavLink {
  label: string
  href: string
  /** Optional one-line description shown in the mega-menu. */
  desc?: string
}

export interface NavColumn {
  title: string
  links: NavLink[]
}

export interface NavGroup {
  label: string
  href: string
  columns: NavColumn[]
}

/** Top-nav mega-menus. Mirrors the silo map (docs/silo-map.md). */
export const NAV: NavGroup[] = [
  {
    label: 'Fitur',
    href: '/fitur',
    columns: [
      {
        title: 'Kemampuan produk',
        links: [
          { label: 'Pelacakan AI 4 Model', href: '/fitur/pelacakan-ai', desc: 'Lacak penyebutan brand di ChatGPT, Gemini, Perplexity, dan Claude.' },
          { label: 'Riset Pertanyaan', href: '/fitur/riset-pertanyaan', desc: 'Temukan pertanyaan yang ditanyakan calon pelanggan ke AI.' },
          { label: 'Audit GEO', href: '/fitur/audit-geo', desc: 'Skor kesiapan GEO, llms.txt, dan konfigurasi bot.' },
          { label: 'Artikel AI', href: '/fitur/artikel-ai', desc: 'Buat artikel yang dioptimalkan untuk mesin AI.' },
          { label: 'Analitik', href: '/fitur/analitik', desc: 'Mention rate, share of voice, sentimen, dan tren.' },
          { label: 'Distribusi dan Dampak', href: '/fitur/distribusi', desc: 'Sebarkan konten dan ukur dampaknya pada visibilitas.' },
        ],
      },
    ],
  },
  {
    label: 'Solusi',
    href: '/solusi',
    columns: [
      {
        title: 'Berdasarkan industri',
        links: [
          { label: 'UMKM', href: '/solusi/umkm' },
          { label: 'Agensi', href: '/solusi/agensi' },
          { label: 'E-commerce', href: '/solusi/ecommerce' },
          { label: 'SaaS dan Startup', href: '/solusi/saas-startup' },
          { label: 'F&B dan Restoran', href: '/solusi/fnb-restoran' },
          { label: 'Kesehatan dan Klinik', href: '/solusi/kesehatan-klinik' },
          { label: 'Properti', href: '/solusi/properti' },
        ],
      },
      {
        title: 'Berdasarkan mesin AI',
        links: [
          { label: 'ChatGPT', href: '/muncul-di-ai/chatgpt' },
          { label: 'Google AI Overviews', href: '/muncul-di-ai/google-ai-overviews' },
          { label: 'Gemini', href: '/muncul-di-ai/gemini' },
          { label: 'Perplexity', href: '/muncul-di-ai/perplexity' },
          { label: 'Claude', href: '/muncul-di-ai/claude' },
        ],
      },
      {
        title: 'Berdasarkan pasar',
        links: [{ label: 'GEO untuk Pasar Indonesia', href: '/geo-indonesia' }],
      },
    ],
  },
  {
    label: 'Sumber Daya',
    href: '/sumber-daya',
    columns: [
      {
        title: 'Belajar GEO',
        links: [
          { label: 'Apa itu GEO', href: '/apa-itu-geo' },
          { label: 'GEO vs SEO', href: '/belajar/geo-vs-seo' },
          { label: 'Cara kerja AI search', href: '/belajar/cara-kerja-ai-search' },
          { label: 'Mention rate', href: '/belajar/mention-rate' },
          { label: 'llms.txt', href: '/belajar/llms-txt' },
          { label: 'Kedekatan semantik', href: '/belajar/kedekatan-semantik' },
        ],
      },
      {
        title: 'Tools gratis',
        links: [
          { label: 'Cek Visibilitas AI', href: '/tools/cek-visibilitas-ai' },
          { label: 'Cek Skor GEO', href: '/tools/cek-skor-geo' },
          { label: 'Generator llms.txt', href: '/tools/generator-llms-txt' },
          { label: 'Generator Nginx Bot AI', href: '/tools/generator-nginx-ai-bot' },
        ],
      },
      {
        title: 'Perbandingan dan lainnya',
        links: [
          { label: 'Tools GEO Terbaik Indonesia', href: '/perbandingan/tools-geo-terbaik-indonesia' },
          { label: 'Jasa GEO vs Tools GEO', href: '/perbandingan/jasa-geo-vs-tools-geo' },
          { label: 'Blog', href: '/blog' },
          { label: 'Glosarium', href: '/glosarium' },
        ],
      },
    ],
  },
  {
    label: 'Harga',
    href: '/harga',
    columns: [],
  },
]

/** Footer link columns. */
export const FOOTER: NavColumn[] = [
  {
    title: 'Produk',
    links: [
      { label: 'Fitur', href: '/fitur' },
      { label: 'Harga', href: '/harga' },
      { label: 'Cek Visibilitas AI', href: '/tools/cek-visibilitas-ai' },
      { label: 'Book a Demo', href: SITE.demoHref },
    ],
  },
  {
    title: 'Solusi',
    links: [
      { label: 'UMKM', href: '/solusi/umkm' },
      { label: 'Agensi', href: '/solusi/agensi' },
      { label: 'E-commerce', href: '/solusi/ecommerce' },
      { label: 'GEO untuk Indonesia', href: '/geo-indonesia' },
    ],
  },
  {
    title: 'Belajar',
    links: [
      { label: 'Apa itu GEO', href: '/apa-itu-geo' },
      { label: 'GEO vs SEO', href: '/belajar/geo-vs-seo' },
      { label: 'Blog', href: '/blog' },
      { label: 'Glosarium', href: '/glosarium' },
    ],
  },
  {
    title: 'Perusahaan',
    links: [
      { label: 'Tentang', href: '/tentang' },
      { label: 'Kontak', href: '/kontak' },
      { label: 'Masuk', href: SITE.loginHref },
    ],
  },
]

export const FOOTER_LEGAL: NavLink[] = [
  { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
  { label: 'Ketentuan Layanan', href: '/ketentuan-layanan' },
]
