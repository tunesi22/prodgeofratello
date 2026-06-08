"use client"

import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { FormEvent, useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import Link from 'next/link'

export default function SignInPage() {
  const router = useRouter()
  const { signIn, setActive, isLoaded } = useSignIn()

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
    if (!isLoaded || loading) return

    setLoading(true)
    setError('')

    try {
      const result = await signIn.create({ identifier: email.trim(), password })

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId })
        router.push('/brands')
      }
    } catch (err: any) {
      const msg = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || 'Email atau password salah.'
      setError(msg)

      // Shake form on error
      gsap.fromTo(formRef.current, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.4)' })
    }

    setLoading(false)
  }

  return (
    <div ref={containerRef} className="min-h-screen flex overflow-hidden">
      {/* Left — brand panel */}
      <div
        ref={leftRef}
        className="hidden lg:flex lg:w-[56%] relative flex-col justify-between p-14 overflow-hidden bg-gray-950"
      >
        <div ref={blob1Ref} className="absolute top-[18%] left-[12%] w-[420px] h-[420px] bg-emerald-600/20 rounded-full blur-[130px] pointer-events-none" />
        <div ref={blob2Ref} className="absolute bottom-[18%] right-[8%] w-[360px] h-[360px] bg-teal-400/[0.12] rounded-full blur-[110px] pointer-events-none" />
        <div ref={blob3Ref} className="absolute top-[52%] left-[48%] w-[280px] h-[280px] bg-blue-500/10 rounded-full blur-[95px] pointer-events-none" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center text-white/90 font-semibold text-lg tracking-tight hover:text-white transition-colors">
            GEO Platform
          </Link>
        </div>

        <div className="relative z-10">
          <div ref={badgeRef} className="inline-flex items-center gap-2 mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400/80 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Generative Engine Optimization
            </span>
          </div>
          <h1 ref={headingRef} className="text-[clamp(30px,3.2vw,50px)] font-bold text-white leading-[1.15] tracking-tight mb-5">
            See how often your<br />brand appears in AI.
          </h1>
          <p ref={subRef} className="text-gray-400 text-[17px] leading-relaxed max-w-[400px]">
            Monitor visibility across ChatGPT, Gemini, Perplexity, and Claude.
            Identify gaps, track trends, and optimize your presence.
          </p>
        </div>

        <div ref={statsRef} className="relative z-10 flex items-center gap-10">
          {[
            { value: '4', label: 'AI Models' },
            { value: '5×', label: 'Per prompt' },
            { value: '100%', label: 'Automated' },
          ].map(({ value, label }) => (
            <div key={label}>
              <div className="text-white font-bold text-[22px] leading-none">{value}</div>
              <div className="text-gray-500 text-xs mt-1.5 tracking-wide">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Right — custom sign in form */}
      <div
        ref={rightRef}
        className="w-full lg:w-[44%] flex items-center justify-center bg-white p-8 lg:p-14"
      >
        <div className="w-full max-w-[380px]">
          {/* Mobile logo */}
          <div className="lg:hidden mb-10">
            <span className="font-bold text-xl text-gray-900 tracking-tight">GEO Platform</span>
          </div>

          <div className="mb-8">
            <h2 className="text-[26px] font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-gray-400 text-sm mt-1.5">Sign in to your account to continue</p>
          </div>

          <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError('') }}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError('') }}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 pr-12 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-gray-900 focus:ring-1 focus:ring-gray-900 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors text-xs select-none"
                  tabIndex={-1}
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !isLoaded}
              className="w-full bg-gray-900 hover:bg-gray-700 active:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm py-3 rounded-xl transition-colors mt-2 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Signing in…
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
