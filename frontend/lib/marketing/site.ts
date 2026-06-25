/**
 * Marketing site configuration: the public hifratello.com surface.
 *
 * Indonesian-first (formal "Anda" register). The public marketing surface is a
 * single landing page, so the nav is anchor-based (scrolls to sections) — this
 * keeps every link working instead of pointing at routes that don't exist yet.
 * The only real routes are the demo/waitlist (`/fratello`) and sign-in.
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
}

export interface NavColumn {
  title: string
  links: NavLink[]
}

/** Top-nav items. All scroll to a section on the landing page. */
export const NAV: NavLink[] = [
  { label: 'Fitur', href: '#fitur' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Solusi', href: '#solusi' },
  { label: 'Pertanyaan Umum', href: '#faq' },
]

/** Footer link columns. Anchors + the two real routes; no dead links. */
export const FOOTER: NavColumn[] = [
  {
    title: 'Platform',
    links: [
      { label: 'Fitur', href: '#fitur' },
      { label: 'Cara Kerja', href: '#cara-kerja' },
      { label: 'Solusi', href: '#solusi' },
      { label: 'Pertanyaan Umum', href: '#faq' },
    ],
  },
  {
    title: 'Solusi',
    links: [
      { label: 'UMKM & Brand', href: '#solusi' },
      { label: 'Agensi', href: '#solusi' },
      { label: 'E-commerce', href: '#solusi' },
      { label: 'SaaS & Startup', href: '#solusi' },
    ],
  },
  {
    title: 'Perusahaan',
    links: [
      { label: 'Book a demo', href: SITE.demoHref },
      { label: 'Masuk', href: SITE.loginHref },
    ],
  },
]

export const FOOTER_LEGAL: NavLink[] = [
  { label: 'Kebijakan Privasi', href: '/kebijakan-privasi' },
  { label: 'Ketentuan Layanan', href: '/ketentuan-layanan' },
]
