'use client'

import { useState } from 'react'
import type { ReactElement, ReactNode } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { X as PhosphorX, Plus, MagnifyingGlass, CaretDown, Brain } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/cn'
import { fadeUp } from '@/lib/motion'
import { Button, IconButton, Input, TextBox, Radio, Checkbox, Toggle, Chip, Dropdown } from '@/components/ui'
import { ErrorBanner } from '@/components/dashboard/primitives'
import { useLanguage } from '@/components/providers/LanguageProvider'
import { categoryMeta } from '@/lib/categories'
import {
  ARTICLE_LANGUAGES,
  CONTENT_LENGTHS,
  CONTENT_TYPES,
  TONES,
  type ArticleConfig,
} from '@/lib/article-composer'
import { kbSourceTitle, type KBSource } from '@/lib/knowledge'

export interface ComposerPrompt {
  _id: string
  text: string
  category: string
}

interface ArticleComposerProps {
  brandId: string
  prompts: ComposerPrompt[]
  gapIds: Set<string>
  knowledge: KBSource[]
  initial: ArticleConfig
  /** True while the generate request is in flight. */
  generating: boolean
  /** Generation error to surface above the form. */
  error: string | null
  onCancel: () => void
  onSaveDraft: (config: ArticleConfig) => void
  onGenerate: (config: ArticleConfig) => void
}

const COPY = {
  id: {
    newTitle: 'Artikel baru',
    cancel: 'Batal',
    saveDraft: 'Simpan draf',
    createContent: 'Buat konten',
    generating: 'Sedang dibuat...',
    advanced: 'Opsi lanjutan',
    sourceTypeFile: 'Berkas',
    sourceTypeUrl: 'Tautan',
    sourceTypeText: 'Teks',
    promptTitle: 'Prompt',
    promptSearch: 'Cari prompt...',
    gapsOnly: 'Hanya tampilkan gap',
    gapChip: 'gap',
    noPrompts: 'Belum ada prompt. Buka halaman Prompts untuk menambahkannya terlebih dahulu.',
    noPromptMatch: 'Tidak ada prompt yang cocok.',
    typeTitle: 'Tipe konten',
    lengthTitle: 'Panjang konten',
    languageTitle: 'Bahasa',
    toneTitle: 'Gaya bahasa',
    sourcesTitle: 'Sumber',
    sourcesPlaceholder: 'https://contoh.com/referensi',
    add: 'Tambah',
    removeSourceAria: 'Hapus sumber',
    briefTitle: 'Ringkasan konten',
    briefPlaceholder: 'Misal: tekankan keunggulan harga, sertakan ajakan mencoba gratis...',
    knowledgeTitle: 'Basis pengetahuan',
    knowledgeEmpty: 'Belum ada sumber. Tambahkan di halaman Basis Pengetahuan.',
    manageKnowledge: 'Kelola Basis Pengetahuan',
    restrictionsTitle: 'Pembatasan',
    restrictionsPlaceholder: 'Misal: jangan menyebut nama kompetitor, hindari klaim berlebihan...',
  },
  en: {
    newTitle: 'New article',
    cancel: 'Cancel',
    saveDraft: 'Save draft',
    createContent: 'Create content',
    generating: 'Generating...',
    advanced: 'Advanced options',
    sourceTypeFile: 'File',
    sourceTypeUrl: 'URL',
    sourceTypeText: 'Text',
    promptTitle: 'Prompt',
    promptSearch: 'Search prompts...',
    gapsOnly: 'Gaps only',
    gapChip: 'gap',
    noPrompts: 'No prompts yet. Go to the Prompts page to add some first.',
    noPromptMatch: 'No prompts match.',
    typeTitle: 'Content type',
    lengthTitle: 'Content length',
    languageTitle: 'Language',
    toneTitle: 'Tone of voice',
    sourcesTitle: 'Sources',
    sourcesPlaceholder: 'https://example.com/reference',
    add: 'Add',
    removeSourceAria: 'Remove source',
    briefTitle: 'Content brief',
    briefPlaceholder: 'e.g. emphasise the pricing advantage, include a free-trial call to action...',
    knowledgeTitle: 'Knowledge base',
    knowledgeEmpty: 'No sources yet. Add them on the Knowledge Base page.',
    manageKnowledge: 'Manage Knowledge Base',
    restrictionsTitle: 'Restrictions',
    restrictionsPlaceholder: 'e.g. do not name competitors, avoid exaggerated claims...',
  },
} as const

