import type { Icon } from '@phosphor-icons/react'
import {
  Compass,
  Scales,
  ThumbsUp,
  Target,
  Trophy,
  Leaf,
  Tag,
} from '@phosphor-icons/react/dist/ssr'
import type { ChipType } from '@/components/ui'
import type { Lang } from '@/components/providers/LanguageProvider'

/**
 * Canonical prompt-category metadata, one source of truth for every surface that
 * shows categories (Prompts, AI Prompt Research, Analytics gaps, AI Articles).
 * Each category is distinguished by a Phosphor ICON + a translated NAME +
 * a one-line plain DESCRIPTION (not by chip colour alone), since the backend
 * emits 5 categories that would otherwise collide in the DS's limited palette.
 *
 * Backend categories (prompt.service.ts): discovery, comparison, recommendation,
 * use-case, best-of. The discovery flow may also yield "organic". Unknown keys
 * fall back to a title-cased label with a neutral tag icon.
 */
export interface CategoryMeta {
  key: string
  icon: Icon
  /** DS chip tone (secondary cue; the icon + label carry the distinction). */
  tone: ChipType
  label: Record<Lang, string>
  description: Record<Lang, string>
}

const CATEGORIES: Record<string, CategoryMeta> = {
  discovery: {
    key: 'discovery',
    icon: Compass,
    tone: 'neutral',
    label: { id: 'Penemuan', en: 'Discovery' },
    description: {
      id: 'Orang sedang mencari tahu pilihan yang ada.',
      en: 'People exploring the options available to them.',
    },
  },
  comparison: {
    key: 'comparison',
    icon: Scales,
    tone: 'neutral',
    label: { id: 'Perbandingan', en: 'Comparison' },
    description: {
      id: 'Membandingkan satu brand dengan brand lain.',
      en: 'Comparing one brand against another.',
    },
  },
  recommendation: {
    key: 'recommendation',
    icon: ThumbsUp,
    tone: 'success',
    label: { id: 'Rekomendasi', en: 'Recommendation' },
    description: {
      id: 'Meminta rekomendasi atau saran langsung.',
      en: 'Asking for a direct recommendation.',
    },
  },
  'use-case': {
    key: 'use-case',
    icon: Target,
    tone: 'warning',
    label: { id: 'Kasus Penggunaan', en: 'Use case' },
    description: {
      id: 'Kebutuhan atau situasi yang spesifik.',
      en: 'A specific need or situation.',
    },
  },
  'best-of': {
    key: 'best-of',
    icon: Trophy,
    tone: 'warning',
    label: { id: 'Daftar Terbaik', en: 'Best of' },
    description: {
      id: 'Mencari daftar yang terbaik di kategorinya.',
      en: 'Looking for best-in-class lists.',
    },
  },
  organic: {
    key: 'organic',
    icon: Leaf,
    tone: 'success',
    label: { id: 'Organik', en: 'Organic' },
    description: {
      id: 'Pertanyaan umum seputar topik Anda.',
      en: 'General questions around your topic.',
    },
  },
}

/** Fixed display order; unknown categories are appended after, in input order. */
export const CATEGORY_ORDER: string[] = [
  'discovery',
  'comparison',
  'recommendation',
  'use-case',
  'best-of',
  'organic',
]

function titleCase(key: string): string {
  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

/** Metadata for any category key, with a graceful fallback for unknown values. */
export function categoryMeta(category: string): CategoryMeta {
  const known = CATEGORIES[category]
  if (known) return known
  const label = titleCase(category) || 'Lainnya'
  return {
    key: category,
    icon: Tag,
    tone: 'neutral',
    label: { id: label, en: label },
    description: { id: 'Kategori lain.', en: 'Another category.' },
  }
}

/** Sort category keys by the canonical order, unknowns last (stable). */
export function sortCategoryKeys(keys: string[]): string[] {
  return [...keys].sort((a, b) => {
    const ia = CATEGORY_ORDER.indexOf(a)
    const ib = CATEGORY_ORDER.indexOf(b)
    const ra = ia === -1 ? Number.MAX_SAFE_INTEGER : ia
    const rb = ib === -1 ? Number.MAX_SAFE_INTEGER : ib
    return ra - rb
  })
}
