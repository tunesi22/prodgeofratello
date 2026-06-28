'use client'

import { FormEvent, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { ArrowLeft, CircleNotch, EnvelopeSimple } from '@phosphor-icons/react/dist/ssr'
import { Button, Input } from '@/components/ui'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useLanguage } from '@/components/providers/LanguageProvider'

/**
 * Forgot password: collects an email and asks the backend to send a reset link
 * (POST /api/auth/forgot-password). The backend always answers generically, so
 * this screen shows the same "check your inbox" confirmation whether or not the
 * email has an account — it never reveals which emails are registered.
 */
const COPY = {
  id: {
    title: 'Lupa password?',
    sub: 'Masukkan email akun Anda, kami kirim tautan untuk atur ulang password.',
    emailLabel: 'Email',
    emailPlaceholder: 'anda@perusahaan.com',
    submit: 'Kirim tautan reset',
    sending: 'Mengirim...',
    backToSignIn: 'Kembali ke halaman masuk',
    connectionError: 'Koneksi bermasalah, coba lagi.',
    sentTitle: 'Cek email Anda',
    sentBody: 'Jika ada akun terdaftar dengan email tersebut, kami sudah mengirim tautan untuk atur ulang password. Tautan berlaku 1 jam.',
  },
  en: {
    title: 'Forgot password?',
    sub: "Enter your account email and we'll send you a link to reset your password.",
    emailLabel: 'Email',
    emailPlaceholder: 'you@company.com',
    submit: 'Send reset link',
    sending: 'Sending...',
    backToSignIn: 'Back to sign in',
    connectionError: 'Connection problem, please try again.',
    sentTitle: 'Check your email',
    sentBody: "If an account exists for that email, we've sent a link to reset your password. The link expires in 1 hour.",
  },
} as const

export default function ForgotPasswordPage(): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      })
      if (res.ok) {
        setSent(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || t.connectionError)
      }
    } catch {
      setError(t.connectionError)
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center">
          <span className="mb-6 flex size-14 items-center justify-center rounded-circle bg-display-brand text-icon-brand">
            <EnvelopeSimple className="size-7" aria-hidden="true" />
          </span>
          <h1 className="text-h2 font-normal tracking-tight text-primary lg:text-h1">{t.sentTitle}</h1>
          <p className="mx-auto mt-3 max-w-[440px] text-paragraph-big leading-relaxed text-tertiary">{t.sentBody}</p>
          <Link
            href="/sign-in"
            className="mt-8 inline-flex items-center gap-1.5 text-label-big font-medium text-brand-token transition-colors duration-200 ease-standard hover:underline"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t.backToSignIn}
          </Link>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="text-h2 font-normal tracking-tight text-primary lg:text-h1">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-paragraph-big leading-relaxed text-tertiary">{t.sub}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label={t.emailLabel}
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          placeholder={t.emailPlaceholder}
          value={email}
          error={Boolean(error)}
          onChange={(e) => {
            setEmail(e.target.value)
            setError('')
          }}
        />

        {error !== '' && (
          <p role="alert" className="text-paragraph-medium text-error-token">
            {error}
          </p>
        )}

        <Button
          htmlType="submit"
          size="lg"
          className="mt-1 w-full"
          disabled={loading}
          iconLeft={loading ? <CircleNotch className="size-5 animate-spin" aria-hidden="true" /> : undefined}
        >
          {loading ? t.sending : t.submit}
        </Button>

        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center gap-1.5 text-label-medium font-medium text-tertiary transition-colors duration-200 ease-standard hover:text-brand-token"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.backToSignIn}
        </Link>
      </form>
    </AuthLayout>
  )
}
