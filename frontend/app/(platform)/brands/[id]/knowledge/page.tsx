'use client'

import { useEffect, useRef, useState, type ReactElement } from 'react'
import { useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  Plus,
  Trash,
  LinkSimple,
  Info,
  FileArrowUp,
  FileText,
  TextT,
} from '@phosphor-icons/react/dist/ssr'
import { fadeUp } from '@/lib/motion'
import { PageContainer, PageHeader, Card, EmptyState } from '@/components/dashboard/primitives'
import { Button, Input, TextBox, IconButton, Chip } from '@/components/ui'
import { KnowledgeIcon } from '@/components/dashboard/nav-icons'
import { useLanguage } from '@/components/providers/LanguageProvider'
import {
  loadKBSources,
  saveKBSources,
  kbSourceTitle,
  type KBSource,
  type KBSourceType,
} from '@/lib/knowledge'

const COPY = {
  id: {
    title: 'Basis Pengetahuan',
    subtitle: 'Simpan sumber yang menjadi acuan fakta dan gaya untuk artikel AI brand Anda.',
    localNote:
      'Sumber saat ini tersimpan di perangkat ini saja. Penyimpanan permanen, unggah berkas, dan penggunaannya saat membuat artikel masih membutuhkan backend.',
    addButton: 'Tambah sumber',
    formTitle: 'Tambah sumber',
    typeLabel: 'Tipe sumber',
    typeFile: 'Berkas',
    typeUrl: 'Tautan',
    typeText: 'Teks',
    nameLabel: 'Nama',
    namePlaceholder: 'Misal: Fakta brand, Gaya bahasa, Katalog produk...',
    urlLabel: 'URL',
    urlPlaceholder: 'https://contoh.com/halaman',
    textLabel: 'Teks',
    textPlaceholder: 'Tempel catatan, aturan gaya, atau fakta penting yang harus diikuti...',
    fileLabel: 'Berkas',
    chooseFile: 'Pilih berkas',
    noFile: 'Belum ada berkas dipilih',
    fileHint: 'PDF, dokumen, spreadsheet, atau gambar. Berkas diunggah setelah backend siap.',
    add: 'Tambah',
    cancel: 'Batal',
    deleteAria: 'Hapus sumber',
    emptyTitle: 'Belum ada sumber',
    emptyDesc: 'Tambahkan berkas, tautan, atau teks agar artikel AI mengikuti fakta dan gaya brand Anda.',
    statusSaved: 'Tersimpan',
    openLink: 'Buka tautan',
  },
  en: {
    title: 'Knowledge Base',
    subtitle: 'Store the sources that ground the facts and voice of your AI articles.',
    localNote:
      'Sources are currently saved on this device only. Permanent storage, file uploads, and using them when generating articles still need the backend.',
    addButton: 'Add source',
    formTitle: 'Add a source',
    typeLabel: 'Source type',
    typeFile: 'File',
    typeUrl: 'URL',
    typeText: 'Text',
    nameLabel: 'Name',
    namePlaceholder: 'e.g. Brand facts, Tone of voice, Product catalogue...',
    urlLabel: 'URL',
    urlPlaceholder: 'https://example.com/page',
    textLabel: 'Text',
    textPlaceholder: 'Paste notes, style rules, or key facts the AI should follow...',
    fileLabel: 'File',
    chooseFile: 'Choose file',
    noFile: 'No file chosen yet',
    fileHint: 'PDF, document, spreadsheet, or image. Files upload once the backend is ready.',
    add: 'Add',
    cancel: 'Cancel',
    deleteAria: 'Delete source',
    emptyTitle: 'No sources yet',
    emptyDesc: 'Add a file, link, or text so AI articles follow your brand facts and voice.',
    statusSaved: 'Saved',
    openLink: 'Open link',
  },
} as const

function formatBytes(bytes: number): string {
  if (bytes <= 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)))
  return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

const TYPE_ICON: Record<KBSourceType, typeof FileText> = {
  file: FileText,
  url: LinkSimple,
  text: TextT,
}

