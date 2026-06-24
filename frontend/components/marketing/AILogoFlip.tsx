'use client'

import { useEffect, useState, type ReactElement } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { siGooglegemini, siPerplexity, siClaude } from 'simple-icons'

/**
 * Inline flipping tile for the hero heading: a white rounded square that 3D-flips
 * through the four AI engines Fratello tracks. Gemini / Perplexity / Claude use
 * the official marks from `simple-icons`. OpenAI removed its logo from public
 * icon libraries, so ChatGPT uses a clean original "bloom" mark (drop the
 * official SVG into public/logos and swap if you have the rights).
 */
function Mark({ path, color }: { path: string; color: string }): ReactElement {
  return (
    <svg role="img" viewBox="0 0 24 24" fill={color} className="size-full">
      <path d={path} />
    </svg>
  )
}

/** Original 6-petal bloom, evoking the OpenAI mark without copying it. */
function ChatGPTMark(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="#0D0D0D" strokeWidth="1.5" className="size-full">
      {[0, 60, 120, 180, 240, 300].map((a) => (
        <ellipse key={a} cx="12" cy="7.8" rx="2.1" ry="4.6" transform={`rotate(${a} 12 12)`} />
      ))}
    </svg>
  )
}

const LOGOS = [
  { name: 'ChatGPT', node: <ChatGPTMark /> },
  { name: 'Gemini', node: <Mark path={siGooglegemini.path} color={`#${siGooglegemini.hex}`} /> },
  { name: 'Perplexity', node: <Mark path={siPerplexity.path} color={`#${siPerplexity.hex}`} /> },
  { name: 'Claude', node: <Mark path={siClaude.path} color={`#${siClaude.hex}`} /> },
]

export function AILogoFlip(): ReactElement {
  const [i, setI] = useState(0)

  useEffect(() => {
    const t = window.setInterval(() => setI((p) => (p + 1) % LOGOS.length), 1800)
    return () => window.clearInterval(t)
  }, [])

  return (
    <span
      className="relative mx-1.5 inline-flex size-[0.95em] -translate-y-[0.05em] items-center justify-center align-middle [perspective:600px]"
      role="img"
      aria-label={`mesin AI: ${LOGOS.map((l) => l.name).join(', ')}`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={LOGOS[i].name}
          initial={{ rotateX: -90, opacity: 0 }}
          animate={{ rotateX: 0, opacity: 1 }}
          exit={{ rotateX: 90, opacity: 0 }}
          transition={{ duration: 0.42, ease: 'easeOut' }}
          className="absolute inset-0 flex items-center justify-center rounded-[0.22em] bg-neutral-0 shadow-lg [backface-visibility:hidden]"
        >
          <span className="flex size-[58%] items-center justify-center">{LOGOS[i].node}</span>
        </motion.span>
      </AnimatePresence>
    </span>
  )
}
