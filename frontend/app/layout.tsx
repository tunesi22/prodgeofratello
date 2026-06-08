import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'GEO Platform',
  description: 'Track and optimize your brand visibility across LLMs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
