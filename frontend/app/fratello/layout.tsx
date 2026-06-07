import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Fratello — Coming June',
  description: 'Bikin brand kamu direkomendasiin sama AI, dipilih sama manusia.',
}

export default function FratelloLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
