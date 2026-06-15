'use client'

import type { ReactElement } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/Button'
import { useTheme } from '@/components/providers/ThemeProvider'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { ONBOARDING_COPY } from '@/lib/onboarding-copy'
import { fadeUp } from '@/lib/motion'
import { GlobeIcon, SunIcon, MoonIcon } from './icons'
import { cn } from '@/lib/cn'

/**
 * Language + theme toggle pill (bottom of every onboarding screen).
 * Figma: 210×52 pill, px 16 / py 8, gap 16, two SM ghost buttons with icons.
 */
export function FooterToggles({ className }: { className?: string }): ReactElement {
  const { theme, toggleTheme } = useTheme()
  const { lang, toggleLang } = useLanguage()
  const copy = ONBOARDING_COPY[lang]

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={fadeUp}
      className={cn(
        // Updated from Figma 94:612: rounded-rectangle (radius-12), no fill,
        // px-12/py-8, gap-8, replaces the previous pill.
        'inline-flex items-center gap-2 rounded-token-12 border border-neutral-primary px-3 py-2',
        'transition-colors duration-300 ease-standard',
        className,
      )}
    >
      <Button
        type="ghost"
        size="sm"
        iconLeft={<GlobeIcon />}
        onClick={toggleLang}
        aria-label={lang === 'id' ? 'Ganti bahasa ke English' : 'Switch language to Indonesian'}
      >
        {copy.toggles.langLabel}
      </Button>
      <Button
        type="ghost"
        size="sm"
        iconLeft={theme === 'light' ? <SunIcon /> : <MoonIcon />}
        onClick={toggleTheme}
        aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
      >
        {theme === 'light' ? copy.toggles.light : copy.toggles.dark}
      </Button>
    </motion.div>
  )
}
