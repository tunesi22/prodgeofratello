'use client'

import { FormEvent, useState, type ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { CircleNotch, Eye, EyeSlash } from '@phosphor-icons/react/dist/ssr'
import { Button, Input } from '@/components/ui'
import { AuthLayout } from '@/components/auth/AuthLayout'
import { useLanguage } from '@/components/providers/LanguageProvider'

/**
 * Sign-in: the login form, rendered inside the shared AuthLayout (green panel +
 * GEO-fact carousel) so it matches the sign-up screen. Wires to POST
 * /api/auth/login, then routes first-time users (no brands) to onboarding.
 */
const COPY = {
  id: {
    welcome: 'Selamat datang kembali',
    welcomeSub: 'Masuk ke akun Anda untuk melanjutkan.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    emailPlaceholder: 'anda@perusahaan.com',
    passwordPlaceholder: 'Password Anda',
    show: 'Tampilkan password',
    hide: 'Sembunyikan password',
    wrongCredentials: 'Email atau password salah.',
    connectionError: 'Koneksi bermasalah, coba lagi.',
    signingIn: 'Sedang masuk...',
    signIn: 'Masuk',
    forgotPassword: 'Lupa password?',
  },
  en: {
    welcome: 'Welcome back',
    welcomeSub: 'Sign in to your account to continue.',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    emailPlaceholder: 'you@company.com',
    passwordPlaceholder: 'Your password',
    show: 'Show password',
    hide: 'Hide password',
    wrongCredentials: 'Wrong email or password.',
    connectionError: 'Connection problem, please try again.',
    signingIn: 'Signing in...',
    signIn: 'Sign in',
    forgotPassword: 'Forgot password?',
  },
} as const

export default function SignInPage(): ReactElement {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (res.ok) {
        // First-time users (no brands yet) go through onboarding.
        try {
          const brandsRes = await fetch('/api/brands', { credentials: 'include' })
          const brands = brandsRes.ok ? await brandsRes.json() : []
          router.push(Array.isArray(brands) && brands.length === 0 ? '/onboarding' : '/brands')
        } catch {
          router.push('/brands')
        }
      } else {
        const data = await res.json().catch(() => ({}))
        // API error messages pass through untranslated; only the fallback is ours.
        setError(data.error || t.wrongCredentials)
      }
    } catch {
      setError(t.connectionError)
    }
    setLoading(false)
  }

  return (
    <AuthLayout>
      <div className="mb-8 text-center">
        <h1 className="text-h2 font-normal tracking-tight text-primary lg:text-h1">{t.welcome}</h1>
        <p className="mx-auto mt-3 max-w-[440px] text-paragraph-big leading-relaxed text-tertiary">{t.welcomeSub}</p>
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

        <Input
          label={t.passwordLabel}
          required
          type={showPassword ? 'text' : 'password'}
          autoComplete="current-password"
          placeholder={t.passwordPlaceholder}
          value={password}
          error={Boolean(error)}
          onChange={(e) => {
            setPassword(e.target.value)
            setError('')
          }}
          trailingAction={
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
          }
        />

        <div className="-mt-1 flex justify-end">
          <Link
            href="/forgot-password"
            className="text-label-medium font-medium text-tertiary transition-colors duration-200 ease-standard hover:text-brand-token"
          >
            {t.forgotPassword}
          </Link>
        </div>

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
          {loading ? t.signingIn : t.signIn}
        </Button>
      </form>
    </AuthLayout>
  )
}
