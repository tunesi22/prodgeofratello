import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import Sidebar from '@/components/Sidebar'
import './globals.css'

export const metadata: Metadata = {
  title: 'GEO Platform',
  description: 'Track and optimize your brand visibility across LLMs',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-gray-50 text-gray-900 antialiased flex">
          <Sidebar />
          <main className="flex-1 min-h-screen overflow-y-auto">
            {children}
          </main>
        </body>
      </html>
    </ClerkProvider>
  )
}
