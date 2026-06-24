/**
 * Knowledge Base sources, shared by the Knowledge page and the article composer.
 *
 * A source is one of three kinds: an uploaded file, a URL, or pasted text.
 * Persisted to localStorage per brand (no backend yet; real ingestion, file
 * upload, and feeding sources into generation are backend tasks). The reader is
 * tolerant of the previous KBEntry { title, content, link } shape so older saved
 * data is migrated to a source on load instead of being dropped.
 */

export type KBSourceType = 'file' | 'url' | 'text'

export interface KBSource {
  id: string
  type: KBSourceType
  name: string
  /** Free text content (type 'text'), or notes for other kinds. */
  text: string
  /** URL (type 'url'). */
  url: string
  /** File metadata (type 'file'); the file bytes are not uploaded yet. */
  fileName: string
  fileSize: number
  fileType: string
  createdAt: string
}

export function kbStorageKey(brandId: string): string {
  return `fratello-kb-${brandId}`
}

/** Display title for a source: its name, else a sensible fallback per type. */
export function kbSourceTitle(s: KBSource): string {
  const name = s.name.trim()
  if (name !== '') return name
  if (s.type === 'file' && s.fileName !== '') return s.fileName
  if (s.type === 'url' && s.url !== '') return s.url
  return s.text.trim().slice(0, 60)
}

export function loadKBSources(brandId: string): KBSource[] {
  try {
    const raw = localStorage.getItem(kbStorageKey(brandId))
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map(normalizeSource).filter((s): s is KBSource => s !== null)
  } catch {
    return []
  }
}

export function saveKBSources(brandId: string, sources: KBSource[]): void {
  try {
    localStorage.setItem(kbStorageKey(brandId), JSON.stringify(sources))
  } catch {
    /* ignore quota / serialization errors */
  }
}

function str(v: unknown): string {
  return typeof v === 'string' ? v : ''
}

/** Map a raw stored object to a KBSource, migrating the old KBEntry shape. */
function normalizeSource(raw: unknown): KBSource | null {
  if (typeof raw !== 'object' || raw === null) return null
  const r = raw as Record<string, unknown>
  const id = typeof r.id === 'string' ? r.id : crypto.randomUUID()
  const createdAt = typeof r.createdAt === 'string' ? r.createdAt : ''

  if (r.type === 'file' || r.type === 'url' || r.type === 'text') {
    return {
      id,
      type: r.type,
      name: str(r.name),
      text: str(r.text),
      url: str(r.url),
      fileName: str(r.fileName),
      fileSize: typeof r.fileSize === 'number' ? r.fileSize : 0,
      fileType: str(r.fileType),
      createdAt,
    }
  }

  // Legacy KBEntry { title, content, link } -> url source if a link exists, else text.
  const title = str(r.title).trim()
  const content = str(r.content)
  const link = str(r.link).trim()
  if (link !== '') {
    return { id, type: 'url', name: title || link, text: content, url: link, fileName: '', fileSize: 0, fileType: '', createdAt }
  }
  if (title !== '' || content.trim() !== '') {
    return { id, type: 'text', name: title || content.trim().slice(0, 40), text: content, url: '', fileName: '', fileSize: 0, fileType: '', createdAt }
  }
  return null
}