/** Field wrapper: a field-label above the control, matching the Dropdown label. */
function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: ReactNode
}): ReactElement {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-field-label font-semibold text-secondary">
        {label}
        {required && (
          <span aria-hidden="true" className="text-error-token">
            {' '}
            *
          </span>
        )}
      </span>
      {children}
    </div>
  )
}

export function ArticleComposer({
  brandId,
  prompts,
  gapIds,
  knowledge,
  initial,
  generating,
  error,
  onCancel,
  onSaveDraft,
  onGenerate,
}: ArticleComposerProps): ReactElement {
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [config, setConfig] = useState<ArticleConfig>(initial)
  const [promptSearch, setPromptSearch] = useState<string>('')
  const [showGapsOnly, setShowGapsOnly] = useState<boolean>(false)
  const [sourceDraft, setSourceDraft] = useState<string>('')
  // Open advanced automatically when a resumed draft already has values there.
  const [advancedOpen, setAdvancedOpen] = useState<boolean>(
    initial.sources.length > 0 ||
      initial.brief.trim() !== '' ||
      initial.restrictions.trim() !== '' ||
      initial.knowledgeIds.length > 0,
  )

  function update<K extends keyof ArticleConfig>(key: K, value: ArticleConfig[K]): void {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  function addSource(): void {
    const v = sourceDraft.trim()
    if (v === '') return
    if (!config.sources.includes(v)) update('sources', [...config.sources, v])
    setSourceDraft('')
  }

  function toggleKnowledge(kid: string): void {
    update(
      'knowledgeIds',
      config.knowledgeIds.includes(kid)
        ? config.knowledgeIds.filter((x) => x !== kid)
        : [...config.knowledgeIds, kid],
    )
  }

  const filteredPrompts = prompts.filter((p) => {
    if (showGapsOnly && !gapIds.has(p._id)) return false
    const q = promptSearch.trim().toLowerCase()
    return q === '' || p.text.toLowerCase().includes(q)
  })

  const canGenerate = config.promptId != null
  const hasContent =
    config.promptId != null ||
    config.brief.trim() !== '' ||
    config.sources.length > 0 ||
    config.restrictions.trim() !== '' ||
    config.knowledgeIds.length > 0

  const typeOptions = CONTENT_TYPES.map((o) => ({ value: o.value, label: o.label[lang] }))
  const lengthOptions = CONTENT_LENGTHS.map((o) => ({ value: o.value, label: `${o.label[lang]} · ${o.hint[lang]}` }))
  const languageOptions = ARTICLE_LANGUAGES.map((o) => ({ value: o.value, label: o.label[lang] }))
  const toneOptions = TONES.map((o) => ({ value: o.value, label: o.label[lang] }))

  const sourceTypeLabel: Record<KBSource['type'], string> = {
    file: t.sourceTypeFile,
    url: t.sourceTypeUrl,
    text: t.sourceTypeText,
  }

  return (
    <motion.div variants={fadeUp} className="mx-auto w-full max-w-4xl">
      {/* Action bar */}
      <div className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-neutral-primary bg-primary py-4">
        <div className="flex min-w-0 items-center gap-3">
          <IconButton type="ghost" size="sm" aria-label={t.cancel} onClick={onCancel}>
            <PhosphorX aria-hidden="true" />
          </IconButton>
          <h2 className="truncate text-h5 font-medium text-primary">{t.newTitle}</h2>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="primary-outlined"
            size="md"
            disabled={generating || !hasContent}
            onClick={() => onSaveDraft(config)}
          >
            {t.saveDraft}
          </Button>
          <Button type="primary" size="md" disabled={generating || !canGenerate} onClick={() => onGenerate(config)}>
            {generating ? t.generating : t.createContent}
          </Button>
        </div>
      </div>

      {error != null && (
        <div className="pt-4">
          <ErrorBanner message={error} />
        </div>
      )}

      <div className="flex flex-col gap-8 pt-8">
        {/* Prompt */}
        <Field label={t.promptTitle} required>
          {prompts.length === 0 ? (
            <p className="text-paragraph-medium text-secondary">{t.noPrompts}</p>
          ) : (
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-[220px] flex-1">
                  <Input
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                    placeholder={t.promptSearch}
                    iconLeft={<MagnifyingGlass className="size-5" aria-hidden="true" />}
                    aria-label={t.promptSearch}
                  />
                </div>
                {gapIds.size > 0 && (
                  <label className="flex items-center gap-2">
                    <Toggle checked={showGapsOnly} onChange={setShowGapsOnly} aria-label={t.gapsOnly} />
                    <span className="text-label-medium font-medium text-secondary">{t.gapsOnly}</span>
                  </label>
                )}
              </div>
              {filteredPrompts.length === 0 ? (
                <p className="text-paragraph-medium text-tertiary">{t.noPromptMatch}</p>
              ) : (
                <div className="divide-y divide-neutral-primary overflow-hidden rounded-token-12 border border-neutral-primary">
                  {filteredPrompts.map((p) => {
                    const isGap = gapIds.has(p._id)
                    const selected = config.promptId === p._id
                    const meta = categoryMeta(p.category)
                    const CatIcon = meta.icon
                    return (
                      <label
                        key={p._id}
                        className={cn(
                          'flex cursor-pointer items-start gap-3 px-4 py-3 transition-colors duration-200 ease-standard',
                          selected ? 'bg-display-brand' : 'hover:bg-secondary',
                        )}
                      >
                        <Radio
                          checked={selected}
                          onChange={() => update('promptId', p._id)}
                          name="composer-prompt"
                          value={p._id}
                          aria-label={p.text}
                        />
                        <span
                          className={cn(
                            'line-clamp-2 min-w-0 flex-1 text-paragraph-medium',
                            selected ? 'font-medium text-brand-token' : 'text-primary',
                          )}
                        >
                          {p.text}
                        </span>
                        <div className="flex shrink-0 items-center gap-2">
                          <Chip
                            size="sm"
                            shape="rounded"
                            type="neutral"
                            iconLeft={<CatIcon aria-hidden="true" />}
                            className={selected ? '!bg-neutral-0' : undefined}
                          >
                            {meta.label[lang]}
                          </Chip>
                          {isGap && (
                            <Chip size="sm" shape="rounded" type="error">
                              {t.gapChip}
                            </Chip>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </Field>

        {/* Quick options */}
        <div className="grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-2">
          <Dropdown
            label={t.typeTitle}
            required
            value={config.contentType}
            options={typeOptions}
            onChange={(v) => update('contentType', v as ArticleConfig['contentType'])}
          />
          <Dropdown
            label={t.lengthTitle}
            value={config.length}
            options={lengthOptions}
            onChange={(v) => update('length', v as ArticleConfig['length'])}
          />
          <Dropdown
            label={t.languageTitle}
            value={config.language}
            options={languageOptions}
            onChange={(v) => update('language', v as ArticleConfig['language'])}
          />
          <Dropdown
            label={t.toneTitle}
            value={config.tone}
            options={toneOptions}
            onChange={(v) => update('tone', v as ArticleConfig['tone'])}
          />
        </div>

        {/* Advanced (collapsible) */}
        <div className="flex flex-col gap-6 border-t border-neutral-primary pt-6">
          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            aria-expanded={advancedOpen}
            className="flex w-fit items-center gap-2 text-action-small font-medium text-secondary transition-colors duration-200 ease-standard hover:text-primary"
          >
            <CaretDown
              className={cn('size-4 transition-transform duration-200 ease-standard', advancedOpen && 'rotate-180')}
              aria-hidden="true"
            />
            {t.advanced}
          </button>

          {advancedOpen && (
            <motion.div variants={fadeUp} initial="hidden" animate="visible" className="flex flex-col gap-8">
              {/* Sources */}
              <Field label={t.sourcesTitle}>
                <div className="flex flex-col gap-3">
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <Input
                        type="url"
                        value={sourceDraft}
                        onChange={(e) => setSourceDraft(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault()
                            addSource()
                          }
                        }}
                        placeholder={t.sourcesPlaceholder}
                        aria-label={t.sourcesTitle}
                      />
                    </div>
                    <Button
                      type="primary-outlined"
                      size="md"
                      onClick={addSource}
                      disabled={sourceDraft.trim() === ''}
                      iconLeft={<Plus className="size-5" aria-hidden="true" />}
                    >
                      {t.add}
                    </Button>
                  </div>
                  {config.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {config.sources.map((s) => (
                        <span
                          key={s}
                          className="inline-flex max-w-full items-center gap-1.5 rounded-circle border border-neutral-primary bg-secondary px-3 py-1"
                        >
                          <span className="truncate text-label-medium text-primary">{s}</span>
                          <button
                            type="button"
                            onClick={() => update('sources', config.sources.filter((x) => x !== s))}
                            aria-label={t.removeSourceAria}
                            className="shrink-0 text-icon-dark-gray transition-colors duration-200 ease-standard hover:text-primary"
                          >
                            <PhosphorX className="size-4" aria-hidden="true" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Field>

              {/* Brief */}
              <TextBox
                label={t.briefTitle}
                className="!w-full"
                height={120}
                value={config.brief}
                onChange={(e) => update('brief', e.target.value)}
                placeholder={t.briefPlaceholder}
              />

              {/* Knowledge base */}
              <Field label={t.knowledgeTitle}>
                {knowledge.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 rounded-token-12 border border-dashed border-neutral-primary px-6 py-8 text-center">
                    <span className="flex size-10 items-center justify-center rounded-circle bg-display-brand text-icon-brand">
                      <Brain className="size-5" aria-hidden="true" />
                    </span>
                    <p className="max-w-sm text-paragraph-medium text-secondary">{t.knowledgeEmpty}</p>
                    <Link
                      href={`/brands/${brandId}/knowledge`}
                      className="inline-flex items-center gap-2 rounded-token-8 border border-brand-token px-4 py-2 text-action-small font-medium text-brand-token transition-colors duration-200 ease-standard hover:bg-display-brand"
                    >
                      <Plus className="size-4" aria-hidden="true" />
                      {t.manageKnowledge}
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {knowledge.map((k) => {
                      const checked = config.knowledgeIds.includes(k.id)
                      return (
                        <label
                          key={k.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-token-8 border bg-primary px-3 py-2.5 transition-colors duration-200 ease-standard',
                            checked ? 'border-brand-token bg-display-brand' : 'border-neutral-primary hover:border-neutral-secondary',
                          )}
                        >
                          <Checkbox checked={checked} onChange={() => toggleKnowledge(k.id)} aria-label={kbSourceTitle(k)} />
                          <span className="line-clamp-1 min-w-0 flex-1 text-paragraph-medium font-medium text-primary">
                            {kbSourceTitle(k)}
                          </span>
                          <Chip size="sm" shape="rounded" type="neutral">
                            {sourceTypeLabel[k.type]}
                          </Chip>
                        </label>
                      )
                    })}
                  </div>
                )}
              </Field>

              {/* Restrictions */}
              <TextBox
                label={t.restrictionsTitle}
                className="!w-full"
                height={100}
                value={config.restrictions}
                onChange={(e) => update('restrictions', e.target.value)}
                placeholder={t.restrictionsPlaceholder}
              />
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
