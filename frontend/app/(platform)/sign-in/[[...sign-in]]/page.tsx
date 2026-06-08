"use client"

import { SignIn } from '@clerk/nextjs'
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import Link from 'next/link'

export default function SignInPage() {
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

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

      tl.fromTo(leftRef.current, { x: -40, opacity: 0 }, { x: 0, opacity: 1, duration: 1 })
        .fromTo(rightRef.current, { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 1 }, '-=0.75')
        .fromTo(badgeRef.current, { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.65 }, '-=0.55')
        .fromTo(headingRef.current, { y: 22, opacity: 0 }, { y: 0, opacity: 1, duration: 0.75 }, '-=0.45')
        .fromTo(subRef.current, { y: 14, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.45')
        .fromTo(statsRef.current, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, '-=0.35')

      gsap.to(blob1Ref.current, { x: 35, y: -28, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' })
      gsap.to(blob2Ref.current, { x: -25, y: 32, duration: 9, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 2.5 })
      gsap.to(blob3Ref.current, { x: 18, y: -38, duration: 8, repeat: -1, yoyo: true, ease: 'sine.inOut', delay: 1.2 })
    }, containerRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={containerRef} className="min-h-screen flex overflow-hidden">
      {/* Left — brand panel */}
      <div
        ref={leftRef}
        className="hidden lg:flex lg:w-[56%] relative flex-col justify-between p-14 overflow-hidden bg-gray-950"
      >
        {/* Animated blobs */}
        <div ref={blob1Ref} className="absolute top-[18%] left-[12%] w-[420px] h-[420px] bg-emerald-600/20 rounded-full blur-[130px] pointer-events-none" />
        <div ref={blob2Ref} className="absolute bottom-[18%] right-[8%] w-[360px] h-[360px] bg-teal-400/[0.12] rounded-full blur-[110px] pointer-events-none" />
        <div ref={blob3Ref} className="absolute top-[52%] left-[48%] w-[280px] h-[280px] bg-blue-500/10 rounded-full blur-[95px] pointer-events-none" />

        {/* Logo */}
        <div className="relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 text-white/90 font-semibold text-lg tracking-tight hover:text-white transition-colors"
          >
            GEO Platform
          </Link>
        </div>

        {/* Copy */}
        <div className="relative z-10">
          <div ref={badgeRef} className="inline-flex items-center gap-2 mb-8">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-emerald-400/80 text-[11px] font-semibold tracking-[0.18em] uppercase">
              Generative Engine Optimization
            </span>
          </div>

          <h1
            ref={headingRef}
            className="text-[clamp(30px,3.2vw,50px)] font-bold text-white leading-[1.15] tracking-tight mb-5"
          >
            See how often your<br />brand appears in AI.
          </h1>

          <p ref={subRef} className="text-gray-400 text-[17px] leading-relaxed max-w-[400px]">
            Monitor visibility across ChatGPT, Gemini, Perplexity, and Claude.
            Identify gaps, track trends, and optimize your presence.
          </p>
        </div>

        {/* Stats */}
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

      {/* Right — sign in */}
      <div
        ref={rightRef}
        className="w-full lg:w-[44%] flex items-center justify-center bg-white p-8 lg:p-14"
      >
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden mb-8">
            <Link href="/" className="font-bold text-xl text-gray-900 tracking-tight">
              GEO Platform
            </Link>
          </div>

          <SignIn
            appearance={{
              elements: {
                rootBox: 'w-full',
                card: 'shadow-none bg-transparent p-0 border-0',
                headerTitle: 'text-[22px] font-bold text-gray-900',
                headerSubtitle: 'text-gray-400 text-sm',
                socialButtonsBlockButton:
                  'border border-gray-200 hover:border-gray-400 hover:bg-gray-50 transition-all rounded-lg text-sm font-medium text-gray-700 h-11',
                socialButtonsBlockButtonText: 'font-medium',
                dividerLine: 'bg-gray-100',
                dividerText: 'text-gray-400 text-xs',
                formButtonPrimary:
                  'bg-gray-900 hover:bg-gray-700 transition-colors text-sm font-medium rounded-lg h-11',
                formFieldInput:
                  'border-gray-200 hover:border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 rounded-lg text-sm',
                formFieldLabel: 'text-gray-700 text-sm font-medium',
                footerActionText: 'text-gray-400 text-sm',
                footerActionLink: 'text-gray-900 hover:text-gray-700 font-semibold',
                identityPreviewText: 'text-gray-700',
                identityPreviewEditButton: 'text-gray-500 hover:text-gray-700',
                alertText: 'text-sm',
                formFieldErrorText: 'text-red-500 text-xs',
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}
