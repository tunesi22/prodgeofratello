import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function RootPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('geo_token')) {
    redirect('/brands')
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-primary px-6 text-center">
      <div className="flex flex-col items-center gap-8 max-w-lg">
        {/* Logo mark */}
        <div className="flex items-center gap-2">
          <svg width="36" height="22" viewBox="0 0 156 95" fill="none" aria-hidden="true">
            <path d="M75 0 L17.82 95 L0 95 Z" fill="currentColor" className="text-brand-token" />
            <path d="M82 0 L138.42 95 L156 95 Z" fill="currentColor" className="text-brand-token" />
            <path d="M78.96 1 L91 95 L24 95 Z" fill="currentColor" className="text-brand-token" />
          </svg>
          <span className="font-serif text-[28px] tracking-[-0.5px] text-primary">Fratello</span>
        </div>

        {/* Hero */}
        <div className="flex flex-col gap-3">
          <h1 className="text-h2 font-semibold text-primary leading-tight">
            Brand kamu disebut AI?
          </h1>
          <p className="text-paragraph-big text-secondary">
            Track seberapa sering brand kamu muncul di jawaban ChatGPT, Gemini, Perplexity, dan Claude.
            Generate konten yang menutup gap — otomatis.
          </p>
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-3 w-full">
          <Link
            href="/sign-in"
            className="inline-flex w-full max-w-xs items-center justify-center rounded-token-8 bg-brand-green px-6 py-3 text-action-medium font-medium text-white transition-opacity hover:opacity-90"
          >
            Masuk ke Platform
          </Link>
          <Link
            href="/sign-up"
            className="text-paragraph-medium text-brand-token underline-offset-2 hover:underline transition-colors"
          >
            Belum punya akun? Daftar gratis
          </Link>
        </div>

        <p className="text-label-medium text-tertiary">
          ChatGPT · Gemini · Perplexity · Claude
        </p>
      </div>
    </main>
  )
}
