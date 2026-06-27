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

export const metadata: Metadata = {
  metadataBase: new URL('https://hifratello.com'),
  title: 'Fratello, GEO Platform',
  description: 'Track and optimize your brand visibility across LLMs',
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
