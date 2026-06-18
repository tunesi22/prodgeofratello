import type { Metadata } from 'next'
import { Figtree, Lora } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { LanguageProvider } from '@/components/providers/LanguageProvider'
import { TopLoadingProvider } from '@/components/providers/TopLoadingBar'
import { ToastProvider } from '@/components/ui'
import './globals.css'

const figtree = Figtree({
  subsets: ['latin'],
  variable: '--font-figtree',
  display: 'swap',
})

// Brand wordmark only (the "Fratello" serif lockup in the Figma shell), // never for UI text. Exposed as font-serif.
const lora = Lora({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-lora',
  display: 'swap',
})

const BASE_URL = 'https://hifratello.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Fratello — GEO Platform',
    template: '%s | Fratello',
  },
  description: 'Track seberapa sering brand kamu disebut oleh ChatGPT, Gemini, Perplexity, dan Claude. Otomatis generate konten yang menutup gap — dan buat AI merekomendasikan brandmu.',
  keywords: ['GEO', 'Generative Engine Optimization', 'brand visibility', 'AI mentions', 'ChatGPT', 'Gemini', 'Perplexity', 'brand tracking', 'LLM optimization'],
  authors: [{ name: 'Fratello', url: BASE_URL }],
  creator: 'Fratello',
  publisher: 'Fratello',
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
  openGraph: {
    type: 'website',
    url: BASE_URL,
    siteName: 'Fratello',
    title: 'Fratello — GEO Platform',
    description: 'Track seberapa sering brand kamu disebut AI. Generate konten otomatis yang menutup gap visibilitas brandmu di ChatGPT, Gemini, dan Perplexity.',
    locale: 'id_ID',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Fratello GEO Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Fratello — GEO Platform',
    description: 'Track seberapa sering brand kamu disebut AI. Generate konten otomatis yang menutup gap visibilitas brandmu.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: BASE_URL,
  },
}

// Applies the persisted theme before first paint to avoid a flash.
const themeInitScript = `(function(){try{var t=localStorage.getItem('fratello-theme');document.documentElement.dataset.theme=(t==='dark'||t==='light')?t:'light';}catch(e){document.documentElement.dataset.theme='light';}})();`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className={`${figtree.variable} ${lora.variable} font-sans antialiased`}>
        <ThemeProvider>
          <LanguageProvider>
            <TopLoadingProvider>
              <ToastProvider>{children}</ToastProvider>
            </TopLoadingProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
