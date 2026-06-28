'use client'

import { FormEvent, Suspense, useState, type ReactElement } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle, CircleNotch, Eye, EyeSlash } from '@phosphor-icons/react/dist/ssr'
import { Button, Input } from '@/components/ui'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useLanguage } from '@/components/providers/LanguageProvider'

/**
 * Reset password: reached from the emailed link (/reset-password?token=…). Takes
 * a new password + confirmation and posts to POST /api/auth/reset-password with
 * the token. On success the token is burned server-side and the user is sent
 * back to sign in. useSearchParams requires a Suspense boundary in the App
 * Router, so the form lives in a child wrapped below.
 */
const MIN_LENGTH = 8

const COPY = {
  id: {
    title: 'Atur password baru',
    sub: 'Pilih password baru untuk akun Anda.',
    passwordLabel: 'Password baru',
    confirmLabel: 'Konfirmasi password',
    passwordPlaceholder: 'Minimal 8 karakter',
    confirmPlaceholder: 'Ulangi password baru',
    show: 'Tampilkan password',
    hide: 'Sembunyikan password',
    submit: 'Reset password',
    resetting: 'Menyimpan...',
    tooShort: 'Password minimal 8 karakter.',
    mismatch: 'Konfirmasi password tidak cocok.',
    connectionError: 'Koneksi bermasalah, coba lagi.',
    invalidLink: 'Tautan reset tidak valid. Minta tautan baru.',
    requestNew: 'Minta tautan baru',
    backToSignIn: 'Kembali ke halaman masuk',
    doneTitle: 'Password diperbarui',
    doneBody: 'Password Anda sudah diganti. Silakan masuk dengan password baru.',
    goToSignIn: 'Masuk',
  },
  en: {
    title: 'Set a new password',
    sub: 'Choose a new password for your account.',
    passwordLabel: 'New password',
    confirmLabel: 'Confirm password',
    passwordPlaceholder: 'At least 8 characters',
    confirmPlaceholder: 'Repeat your new password',
    show: 'Show password',
    hide: 'Hide password',
    submit: 'Reset password',
    resetting: 'Saving...',
    tooShort: 'Password must be at least 8 characters.',
    mismatch: "Passwords don't match.",
    connectionError: 'Connection problem, please try again.',
    invalidLink: 'This reset link is invalid. Please request a new one.',
    requestNew: 'Request a new link',
    backToSignIn: 'Back to sign in',
    doneTitle: 'Password updated',
    doneBody: 'Your password has been changed. You can now sign in with your new password.',
    goToSignIn: 'Sign in',
  },
} as const

function ResetPasswordForm(): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]
  const token = useSearchParams().get('token') ?? ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (loading) return

    if (password.length < MIN_LENGTH) {
      setError(t.tooShort)
      return
    }
    if (password !== confirm) {
      setError(t.mismatch)
      return
    }

    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      if (res.ok) {
        setDone(true)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || t.connectionError)
      }
    } catch {
      setError(t.connectionError)
    }
    setLoading(false)
  }

  // Reached the page without a token in the URL — nothing to reset.
  if (token === '') {
    return (
      <div className="flex flex-col items-center text-center">
        <h1 className="text-h2 font-normal tracking-tight text-primary lg:text-h1">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-paragraph-big leading-relaxed text-error-token">{t.invalidLink}</p>
        <Link
          href="/forgot-password"
          className="mt-8 inline-flex items-center gap-1.5 text-label-big font-medium text-brand-token transition-colors duration-200 ease-standard hover:underline"
        >
          {t.requestNew}
        </Link>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex flex-col items-center text-center">
        <span className="mb-6 flex size-14 items-center justify-center rounded-circle bg-display-brand text-icon-brand">
          <CheckCircle weight="fill" className="size-8" aria-hidden="true" />
        </span>
        <h1 className="text-h2 font-normal tracking-tight text-primary lg:text-h1">{t.doneTitle}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-paragraph-big leading-relaxed text-tertiary">{t.doneBody}</p>
        <Link href="/sign-in" className="mt-8 w-full">
          <Button size="lg" className="w-full">
            {t.goToSignIn}
          </Button>
        </Link>
      </div>
    )
  }

  const trailingToggle = (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={() => setShowPassword((v) => !v)}
      aria-label={showPassword ? t.hide : t.show}
      aria-pressed={showPassword}
      className="flex size-7 items-center justify-center rounded-token-4 text-icon-dark-gray transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed hover:text-primary focus-visible:bg-btn-ghost-pressed focus-visible:text-primary focus-visible:outline-none"
    >
      {showPassword ? <EyeSlash className="size-5" /> : <Eye className="size-5" />}
    </button>
  )

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-h2 font-normal tracking-tight text-primary lg:text-h1">{t.title}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-paragraph-big leading-relaxed text-tertiary">{t.sub}</p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        <Input
          label={t.passwordLabel}
          required
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={t.passwordPlaceholder}
          value={password}
          error={Boolean(error)}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          trailingAction={trailingToggle}
        />

        <Input
          label={t.confirmLabel}
          required
          type={showPassword ? 'text' : 'password'}
          autoComplete="new-password"
          placeholder={t.confirmPlaceholder}
          value={confirm}
          error={Boolean(error)}
          onChange={(e) => {
            setConfirm(e.target.value)
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
          {loading ? t.resetting : t.submit}
        </Button>

        <Link
          href="/sign-in"
          className="inline-flex items-center justify-center gap-1.5 text-label-medium font-medium text-tertiary transition-colors duration-200 ease-standard hover:text-brand-token"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {t.backToSignIn}
        </Link>
      </form>
    </>
  )
}

export default function ResetPasswordPage(): ReactElement {
  return (
    <AuthLayout>
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthLayout>
  )
}
