'use client'

import { useState } from 'react'
import type { FormEvent, KeyboardEvent, ReactElement } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useApiFetch } from '@/lib/useApiFetch'
import { fadeUp } from '@/lib/motion'
import { Card, ErrorBanner, PageContainer, PageHeader } from '@/components/dashboard/primitives'
import { Button, Chip, IconButton, Input } from '@/components/ui'
import { PlusSmallIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'

/**
 * /brands/new, "Project baru" (create brand).
 * Parity contract: feature-inventory.md §2, POST /brands
 * { name, website, industry, competitors: string[] } → redirect /brands/{_id}.
 * The legacy comma-separated competitors text field is upgraded to a chip
 * editor; comma-separated paste still works and any text left in the input on
 * submit is included (same split/trim/filter semantics as before).
 */

/** Page copy, both languages. No dashes; plain wording for first-time users. */
const COPY = {
  id: {
    title: 'Project baru',
    subtitle:
      'Setelah brand ditambahkan, siapkan prompts (pertanyaan yang kami tanyakan ke AI untuk memantau brand Anda) lalu jalankan scan pertama dari halaman brand.',
    back: 'Kembali',
    nameLabel: 'Nama brand',
    namePlaceholder: 'contoh: ArenaGo',
    nameRequired: 'Nama brand wajib diisi',
    websiteLabel: 'Website',
    websiteRequired: 'Website wajib diisi',
    websiteInvalid: 'Masukkan URL lengkap, contoh: https://example.com',
    industryLabel: 'Industri',
    industryPlaceholder: 'contoh: Aplikasi booking olahraga di Indonesia',
    industryRequired: 'Industri wajib diisi',
    industryCaption:
      'Semakin spesifik semakin baik. Kami memakainya untuk membuat prompts yang relevan.',
    competitorsLabel: 'Kompetitor',
    optional: '(opsional)',
    competitorPlaceholder: 'SportyBet, PlayToday, ... (pisahkan dengan koma)',
    addCompetitor: 'Tambah kompetitor',
    removeCompetitor: (name: string): string => `Hapus kompetitor ${name}`,
    competitorHint:
      'Tekan Enter atau tombol tambah. Anda juga bisa paste daftar yang dipisahkan koma.',
    submit: 'Buat project',
    submitting: 'Membuat…',
    cancel: 'Batal',
    requestFailed: 'Permintaan gagal',
  },
  en: {
    title: 'New project',
    subtitle:
      'After you add your brand, set up prompts (the questions we ask AI to check on your brand) and run your first scan from the brand page.',
    back: 'Back',
    nameLabel: 'Brand name',
    namePlaceholder: 'e.g. ArenaGo',
    nameRequired: 'Brand name is required',
    websiteLabel: 'Website',
    websiteRequired: 'Website is required',
    websiteInvalid: 'Enter a full URL, for example https://example.com',
    industryLabel: 'Industry',
    industryPlaceholder: 'e.g. Sports booking app in Indonesia',
    industryRequired: 'Industry is required',
    industryCaption: 'Be specific. We use this to create prompts that fit your brand.',
    competitorsLabel: 'Competitors',
    optional: '(optional)',
    competitorPlaceholder: 'SportyBet, PlayToday, ... (separate with commas)',
    addCompetitor: 'Add competitor',
    removeCompetitor: (name: string): string => `Remove competitor ${name}`,
    competitorHint: 'Press Enter or the add button. You can also paste a comma separated list.',
    submit: 'Create project',
    submitting: 'Creating…',
    cancel: 'Cancel',
    requestFailed: 'Request failed',
  },
} as const

interface FieldErrors {
  name?: string
  website?: string
  industry?: string
}

/** Mirrors the legacy native `type="url"` constraint (absolute URL required). */
function isValidUrl(value: string): boolean {
  try {
    // eslint-disable-next-line no-new
    new URL(value)
    return true
  } catch {
    return false
  }
}

/** Legacy parsing kept 1:1: split on commas, trim, drop empties. */
function splitCompetitors(raw: string): string[] {
  return raw
    .split(',')
    .map((c: string) => c.trim())
    .filter(Boolean)
}

export default function NewProjectPage(): ReactElement {
  const router = useRouter()
  const apiFetch = useApiFetch()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [name, setName] = useState<string>('')
  const [website, setWebsite] = useState<string>('')
  const [industry, setIndustry] = useState<string>('')
  const [competitors, setCompetitors] = useState<string[]>([])
  const [competitorInput, setCompetitorInput] = useState<string>('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [submitError, setSubmitError] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)

  function addCompetitors(raw: string): void {
    const parts = splitCompetitors(raw)
    if (parts.length === 0) return
    setCompetitors((prev: string[]) => {
      const next = [...prev]
      for (const part of parts) {
        // Dedupe (case-insensitive) so the chip list never shows twins; the
        // legacy free-text field had no dedupe but duplicates were never useful.
        if (!next.some((c: string) => c.toLowerCase() === part.toLowerCase())) {
          next.push(part)
        }
      }
      return next
    })
    setCompetitorInput('')
  }

  function removeCompetitor(index: number): void {
    setCompetitors((prev: string[]) => prev.filter((_: string, i: number) => i !== index))
  }

  function handleCompetitorKeyDown(e: KeyboardEvent<HTMLInputElement>): void {
    // Enter inside the chip editor adds a chip instead of submitting the form.
    if (e.key === 'Enter') {
      e.preventDefault()
      addCompetitors(competitorInput)
    }
  }

  function validate(): FieldErrors {
    const errors: FieldErrors = {}
    if (name.trim() === '') errors.name = t.nameRequired
    if (website.trim() === '') {
      errors.website = t.websiteRequired
    } else if (!isValidUrl(website.trim())) {
      errors.website = t.websiteInvalid
    }
    if (industry.trim() === '') errors.industry = t.industryRequired
    return errors
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault()
    setSubmitError('')

    // Inline validation (DS error states) replaces the legacy native
    // required/type="url" browser bubbles.
    const errors = validate()
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setLoading(true)
    try {
      // Text still sitting in the competitor input counts too (legacy
      // comma-separated behavior preserved).
      const pending = splitCompetitors(competitorInput).filter(
        (p: string) => !competitors.some((c: string) => c.toLowerCase() === p.toLowerCase()),
      )
      const brand = await apiFetch<{ _id: string }>('/brands', {
        method: 'POST',
        body: JSON.stringify({
          name: name.trim(),
          website: website.trim(),
          industry: industry.trim(),
          competitors: [...competitors, ...pending],
        }),
      })
      router.push(`/brands/${brand._id}`)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : t.requestFailed)
      setLoading(false)
    }
  }

  return (
    <PageContainer>
      <PageHeader title={t.title} subtitle={t.subtitle} />

      <motion.div variants={fadeUp}>
        <Card className="p-6">
          <form noValidate onSubmit={handleSubmit} className="flex w-full flex-col gap-5">
            <Input
              label={t.nameLabel}
              required
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value)
                if (fieldErrors.name != null) setFieldErrors((prev: FieldErrors) => ({ ...prev, name: undefined }))
              }}
              placeholder={t.namePlaceholder}
              error={fieldErrors.name != null}
              caption={fieldErrors.name}
            />

            <Input
              label={t.websiteLabel}
              required
              type="url"
              value={website}
              onChange={(e) => {
                setWebsite(e.target.value)
                if (fieldErrors.website != null) {
                  setFieldErrors((prev: FieldErrors) => ({ ...prev, website: undefined }))
                }
              }}
              placeholder="https://example.com"
              error={fieldErrors.website != null}
              caption={fieldErrors.website}
            />

            <Input
              label={t.industryLabel}
              required
              type="text"
              value={industry}
              onChange={(e) => {
                setIndustry(e.target.value)
                if (fieldErrors.industry != null) {
                  setFieldErrors((prev: FieldErrors) => ({ ...prev, industry: undefined }))
                }
              }}
              placeholder={t.industryPlaceholder}
              error={fieldErrors.industry != null}
              caption={fieldErrors.industry ?? t.industryCaption}
            />

            {/* Competitors chip editor (optional field). External label so the
                add button aligns with the field row, not the label+field column. */}
            <div className="flex w-full flex-col gap-2">
              <label
                htmlFor="competitor-input"
                className="flex w-full items-center gap-1 text-field-label font-semibold text-secondary transition-colors duration-200 ease-standard"
              >
                {t.competitorsLabel}
                <span className="text-field-label font-normal text-tertiary">{t.optional}</span>
              </label>

              <div className="flex w-full items-center gap-2">
                <Input
                  id="competitor-input"
                  type="text"
                  value={competitorInput}
                  onChange={(e) => setCompetitorInput(e.target.value)}
                  onKeyDown={handleCompetitorKeyDown}
                  placeholder={t.competitorPlaceholder}
                  className="min-w-0 flex-1"
                />
                <IconButton
                  type="primary-outlined"
                  size="sm"
                  aria-label={t.addCompetitor}
                  disabled={competitorInput.trim() === ''}
                  onClick={() => addCompetitors(competitorInput)}
                >
                  <PlusSmallIcon />
                </IconButton>
              </div>

              {competitors.length > 0 && (
                <div className="flex w-full flex-wrap items-center gap-2">
                  {competitors.map((competitor: string, index: number) => (
                    <Chip key={competitor} type="neutral" size="sm" className="gap-1 pr-1">
                      {competitor}
                      {/* Inline remove affordance inside the neutral chip (per redesign brief). */}
                      <button
                        type="button"
                        aria-label={t.removeCompetitor(competitor)}
                        onClick={() => removeCompetitor(index)}
                        className="flex size-5 shrink-0 items-center justify-center rounded-token-4 text-icon-dark-gray transition-colors duration-200 ease-standard hover:bg-btn-ghost-pressed focus-visible:bg-btn-ghost-pressed focus-visible:outline-none"
                      >
                        <PlusSmallIcon className="size-4 rotate-45" />
                      </button>
                    </Chip>
                  ))}
                </div>
              )}

              <span className="w-full text-field-caption font-normal text-secondary">
                {t.competitorHint}
              </span>
            </div>

            {submitError !== '' && <ErrorBanner message={submitError} />}

            <div className="flex items-center gap-3 pt-1">
              <Button htmlType="submit" type="primary" size="sm" disabled={loading}>
                {loading ? t.submitting : t.submit}
              </Button>
              <Button type="ghost" size="sm" onClick={() => router.push('/brands')}>
                {t.cancel}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </PageContainer>
  )
}
