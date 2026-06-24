'use client'

/**
 * To-Do (sidebar: Recommendations > To-Do).
 *
 * The legacy "Content Distribution" page reframed as an actionable list:
 * log where you publish content, then track each publication's before/after
 * impact on mention rate. BrandNav is removed, the new dashboard sidebar
 * owns navigation. Feature parity with inventory §8 (/brands/[id]/distribution):
 * same endpoints, payloads, fields, summary stats, impact logic and footnote.
 */

import { useEffect, useState } from 'react'
import type { FormEvent, ReactElement } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Trash as PhosphorTrash, Plus } from '@phosphor-icons/react/dist/ssr'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp } from '@/lib/motion'
import {
  Card,
  EmptyState,
  ErrorBanner,
  PageContainer,
  PageHeader,
  Section,
  Skeleton,
  StatCard,
} from '@/components/dashboard/primitives'
import { Button, Chip, IconButton, Input } from '@/components/ui'
import type { ChipType } from '@/components/ui'
import { PublicationsIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'

type PlatformType = 'reddit' | 'medium' | 'forum' | 'blog' | 'directory' | 'other'

interface Publication {
  _id: string
  title: string
  platform: string
  platformType: PlatformType
  url: string
  publishedAt: string
  mentionRateAtPublish?: number
  rateBefore: number | null
  rateAfter: number | null
  delta: number | null
}

interface PublicationForm {
  title: string
  platform: string
  platformType: PlatformType
  url: string
  publishedAt: string
}

const PLATFORM_TYPES: PlatformType[] = ['reddit', 'medium', 'forum', 'blog', 'directory', 'other']

// Legacy platform-type pill palette (reddit orange / medium green / forum
// purple / blog blue / directory yellow / other gray) mapped to the nearest
// DS chip semantics. The DS ships neutral/success/error/warning only.
const PLATFORM_CHIP: Record<PlatformType, ChipType> = {
  reddit: 'warning',
  medium: 'success',
  forum: 'neutral',
  blog: 'neutral',
  directory: 'warning',
  other: 'neutral',
}

function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

const EMPTY_FORM: PublicationForm = {
  title: '',
  platform: '',
  platformType: 'other',
  url: '',
  publishedAt: todayISO(),
}

/**
 * Page copy, both languages. No dashes; plain wording for first-time users.
 * platformType API values stay untranslated; only their display labels are bilingual.
 */
const COPY = {
  id: {
    title: 'Publikasi',
    subtitle:
      'Catat di mana Anda publish konten, lalu lihat apakah AI menyebut brand Anda lebih sering setelahnya.',
    addPublication: 'Tambah Publikasi',
    newPublication: 'Publikasi Baru',
    articleTitle: 'Judul Artikel',
    articleTitlePlaceholder: 'contoh: Lapangan Padel Terbaik di Jakarta',
    platformName: 'Nama Platform',
    platformNamePlaceholder: 'contoh: r/indonesia, Medium, Kompasiana',
    platformType: 'Tipe Platform',
    platformTypeLabels: {
      reddit: 'Reddit',
      medium: 'Medium',
      forum: 'Forum',
      blog: 'Blog',
      directory: 'Direktori',
      other: 'Lainnya',
    },
    publishedDate: 'Tanggal Publish',
    urlLabel: 'URL',
    saving: 'Menyimpan...',
    savePublication: 'Simpan Publikasi',
    cancel: 'Batal',
    statTotal: 'Total Publikasi',
    statWithImpact: 'Dengan Data Dampak',
    statAvgChange: 'Rata-rata Perubahan Mention Rate',
    publicationsSection: 'Publikasi',
    retry: 'Coba lagi',
    emptyTitle: 'Belum ada publikasi',
    emptyDesc:
      'Catat di mana Anda publish konten agar terlihat apakah AI menyebut brand Anda lebih sering setelahnya',
    publishedOn: (date: string): string => `Dipublish ${date}`,
    noDataChip: 'Belum ada data',
    confirmDelete: 'Ya, hapus',
    deleting: 'Menghapus...',
    deleteAria: (title: string): string => `Hapus publikasi: ${title}`,
    footnote:
      'Dampak membandingkan mention rate Anda pada 7 hari sebelum dan 7 hari sesudah tanggal publish. Mention rate adalah seberapa sering jawaban AI menyebut brand Anda.',
    loadFailed: 'Gagal memuat publikasi',
    saveFailed: 'Gagal menyimpan',
    deleteFailed: 'Gagal menghapus publikasi',
  },
  en: {
    title: 'Publications',
    subtitle: 'Log where you publish your content, then see if AI mentions your brand more afterwards.',
    addPublication: 'Add Publication',
    newPublication: 'New Publication',
    articleTitle: 'Article Title',
    articleTitlePlaceholder: 'e.g. Best Padel Courts in Jakarta',
    platformName: 'Platform Name',
    platformNamePlaceholder: 'e.g. r/indonesia, Medium, Kompasiana',
    platformType: 'Platform Type',
    platformTypeLabels: {
      reddit: 'Reddit',
      medium: 'Medium',
      forum: 'Forum',
      blog: 'Blog',
      directory: 'Directory',
      other: 'Other',
    },
    publishedDate: 'Published Date',
    urlLabel: 'URL',
    saving: 'Saving...',
    savePublication: 'Save Publication',
    cancel: 'Cancel',
    statTotal: 'Total Publications',
    statWithImpact: 'With Impact Data',
    statAvgChange: 'Avg Mention Rate Change',
    publicationsSection: 'Publications',
    retry: 'Retry',
    emptyTitle: 'No publications yet',
    emptyDesc: 'Log where you publish content so you can see if AI mentions your brand more afterwards',
    publishedOn: (date: string): string => `Published ${date}`,
    noDataChip: 'No data',
    confirmDelete: 'Confirm delete',
    deleting: 'Deleting...',
    deleteAria: (title: string): string => `Delete publication: ${title}`,
    footnote:
      'Impact compares your mention rate in the 7 days before and the 7 days after the publish date. Mention rate is how often AI answers mention your brand.',
    loadFailed: 'Failed to load publications',
    saveFailed: 'Failed to save',
    deleteFailed: 'Failed to delete publication',
  },
} as const

/** Trash glyph, drawn in the nav-icons geometry language (20px viewBox, 1.5px round-cap strokes, currentColor). */
function TrashIcon({ className }: { className?: string }): ReactElement {
  return <PhosphorTrash className={className} aria-hidden="true" />
}

export default function TodoPage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [publications, setPublications] = useState<Publication[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  /** Load errors were silently swallowed in the legacy page; surfaced via ErrorBanner per redesign rules. */
  const [loadError, setLoadError] = useState<string>('')
  const [showForm, setShowForm] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  /** Save errors via inline ErrorBanner; replaces the legacy `alert(err.message)`. */
  const [formError, setFormError] = useState<string>('')
  const [form, setForm] = useState<PublicationForm>(EMPTY_FORM)
  /** Two-step inline delete confirm; replaces the legacy `window.confirm('Delete this publication?')`. */
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState<string>('')

  useEffect(() => {
    void loadPublications()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  async function loadPublications(): Promise<void> {
    setLoading(true)
    setLoadError('')
    try {
      const data = await apiFetch<Publication[]>(`/brands/${id}/publications/impact`)
      setPublications(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : t.loadFailed)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setSubmitting(true)
    setFormError('')
    try {
      // Same payload as legacy: { title, platform, platformType, url, publishedAt }
      await apiFetch(`/brands/${id}/publications`, {
        method: 'POST',
        body: JSON.stringify(form),
      })
      setForm({ ...EMPTY_FORM, publishedAt: todayISO() })
      setShowForm(false)
      await loadPublications()
    } catch (err) {
      // Inline ErrorBanner replaces the legacy alert(err.message || 'Failed to save').
      setFormError(err instanceof Error ? err.message : t.saveFailed)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(pubId: string): Promise<void> {
    setDeletingId(pubId)
    setDeleteError('')
    try {
      await apiFetch(`/brands/${id}/publications/${pubId}`, { method: 'DELETE' })
      setPublications((prev) => prev.filter((p) => p._id !== pubId))
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : t.deleteFailed)
    } finally {
      setDeletingId(null)
      setConfirmingId(null)
    }
  }

  const withImpact: Publication[] = publications.filter((p) => p.delta !== null)
  const avgDelta: number | null =
    withImpact.length > 0
      ? Math.round(withImpact.reduce((sum, p) => sum + (p.delta ?? 0), 0) / withImpact.length)
      : null

  return (
    <PageContainer wide>
      <PageHeader
        icon={<PublicationsIcon className="h-[30px] w-[30px] text-icon-brand" />}
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <Button iconLeft={<Plus className="size-5" aria-hidden="true" />} onClick={() => setShowForm((prev) => !prev)}>
            {t.addPublication}
          </Button>
        }
      />

      {/* Add-publication form */}
      {showForm && (
        <motion.div variants={fadeUp} initial="hidden" animate="visible">
          <Card className="flex flex-col gap-4 p-6">
            <h2 className="text-label-big font-medium text-primary">{t.newPublication}</h2>
            {formError !== '' && <ErrorBanner message={formError} />}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Input
                  label={t.articleTitle}
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder={t.articleTitlePlaceholder}
                />
                <Input
                  label={t.platformName}
                  required
                  value={form.platform}
                  onChange={(e) => setForm({ ...form, platform: e.target.value })}
                  placeholder={t.platformNamePlaceholder}
                />
                {/* Native select reusing the Input field anatomy/tokens. The DS
                    has no Select component and the inventory requires a 6-option
                    platform-type select. */}
                <div className="flex w-full flex-col gap-2">
                  <label
                    htmlFor="platform-type"
                    className="flex w-full items-center gap-1 text-field-label font-semibold text-secondary"
                  >
                    {t.platformType}
                  </label>
                  <select
                    id="platform-type"
                    value={form.platformType}
                    onChange={(e) => setForm({ ...form, platformType: e.target.value as PlatformType })}
                    className="w-full rounded-token-8 border border-neutral-primary bg-primary px-3 py-2 text-field-input font-normal text-primary outline-none transition-colors duration-200 ease-standard focus:border-brand-token"
                  >
                    {PLATFORM_TYPES.map((ptype) => (
                      <option key={ptype} value={ptype}>
                        {t.platformTypeLabels[ptype]}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label={t.publishedDate}
                  required
                  type="date"
                  value={form.publishedAt}
                  onChange={(e) => setForm({ ...form, publishedAt: e.target.value })}
                />
                <Input
                  label={t.urlLabel}
                  required
                  type="url"
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  placeholder="https://..."
                  className="sm:col-span-2"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button htmlType="submit" disabled={submitting}>
                  {submitting ? t.saving : t.savePublication}
                </Button>
                <Button type="ghost" onClick={() => setShowForm(false)}>
                  {t.cancel}
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Summary stats (only when publications exist) */}
      {!loading && publications.length > 0 && (
        <motion.div variants={fadeUp} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard label={t.statTotal} value={publications.length} />
          <StatCard label={t.statWithImpact} value={withImpact.length} />
          <StatCard
            label={t.statAvgChange}
            value={
              avgDelta === null ? (
                <span className="text-tertiary">-</span>
              ) : (
                <span
                  className={
                    avgDelta > 0
                      ? 'text-brand-token'
                      : avgDelta < 0
                        ? 'text-error-token'
                        : 'text-secondary'
                  }
                >
                  {avgDelta > 0 ? '+' : ''}
                  {avgDelta}%
                </span>
              )
            }
          />
        </motion.div>
      )}

      <Section title={t.publicationsSection}>
        {deleteError !== '' && <ErrorBanner message={deleteError} />}

        {loading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : loadError !== '' ? (
          <div className="flex flex-col items-start gap-3">
            <ErrorBanner message={loadError} />
            <Button type="primary-outlined" onClick={() => void loadPublications()}>
              {t.retry}
            </Button>
          </div>
        ) : publications.length === 0 ? (
          <EmptyState
            icon={<PublicationsIcon />}
            title={t.emptyTitle}
            description={t.emptyDesc}
            action={
              <Button iconLeft={<Plus className="size-5" aria-hidden="true" />} onClick={() => setShowForm(true)}>
                {t.addPublication}
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-2">
            {publications.map((pub) => {
              const isConfirming: boolean = confirmingId === pub._id
              const isDeleting: boolean = deletingId === pub._id
              return (
                <Card
                  key={pub._id}
                  className="flex flex-wrap items-center gap-x-6 gap-y-3 p-4"
                >
                  {/* Title + platform + published date */}
                  <div className="flex min-w-0 flex-1 basis-64 flex-col gap-2">
                    <a
                      href={pub.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-fit max-w-full truncate text-paragraph-medium font-medium text-primary underline-offset-2 transition-colors duration-200 ease-standard hover:underline"
                    >
                      {pub.title}
                    </a>
                    <div className="flex flex-wrap items-center gap-2">
                      <Chip size="sm" type={PLATFORM_CHIP[pub.platformType]}>
                        {pub.platform}
                      </Chip>
                      <Chip size="sm" type="neutral" outlined>
                        {t.platformTypeLabels[pub.platformType]}
                      </Chip>
                      <span className="text-label-medium text-tertiary">
                        {t.publishedOn(new Date(pub.publishedAt).toLocaleDateString())}
                      </span>
                    </div>
                  </div>

                  {/* Impact: before % -> after % + delta chip */}
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-label-medium text-secondary">
                      {pub.rateBefore !== null ? `${pub.rateBefore}%` : '-'}
                      {' → '}
                      {pub.rateAfter !== null ? `${pub.rateAfter}%` : '-'}
                    </span>
                    {pub.delta === null ? (
                      <Chip size="sm" type="neutral">
                        {t.noDataChip}
                      </Chip>
                    ) : (
                      <Chip
                        size="sm"
                        type={pub.delta > 0 ? 'success' : pub.delta < 0 ? 'error' : 'neutral'}
                      >
                        {pub.delta > 0 ? '+' : ''}
                        {pub.delta}%
                      </Chip>
                    )}
                  </div>

                  {/* Delete: two-step INLINE confirm (replaces window.confirm).
                      First click shows ghost Confirm/Cancel buttons in the row. */}
                  <div className="flex shrink-0 items-center gap-1">
                    {isConfirming ? (
                      <>
                        <Button
                          type="ghost"
                          disabled={isDeleting}
                          onClick={() => void handleDelete(pub._id)}
                        >
                          {/* span carries the error color so it deterministically
                              overrides the ghost variant's inherited text-primary */}
                          <span className="text-error-token">
                            {isDeleting ? t.deleting : t.confirmDelete}
                          </span>
                        </Button>
                        <Button
                          type="ghost"
                          disabled={isDeleting}
                          onClick={() => setConfirmingId(null)}
                        >
                          {t.cancel}
                        </Button>
                      </>
                    ) : (
                      <IconButton
                        type="ghost"
                        aria-label={t.deleteAria(pub.title)}
                        onClick={() => {
                          setDeleteError('')
                          setConfirmingId(pub._id)
                        }}
                      >
                        <TrashIcon className="text-icon-error" />
                      </IconButton>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        )}

      </Section>
    </PageContainer>
  )
}
