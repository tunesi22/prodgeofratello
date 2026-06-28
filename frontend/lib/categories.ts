import type { Icon } from '@phosphor-icons/react'
import {
  Compass,
  Scales,
  ThumbsUp,
  Target,
  Trophy,
  Leaf,
  Hash,
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
  /** What this question type means commercially — the business-side "why it
   *  matters", shown in the prompt type guide. */
  business: Record<Lang, string>
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
    business: {
      id: 'Tahap awareness. Disebut di sini menaruh brand Anda di radar pembeli sejak awal, sebelum mereka punya pilihan favorit.',
      en: 'Awareness stage. Showing up here puts your brand on the buyer’s radar early, before they have a favourite.',
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
    business: {
      id: 'Tahap pertimbangan. Pembeli menimbang brand secara langsung — disebut positif di sini bisa memenangkan shortlist.',
      en: 'Consideration stage. Buyers are weighing brands head-to-head — a positive mention here can win the shortlist.',
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
    business: {
      id: 'Tahap keputusan dengan niat beli tinggi. Direkomendasikan AI di sini paling dekat dengan konversi.',
      en: 'Decision stage with high purchase intent. Being recommended here is the closest thing to a conversion.',
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
    business: {
      id: 'Pembeli dengan kebutuhan spesifik. Cocokkan konten ke use case ini untuk menang di niche bernilai tinggi meski volumenya lebih kecil.',
      en: 'Buyers with a specific need. Match content to these use cases to win high-value niches, even at lower volume.',
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
    business: {
      id: 'Social proof. Masuk daftar “terbaik” menaikkan kredibilitas dan visibilitas organik brand Anda.',
      en: 'Social proof. Landing in “best of” lists boosts your brand’s credibility and organic visibility.',
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
    business: {
      id: 'Minat pasar yang lebih luas. Volume besar yang membangun awareness dasar untuk kategori Anda.',
      en: 'Broader market interest. High volume that builds baseline awareness for your category.',
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
    icon: Hash,
    tone: 'neutral',
    label: { id: label, en: label },
    description: { id: 'Kategori lain.', en: 'Another category.' },
    business: {
      id: 'Tipe pertanyaan pembeli lain yang tetap memengaruhi visibilitas brand Anda.',
      en: 'Another type of buyer question that still shapes your brand visibility.',
    },
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
