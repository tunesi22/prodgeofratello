/**
 * Article composer config + options, shared by the AI Articles page and the
 * ArticleComposer component.
 *
 * The backend generate endpoint currently consumes only `promptId`; the rest of
 * the config is sent forward-compatibly (so generation can honour tone, length,
 * etc. once the backend reads them) and is what gets stored in a local draft.
 * Drafts live in localStorage per brand; there is no draft endpoint yet.
 */

import type { Lang } from '@/components/providers/LanguageProvider'

export type ContentType = 'blog' | 'listicle' | 'howto' | 'comparison' | 'faq' | 'product' | 'landing'
export type ContentLength = 'short' | 'medium' | 'long'
export type ArticleLanguage = 'id' | 'en'
export type ToneOfVoice = 'professional' | 'friendly' | 'authoritative' | 'casual' | 'persuasive' | 'informative'

export interface ArticleConfig {
  promptId: string | null
  contentType: ContentType
  length: ContentLength
  language: ArticleLanguage
  tone: ToneOfVoice
  sources: string[]
  brief: string
  knowledgeIds: string[]
  restrictions: string
}

export interface ArticleDraft extends ArticleConfig {
  id: string
  title: string
  savedAt: string
}

export function defaultConfig(lang: Lang): ArticleConfig {
  return {
    promptId: null,
    contentType: 'blog',
    length: 'medium',
    language: lang,
    tone: 'professional',
    sources: [],
    brief: '',
    knowledgeIds: [],
    restrictions: '',
  }
}

type Labeled<T extends string> = { value: T; label: Record<Lang, string> }

export const CONTENT_TYPES: Labeled<ContentType>[] = [
  { value: 'blog', label: { id: 'Artikel blog', en: 'Blog post' } },
  { value: 'listicle', label: { id: 'Listikel', en: 'Listicle' } },
  { value: 'howto', label: { id: 'Panduan langkah', en: 'How-to guide' } },
  { value: 'comparison', label: { id: 'Perbandingan', en: 'Comparison' } },
  { value: 'faq', label: { id: 'Tanya jawab (FAQ)', en: 'FAQ' } },
  { value: 'product', label: { id: 'Halaman produk', en: 'Product page' } },
  { value: 'landing', label: { id: 'Halaman landing', en: 'Landing page' } },
]

export const CONTENT_LENGTHS: { value: ContentLength; label: Record<Lang, string>; hint: Record<Lang, string> }[] = [
  { value: 'short', label: { id: 'Pendek', en: 'Short' }, hint: { id: 'sekitar 500 kata', en: 'around 500 words' } },
  { value: 'medium', label: { id: 'Sedang', en: 'Medium' }, hint: { id: 'sekitar 900 kata', en: 'around 900 words' } },
  { value: 'long', label: { id: 'Panjang', en: 'Long' }, hint: { id: 'sekitar 1500 kata', en: 'around 1500 words' } },
]

export const ARTICLE_LANGUAGES: Labeled<ArticleLanguage>[] = [
  { value: 'id', label: { id: 'Bahasa Indonesia', en: 'Indonesian' } },
  { value: 'en', label: { id: 'Bahasa Inggris', en: 'English' } },
]

export const TONES: Labeled<ToneOfVoice>[] = [
  { value: 'professional', label: { id: 'Profesional', en: 'Professional' } },
  { value: 'friendly', label: { id: 'Ramah', en: 'Friendly' } },
  { value: 'authoritative', label: { id: 'Berwibawa', en: 'Authoritative' } },
  { value: 'casual', label: { id: 'Santai', en: 'Casual' } },
  { value: 'persuasive', label: { id: 'Persuasif', en: 'Persuasive' } },
  { value: 'informative', label: { id: 'Informatif', en: 'Informative' } },
]

export function draftsStorageKey(brandId: string): string {
  return `fratello-article-drafts-${brandId}`
}

export function loadDrafts(brandId: string): ArticleDraft[] {
  try {
    const raw = localStorage.getItem(draftsStorageKey(brandId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    return Array.isArray(parsed) ? (parsed as ArticleDraft[]) : []
  } catch {
    return []
  }
}

export function saveDrafts(brandId: string, drafts: ArticleDraft[]): void {
  try {
    localStorage.setItem(draftsStorageKey(brandId), JSON.stringify(drafts))
  } catch {
    /* ignore quota / serialization errors */
  }
}
