'use client'

import { useEffect, type ReactElement } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'

/**
 * Fast, fixed-duration in-page anchor scrolling for the marketing pages. The
 * browser's native smooth scroll animates proportional to distance, so jumping
 * to a far section ("How it works", "Solutions") felt slow. This intercepts all
 * same-page hash links and scrolls with a constant ~0.6s ease via GSAP, with an
 * offset for the fixed nav. Honors prefers-reduced-motion (instant jump).
 */
export function SmoothAnchors(): ReactElement | null {
  useEffect(() => {
    gsap.registerPlugin(ScrollToPlugin)
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    function onClick(e: MouseEvent): void {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return
      const anchor = (e.target as Element | null)?.closest('a[href^="#"]')
      if (!anchor) return
      const href = anchor.getAttribute('href') ?? ''
      const id = href.slice(1)
      if (id === '') return
      const el = document.getElementById(id)
      if (el == null) return
      // preventDefault alone stops the native jump AND Next <Link> navigation
      // (Link bails on defaultPrevented). We do NOT stopPropagation, so a link's
      // own React onClick (e.g. closing the mobile menu) still runs.
      e.preventDefault()
      if (reduce) {
        el.scrollIntoView()
      } else {
        gsap.to(window, { duration: 0.6, ease: 'power3.inOut', overwrite: true, scrollTo: { y: el, offsetY: 96 } })
      }
      history.pushState(null, '', href)
    }

    // Capture phase so this runs before Next's <Link> click handler.
    document.addEventListener('click', onClick, true)
    return () => document.removeEventListener('click', onClick, true)
  }, [])

  return null
}
