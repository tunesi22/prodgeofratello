import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Masuk ke Fratello',
  description: 'Login ke platform GEO kamu. Track brand visibility di ChatGPT, Gemini, Perplexity, dan Claude.',
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: 'https://hifratello.com/sign-in',
  },
}

export default function SignInLayout({ children }: { children: React.ReactNode }) {
  return children
}
