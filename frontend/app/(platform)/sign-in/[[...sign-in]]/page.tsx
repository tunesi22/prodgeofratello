"use client"

import { FormEvent, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import gsap from 'gsap'
import Link from 'next/link'
import { CircleNotch, Eye, EyeSlash } from '@phosphor-icons/react/dist/ssr'
import { FratelloLogo } from '@/components/onboarding/FratelloLogo'
import { Button, Input } from '@/components/ui'
import { useLanguage } from '@/components/providers/LanguageProvider'

/** Page copy, both languages. No dashes; simple words, marketing tone kept. */
const COPY = {
  id: {
    badge: 'Generative Engine Optimization',
    headline1: 'Lihat seberapa sering',
    headline2: 'brand Anda muncul di AI.',
    sub: 'Pantau seberapa sering brand Anda disebut di ChatGPT, Gemini, Perplexity, dan Claude. Temukan celahnya, ikuti trennya, dan buat brand Anda semakin terlihat.',
    statModels: 'Model AI',
    statPerPrompt: 'Per prompt',
    statAutomated: 'Otomatis',
    welcome: 'Selamat datang kembali',
    welcomeSub: 'Masuk ke akun Anda untuk melanjutkan',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    hide: 'Sembunyikan password',
    show: 'Tampilkan password',
    wrongCredentials: 'Email atau password salah.',
    connectionError: 'Koneksi bermasalah, coba lagi.',
    signingIn: 'Sedang masuk…',
    signIn: 'Masuk',
  },
  en: {
    badge: 'Generative Engine Optimization',
    headline1: 'See how often your',
    headline2: 'brand appears in AI.',
    sub: 'Monitor visibility across ChatGPT, Gemini, Perplexity, and Claude. Identify gaps, track trends, and optimize your presence.',
    statModels: 'AI Models',
    statPerPrompt: 'Per prompt',
    statAutomated: 'Automated',
    welcome: 'Welcome back',
    welcomeSub: 'Sign in to your account to continue',
    emailLabel: 'Email',
    passwordLabel: 'Password',
    hide: 'Hide password',
    show: 'Show password',
    wrongCredentials: 'Wrong email or password.',
    connectionError: 'Connection problem, please try again.',
    signingIn: 'Signing in…',
    signIn: 'Sign In',
  },
} as const

export default function SignInPage() {
  const router = useRouter()
  const { lang } = useLanguage()
  const t = COPY[lang]
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const containerRef = useRef<HTMLDivElement>(null)
  const leftRef = useRef<HTMLDivElement>(null)
  const rightRef = useRef<HTMLDivElement>(null)
  const blob1Ref = useRef<HTMLDivElement>(null)
  const blob2Ref = useRef<HTMLDivElement>(null)
  const blob3Ref = useRef<HTMLDivElement>(null)
  const badgeRef = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subRef = useRef<HTMLParagraphElement>(null)
  const statsRef = useRef<HTMLDivElement>(null)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(leftRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 1 })
        .fromTo(rightRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, '-=0.75')
        .fromTo(badgeRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, '-=0.55')
        .fromTo(headingRef.current, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, '-=0.45')
        .fromTo(subRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.45')
        .fromTo(statsRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, '-=0.35')
        .fromTo(formRef.current, { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, '-=0.5')

      gsap.to(blob1Ref.current, { x: 35, y: -28, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(blob2Ref.current, { x: -25, y: 32, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.5 })
      gsap.to(blob3Ref.current, { x: 18, y: -38, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.2 })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (loading) return

    setLoading(true)
    setError('')

    const shake = () =>
      gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' })

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password }),
      })

      if (res.ok) {
        // First-time users (no brands yet) go through onboarding
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
        shake()
      }
    } catch {
      setError(t.connectionError)
      shake()
    }

    setLoading(false)
  }

  return (
    <div ref={containerRef} className="flex min-h-screen overflow-hidden bg-primary">
      {/* Left: brand panel. Deliberately always-dark marketing surface, so it
          uses the fixed neutral/brand primitives (not theme-aware tokens). */}
      <div
        ref={leftRef}
        className="relative hidden flex-col justify-between overflow-hidden bg-neutral-950 p-14 lg:flex lg:w-[56%]"
      >
        <div ref={blob1Ref} className="pointer-events-none absolute left-[12%] top-[18%] h-[420px] w-[420px] rounded-full bg-brand-500 opacity-20 blur-3xl" />
        <div ref={blob2Ref} className="pointer-events-none absolute bottom-[18%] right-[8%] h-[360px] w-[360px] rounded-full bg-brand-300 opacity-10 blur-3xl" />
        <div ref={blob3Ref} className="pointer-events-none absolute left-[48%] top-[52%] h-[280px] w-[280px] rounded-full bg-brand-400 opacity-10 blur-3xl" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5 text-h6 font-semibold tracking-tight text-white-remain transition-opacity duration-200 ease-standard hover:opacity-90">
            <FratelloLogo className="h-7 w-[46px] text-brand-300" />
            Fratello
          </Link>
        </div>

        <div className="relative z-10">
          <div ref={badgeRef} className="mb-8 inline-flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-brand-300" />
            <span className="text-label-medium font-semibold uppercase tracking-widest text-brand-300">
              {t.badge}
            </span>
          </div>
          <h1 ref={headingRef} className="mb-5 text-h2 font-bold tracking-tight text-white-remain lg:text-h1">
            {t.headline1}<br />{t.headline2}
          </h1>
          <p ref={subRef} className="max-w-[400px] text-paragraph-big leading-relaxed text-neutral-400">
            {t.sub}
          </p>
        </div>

        <div ref={statsRef} className="relative z-10 flex items-center gap-10">
          {[
            { value: '4', label: t.statModels },
            { value: '5×', label: t.statPerPrompt },
            { value: '100%', label: t.statAutomated },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-h4 font-bold leading-none text-white-remain">{value}</div>
              <div className="mt-1.5 text-paragraph-medium tracking-wide text-neutral-500">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right: form. Theme-aware surface + design-system components. */}
      <div
        ref={rightRef}
        className="flex w-full items-center justify-center bg-primary p-8 lg:w-[44%] lg:p-14"
      >
        <div className="w-full max-w-[380px]">
          <div className="mb-10 lg:hidden">
            <span className="inline-flex items-center gap-2.5 text-h5 font-bold tracking-tight text-primary">
              <FratelloLogo className="h-7 w-[46px] text-icon-brand" />
              Fratello
            </span>
          </div>

          <div className="mb-8">
            <h2 className="text-h4 font-bold tracking-tight text-primary">{t.welcome}</h2>
            <p className="mt-1.5 text-paragraph-medium text-tertiary">{t.welcomeSub}</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            <Input
              label={t.emailLabel}
              type="email"
              inputMode="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              error={Boolean(error)}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
            />

            <Input
              label={t.passwordLabel}
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              error={Boolean(error)}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              iconRight={
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? t.hide : t.show}
                  className="flex items-center justify-center transition-colors duration-200 ease-standard hover:text-primary"
                >
                  {showPassword ? <EyeSlash className="size-5" /> : <Eye className="size-5" />}
                </button>
              }
            />

            {error !== '' && (
              <p role="alert" className="text-paragraph-medium text-error-token">
                {error}
              </p>
            )}

            <Button
              htmlType="submit"
              size="lg"
              className="mt-2 w-full"
              disabled={loading}
              iconLeft={loading ? <CircleNotch className="size-5 animate-spin" aria-hidden="true" /> : undefined}
            >
              {loading ? t.signingIn : t.signIn}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
