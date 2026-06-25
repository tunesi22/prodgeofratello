'use client'

import { useEffect, useRef, type ReactElement } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

/**
 * Ambient background for the marketing pages: soft, light sage glows over white
 * (NOT dark saturated greens, which read as murk). Sits behind the content
 * (content is z-10) and shows through the transparent sections, so the whole
 * page reads as one cohesive, gently green-tinted surface with floating cards.
 * GSAP ScrollTrigger drifts the glows slowly as you scroll for a living accent;
 * disabled under prefers-reduced-motion (they stay as a soft static tint).
 */
export function GreenAccents(): ReactElement {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    gsap.registerPlugin(ScrollTrigger)
    const ctx = gsap.context(() => {
      const scroll = { trigger: document.documentElement, start: 'top top', end: 'bottom bottom', scrub: 1.2 }
      gsap.fromTo('.ga-1', { yPercent: -6 }, { yPercent: 18, ease: 'none', scrollTrigger: scroll })
      gsap.fromTo('.ga-2', { yPercent: 5 }, { yPercent: -16, ease: 'none', scrollTrigger: scroll })
      gsap.fromTo('.ga-3', { yPercent: 0 }, { yPercent: 12, ease: 'none', scrollTrigger: scroll })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <div ref={root} aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {/* light sage clouds — a whisper of green, kept subtle and airy */}
      <div className="ga-1 absolute -left-[12%] top-[6%] h-[48vw] w-[48vw] rounded-full bg-[#9cbdaf] opacity-[0.12] blur-[170px]" />
      <div className="ga-2 absolute -right-[14%] top-[46%] h-[50vw] w-[50vw] rounded-full bg-[#b5cdc3] opacity-[0.16] blur-[180px]" />
      <div className="ga-3 absolute -bottom-[10%] left-[24%] h-[44vw] w-[44vw] rounded-full bg-[#ceded7] opacity-[0.22] blur-[170px]" />
    </div>
  )
}