export default function KnowledgeBasePage(): ReactElement {
  const { id } = useParams<{ id: string }>()
  const { lang } = useLanguage()
  const t = COPY[lang]

  const [sources, setSources] = useState<KBSource[]>([])
  const [loaded, setLoaded] = useState<boolean>(false)
  const [formOpen, setFormOpen] = useState<boolean>(false)

  const [sourceType, setSourceType] = useState<KBSourceType>('file')
  const [fName, setFName] = useState<string>('')
  const [fText, setFText] = useState<string>('')
  const [fUrl, setFUrl] = useState<string>('')
  const [fileMeta, setFileMeta] = useState<{ name: string; size: number; type: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const typeLabel: Record<KBSourceType, string> = {
    file: t.typeFile,
    url: t.typeUrl,
    text: t.typeText,
  }

  useEffect(() => {
    setSources(loadKBSources(id))
    setLoaded(true)
  }, [id])

  function resetForm(): void {
    setFName('')
    setFText('')
    setFUrl('')
    setFileMeta(null)
    setSourceType('file')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function persist(next: KBSource[]): void {
    setSources(next)
    saveKBSources(id, next)
  }

  const canAdd =
    sourceType === 'text'
      ? fText.trim() !== '' || fName.trim() !== ''
      : sourceType === 'url'
        ? fUrl.trim() !== ''
        : fileMeta != null

  function addSource(): void {
    if (!canAdd) return
    const base: KBSource = {
      id: crypto.randomUUID(),
      type: sourceType,
      name: fName.trim(),
      text: '',
      url: '',
      fileName: '',
      fileSize: 0,
      fileType: '',
      createdAt: new Date().toISOString(),
    }
    if (sourceType === 'text') {
      base.text = fText.trim()
      if (base.name === '') base.name = fText.trim().slice(0, 40)
    } else if (sourceType === 'url') {
      base.url = fUrl.trim()
      if (base.name === '') base.name = fUrl.trim()
    } else if (fileMeta != null) {
      base.fileName = fileMeta.name
      base.fileSize = fileMeta.size
      base.fileType = fileMeta.type
      if (base.name === '') base.name = fileMeta.name
    }
    persist([base, ...sources])
    resetForm()
    setFormOpen(false)
  }

  function removeSource(sid: string): void {
    persist(sources.filter((s) => s.id !== sid))
  }

  function onFilePick(e: React.ChangeEvent<HTMLInputElement>): void {
    const file = e.target.files?.[0]
    if (file) setFileMeta({ name: file.name, size: file.size, type: file.type })
    // Clear the native value so re-picking the same file still fires onChange.
    e.target.value = ''
  }

  return (
    <PageContainer wide>
      <PageHeader
        title={t.title}
        subtitle={t.subtitle}
        actions={
          <Button
            type="primary"
            iconLeft={<Plus className="size-5" aria-hidden="true" />}
            onClick={() => setFormOpen((v) => !v)}
          >
            {t.addButton}
          </Button>
        }
      />

      {/* Local-only note (backend still required for the full feature) */}
      <motion.div variants={fadeUp} className="w-full">
        <div className="flex w-full items-start gap-2 rounded-token-12 border border-neutral-primary bg-secondary px-4 py-3 transition-colors duration-200 ease-standard">
          <Info className="size-5 shrink-0 text-icon-dark-gray" aria-hidden="true" />
          <p className="text-paragraph-medium text-secondary">{t.localNote}</p>
        </div>
      </motion.div>

      {/* Add form */}
      {formOpen && (
        <motion.div variants={fadeUp} className="w-full">
          <Card className="flex flex-col gap-4 p-5">
            <h2 className="text-label-big font-medium text-primary">{t.formTitle}</h2>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Source type dropdown */}
              <label className="flex w-full flex-col gap-2">
                <span className="text-field-label font-semibold text-secondary">{t.typeLabel}</span>
                <select
                  value={sourceType}
                  onChange={(e) => setSourceType(e.target.value as KBSourceType)}
                  className="w-full rounded-token-8 border border-neutral-primary bg-primary px-3 py-2 text-field-input font-normal text-primary outline-none transition-colors duration-200 ease-standard focus:border-brand-token"
                >
                  <option value="file">{t.typeFile}</option>
                  <option value="url">{t.typeUrl}</option>
                  <option value="text">{t.typeText}</option>
                </select>
              </label>

              <Input
                label={t.nameLabel}
                value={fName}
                onChange={(e) => setFName(e.target.value)}
                placeholder={t.namePlaceholder}
              />
            </div>

            {/* Type-specific input */}
            {sourceType === 'file' && (
              <div className="flex w-full flex-col gap-2">
                <span className="text-field-label font-semibold text-secondary">{t.fileLabel}</span>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    type="primary-outlined"
                    size="md"
                    iconLeft={<FileArrowUp className="size-5" aria-hidden="true" />}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {t.chooseFile}
                  </Button>
                  <span className="min-w-0 truncate text-paragraph-medium text-secondary">
                    {fileMeta ? `${fileMeta.name}${fileMeta.size > 0 ? ` (${formatBytes(fileMeta.size)})` : ''}` : t.noFile}
                  </span>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={onFilePick} />
                </div>
                <p className="text-paragraph-medium text-tertiary">{t.fileHint}</p>
              </div>
            )}

            {sourceType === 'url' && (
              <Input
                label={t.urlLabel}
                type="url"
                value={fUrl}
                onChange={(e) => setFUrl(e.target.value)}
                placeholder={t.urlPlaceholder}
              />
            )}

            {sourceType === 'text' && (
              <TextBox
                label={t.textLabel}
                className="!w-full"
                value={fText}
                onChange={(e) => setFText(e.target.value)}
                placeholder={t.textPlaceholder}
              />
            )}

            <div className="flex items-center gap-2">
              <Button onClick={addSource} disabled={!canAdd}>
                {t.add}
              </Button>
              <Button
                type="ghost"
                onClick={() => {
                  resetForm()
                  setFormOpen(false)
                }}
              >
                {t.cancel}
              </Button>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Sources grid */}
      {loaded && sources.length === 0 ? (
        <motion.div variants={fadeUp} className="w-full">
          <EmptyState
            icon={<KnowledgeIcon />}
            title={t.emptyTitle}
            description={t.emptyDesc}
            action={
              <Button
                type="primary"
                iconLeft={<Plus className="size-5" aria-hidden="true" />}
                onClick={() => {
                  resetForm()
                  setFormOpen(true)
                }}
              >
                {t.addButton}
              </Button>
            }
          />
        </motion.div>
      ) : (
        <motion.div variants={fadeUp} className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sources.map((s) => {
            const Icon = TYPE_ICON[s.type]
            return (
              <Card key={s.id} className="flex min-h-[160px] flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-token-8 bg-display-brand text-icon-brand">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <IconButton type="ghost" size="sm" aria-label={t.deleteAria} onClick={() => removeSource(s.id)}>
                    <Trash aria-hidden="true" />
                  </IconButton>
                </div>
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <p className="line-clamp-1 text-paragraph-medium font-medium text-primary">{kbSourceTitle(s)}</p>
                  {s.type === 'text' && s.text && (
                    <p className="line-clamp-3 text-paragraph-medium text-secondary">{s.text}</p>
                  )}
                  {s.type === 'file' && s.fileSize > 0 && (
                    <p className="text-paragraph-medium text-tertiary">{formatBytes(s.fileSize)}</p>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Chip size="sm" shape="rounded" type="neutral">
                    {typeLabel[s.type]}
                  </Chip>
                  <Chip size="sm" shape="rounded" type="success">
                    {t.statusSaved}
                  </Chip>
                </div>
                {s.type === 'url' && s.url && (
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-label-medium font-medium text-brand-token transition-colors duration-200 ease-standard hover:underline"
                  >
                    <LinkSimple className="size-4" aria-hidden="true" />
                    {t.openLink}
                  </a>
                )}
              </Card>
            )
          })}
        </motion.div>
      )}
    </PageContainer>
  )
}
