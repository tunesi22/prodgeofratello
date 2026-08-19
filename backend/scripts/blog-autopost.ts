// Daily automated blog post generator for the Fratello marketing blog.
// Picks the next unused topic from blog-topics.json, generates an ID + EN
// article with Claude Sonnet 5, writes them into the frontend blog post
// folders, commits, pushes to GitHub, then runs the zero-downtime deploy.
//
// Run from the `backend` directory: npx tsx scripts/blog-autopost.ts
// (cron on the VPS invokes it this way — see crontab).
import fs from 'fs'
import path from 'path'
import { execFileSync } from 'child_process'
import dotenv from 'dotenv'
import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'

// Load into a local object rather than process.env — this script later
// shells out to deploy.sh, which inherits process.env. Leaking NODE_ENV=
// production from .env into that child process makes its `npm ci` skip
// devDependencies (typescript, tsx), breaking the backend build.
const dotenvVars: Record<string, string> = {}
dotenv.config({ path: path.join(__dirname, '../../.env'), processEnv: dotenvVars })
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || dotenvVars.ANTHROPIC_API_KEY

const REPO_ROOT = path.resolve(__dirname, '../..')
const ID_DIR = path.join(REPO_ROOT, 'frontend/app/(marketing)/blog/_posts/id')
const EN_DIR = path.join(REPO_ROOT, 'frontend/app/(marketing)/blog/_posts/en')
const TOPICS_PATH = path.join(__dirname, 'blog-topics.json')
const MODEL = 'claude-sonnet-5'

// ─── Types ──────────────────────────────────────────────────────────────────

type Topic = {
  slug: string
  category: string
  categoryEn: string
  angle: string
  primaryKeyword: string
  keywords: string[]
  targetQueries: string[]
  used: boolean
  usedDate?: string
}

type Section = { heading?: string; body: string }
type Post = { slug: string; category: string; date: string; title: string; excerpt: string; sections: Section[] }

const SectionSchema = z.object({ heading: z.string().optional(), body: z.string().min(1) })
const GeneratedSchema = z.object({
  title: z.string().min(5),
  excerpt: z.string().min(20),
  sections: z.array(SectionSchema).min(4).max(8),
})
type Generated = z.infer<typeof GeneratedSchema>

// ─── Anthropic ──────────────────────────────────────────────────────────────

const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY })

async function callClaude(system: string, user: string): Promise<string> {
  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
    system,
    messages: [{ role: 'user', content: user }],
  })
  const block = res.content.find((b): b is Anthropic.TextBlock => b.type === 'text')
  if (!block || !block.text.trim()) throw new Error('[CLAUDE] Empty text response')
  return block.text
}

function parseJson(text: string): unknown {
  const cleaned = text.trim().replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  return JSON.parse(cleaned)
}

function missingKeywords(gen: Generated, required: string[]): string[] {
  const haystack = (
    gen.title + ' ' + gen.excerpt + ' ' + gen.sections.map((s) => `${s.heading ?? ''} ${s.body}`).join(' ')
  ).toLowerCase()
  return required.filter((k) => !haystack.includes(k.toLowerCase()))
}

async function generateWithValidation(system: string, initialUser: string, required: string[]): Promise<Generated> {
  let user = initialUser
  let lastErr: unknown
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const raw = await callClaude(system, user)
      const parsed = GeneratedSchema.parse(parseJson(raw))
      const missing = missingKeywords(parsed, required)
      if (missing.length === 0) return parsed
      if (attempt === 3) {
        console.warn(`[BLOG-AUTOPOST] Proceeding with missing keywords after 3 attempts: ${missing.join(', ')}`)
        return parsed
      }
      user = `${initialUser}\n\nPERINGATAN: draft sebelumnya tidak menyebutkan kata wajib berikut, revisi dan sertakan secara natural: ${missing.join(', ')}`
    } catch (err) {
      lastErr = err
      user = `${initialUser}\n\nPERINGATAN: respons sebelumnya bukan JSON valid sesuai format yang diminta. Balas HANYA dengan JSON valid, tanpa markdown code fence, tanpa teks lain.`
    }
  }
  throw new Error(`[BLOG-AUTOPOST] Failed to generate valid content after 3 attempts: ${lastErr}`)
}

// ─── Prompts ────────────────────────────────────────────────────────────────

function buildSystemId(required: string[], targetQueries: string[], avoidTitles: string[]): string {
  return `Kamu adalah content writer SEO/GEO senior untuk Fratello, platform GEO (Generative Engine Optimization) yang membantu brand Indonesia dipantau dan direkomendasikan oleh mesin AI seperti ChatGPT, Gemini, Perplexity, dan Claude.

Tulis artikel blog dalam Bahasa Indonesia yang natural, informatif, dan otoritatif — gaya tech blog profesional, BUKAN gaya AI generic yang bertele-tele. Hindari frasa klise seperti "Di era digital saat ini" atau "Kesimpulannya".

PRINSIP GEO PENTING: mesin AI memilih sumber berdasarkan seberapa jelas dan natural artikel menjawab pertanyaan asli pengguna — BUKAN berdasarkan seberapa sering sebuah kata diulang. Jangan memaksakan kata kunci berkali-kali sampai terasa kaku ("keyword stuffing") — cukup sebutkan sekali secara natural di tempat yang tepat, lalu fokus benar-benar menjawab pertanyaan pembaca dengan jelas dan spesifik.

WAJIB:
- Artikel ini harus secara eksplisit dan jelas menjawab pertanyaan-pertanyaan berikut, yang merupakan contoh nyata pertanyaan yang orang ketik ke ChatGPT/Gemini terkait topik ini — jawab di dalam body section yang relevan, bukan cuma menyinggung sekilas:
${targetQueries.map((q) => `  - "${q}"`).join('\n')}
- Sebutkan kata-kata berikut minimal sekali secara natural: ${required.join(', ')}
- Sebutkan brand "Fratello" minimal 1 kali secara natural, sebagai konteks/rujukan produk monitoring GEO — bukan hard-sell
- 5-7 section: section pertama tanpa heading (paragraf pembuka/konteks), section berikutnya masing-masing punya heading jelas
- Panjang total sekitar 900-1400 kata
- JANGAN membahas ulang topik yang sudah pernah ditulis di blog ini: ${avoidTitles.slice(0, 40).join('; ')}

Balas HANYA dengan JSON valid (tanpa markdown code fence, tanpa teks lain di luar JSON), persis format ini:
{"title": "...", "excerpt": "1-2 kalimat ringkas untuk meta description", "sections": [{"heading": "opsional, kosongkan di section pertama", "body": "..."}]}`
}

function buildUserId(topic: Topic): string {
  return `Topik: ${topic.angle}\nKategori: ${topic.category}\nKeyword fokus utama: ${topic.primaryKeyword}\nKeyword pendukung: ${topic.keywords.join(', ')}`
}

function buildSystemEn(required: string[]): string {
  return `You are a senior SEO/GEO content writer for Fratello, a GEO (Generative Engine Optimization) platform that helps Indonesian brands get tracked and recommended by AI engines like ChatGPT, Gemini, Perplexity, and Claude.

You will receive an Indonesian article as a JSON object. Adapt it into natural, authoritative English for an international marketing/SEO audience — do NOT translate word-for-word, rewrite it as if written natively in English, but keep the same facts, structure, section count, and — crucially — keep answering the same underlying reader questions the Indonesian version answers, just phrased for an English-speaking audience asking AI engines the equivalent question.

AI engines cite sources that clearly and specifically answer the reader's real question, not sources that repeat keywords — don't force awkward keyword repetition, mention each required term once where it fits naturally.

REQUIRED:
- Naturally include these terms somewhere in the article (title, excerpt, or section bodies): ${required.join(', ')}
- Mention the brand "Fratello" at least once, naturally, as product context — not a hard sell
- Keep the same number of sections as the source; the first section stays heading-less

Reply with ONLY valid JSON (no markdown code fence, no other text), in exactly this shape:
{"title": "...", "excerpt": "1-2 sentence meta description", "sections": [{"heading": "omit on the first section", "body": "..."}]}`
}

function buildUserEn(topic: Topic, id: Generated): string {
  return `Category: ${topic.categoryEn}\nPrimary keyword (English equivalent, adapt naturally): ${topic.primaryKeyword}\nSupporting keywords: ${topic.keywords.join(', ')}\n\nSource article (Indonesian):\n${JSON.stringify(id, null, 2)}`
}

// ─── Topic bank ─────────────────────────────────────────────────────────────

function loadTopics(): Topic[] {
  return JSON.parse(fs.readFileSync(TOPICS_PATH, 'utf8'))
}

function saveTopics(topics: Topic[]): void {
  fs.writeFileSync(TOPICS_PATH, JSON.stringify(topics, null, 2) + '\n', 'utf8')
}

function pickTopic(topics: Topic[], existingSlugs: Set<string>): Topic {
  const candidate = topics.find((t) => !t.used && !existingSlugs.has(t.slug))
  if (!candidate) {
    throw new Error('[BLOG-AUTOPOST] Topic bank habis — tambahkan topik baru ke backend/scripts/blog-topics.json')
  }
  return candidate
}

// ─── Existing posts introspection ──────────────────────────────────────────

function getExisting(dir: string): { slugs: Set<string>; titles: string[] } {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.ts') && f !== 'index.ts')
  const slugs = new Set<string>()
  const titles: string[] = []
  for (const f of files) {
    const text = fs.readFileSync(path.join(dir, f), 'utf8')
    const slugMatch = text.match(/slug['"]?\s*:\s*['"]([^'"]+)['"]/)
    const titleMatch = text.match(/title['"]?\s*:\s*['"]([^'"]+)['"]/)
    if (slugMatch) slugs.add(slugMatch[1])
    if (titleMatch) titles.push(titleMatch[1])
  }
  return { slugs, titles }
}

// ─── Post file writing ──────────────────────────────────────────────────────

function toVarName(slug: string): string {
  const parts = slug.split('-')
  let out = parts.map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1))).join('')
  if (/^[0-9]/.test(out)) out = '_' + out
  return out
}

function writePostFile(dir: string, post: Post): void {
  const filePath = path.join(dir, `${post.slug}.ts`)
  const content = `import type { Post } from '../types'\n\nexport const post: Post = ${JSON.stringify(post, null, 2)}\n`
  fs.writeFileSync(filePath, content, 'utf8')
}

function updateIndex(dir: string, slug: string, varName: string): void {
  const indexPath = path.join(dir, 'index.ts')
  let content = fs.readFileSync(indexPath, 'utf8')

  const importAnchor = `import type { Post } from '../types'\n`
  if (!content.includes(importAnchor)) throw new Error(`[BLOG-AUTOPOST] import anchor not found in ${indexPath}`)
  content = content.replace(importAnchor, `${importAnchor}import { post as ${varName} } from './${slug}'\n`)

  const arrayAnchor = `export const posts: Post[] = [\n`
  if (!content.includes(arrayAnchor)) throw new Error(`[BLOG-AUTOPOST] array anchor not found in ${indexPath}`)
  content = content.replace(arrayAnchor, `${arrayAnchor}  ${varName},\n`)

  fs.writeFileSync(indexPath, content, 'utf8')
}

// ─── Git / deploy ───────────────────────────────────────────────────────────

function git(args: string[], silent = false): string {
  console.log(`[GIT] git ${args.join(' ')}`)
  return execFileSync('git', args, { cwd: REPO_ROOT, stdio: silent ? 'pipe' : 'inherit', encoding: 'utf8' }) ?? ''
}

function pushStaleCommitsIfAny(): void {
  git(['fetch', 'origin', 'main'])
  const ahead = git(['rev-list', 'origin/main..HEAD', '--count'], true).trim()
  if (ahead !== '0') {
    console.log(`[BLOG-AUTOPOST] Found ${ahead} unpushed commit(s) from a previous run — pushing before continuing.`)
    git(['push', 'origin', 'HEAD:main'])
  }
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`[BLOG-AUTOPOST] Start ${new Date().toISOString()}`)
  if (!ANTHROPIC_API_KEY) throw new Error('[BLOG-AUTOPOST] ANTHROPIC_API_KEY is not set')

  pushStaleCommitsIfAny()

  const topics = loadTopics()
  const { slugs: existingSlugs, titles: existingTitles } = getExisting(ID_DIR)
  const topic = pickTopic(topics, existingSlugs)
  console.log(`[BLOG-AUTOPOST] Topic: ${topic.slug}`)

  const remaining = topics.filter((t) => !t.used).length
  if (remaining <= 5) {
    console.warn(`[BLOG-AUTOPOST] WARNING: hanya tersisa ${remaining} topik di topic bank, segera tambahkan lagi.`)
  }

  // Kept deliberately short: forcing every supporting keyword as a literal
  // substring match risks keyword-stuffing, which hurts GEO more than it
  // helps (AI engines cite clear answers, not keyword density). The real
  // topical coverage comes from targetQueries in the prompt, not this list.
  const requiredId = Array.from(new Set(['GEO', 'Fratello', topic.primaryKeyword]))
  const idContent = await generateWithValidation(
    buildSystemId(requiredId, topic.targetQueries, existingTitles),
    buildUserId(topic),
    requiredId
  )
  console.log(`[BLOG-AUTOPOST] Generated ID draft: "${idContent.title}"`)

  // English required list stays minimal — topic.primaryKeyword and
  // topic.keywords are Indonesian phrases the EN adaptation won't quote
  // verbatim, so string-matching them here would just force awkward
  // literal insertions instead of a natural English adaptation.
  const requiredEn = ['GEO', 'Fratello']
  const enContent = await generateWithValidation(buildSystemEn(requiredEn), buildUserEn(topic, idContent), requiredEn)
  console.log(`[BLOG-AUTOPOST] Generated EN draft: "${enContent.title}"`)

  const today = new Date().toISOString().slice(0, 10)
  const idPost: Post = { slug: topic.slug, category: topic.category, date: today, ...idContent }
  const enPost: Post = { slug: topic.slug, category: topic.categoryEn, date: today, ...enContent }

  const varName = toVarName(topic.slug)
  writePostFile(ID_DIR, idPost)
  writePostFile(EN_DIR, enPost)
  updateIndex(ID_DIR, topic.slug, varName)
  updateIndex(EN_DIR, topic.slug, varName)

  topic.used = true
  topic.usedDate = today
  saveTopics(topics)

  const changed = [
    path.join(ID_DIR, `${topic.slug}.ts`),
    path.join(ID_DIR, 'index.ts'),
    path.join(EN_DIR, `${topic.slug}.ts`),
    path.join(EN_DIR, 'index.ts'),
    TOPICS_PATH,
  ].map((p) => path.relative(REPO_ROOT, p))

  git(['add', ...changed])
  git(['commit', '-m', `feat(blog): auto-generate post - ${idPost.title}`])
  git(['push', 'origin', 'HEAD:main'])

  console.log('[BLOG-AUTOPOST] Deploying...')
  execFileSync('bash', [path.join(REPO_ROOT, 'deploy/deploy.sh')], {
    cwd: REPO_ROOT,
    stdio: 'inherit',
    timeout: 15 * 60 * 1000,
  })

  console.log(`[BLOG-AUTOPOST] Done. Published: ${topic.slug}`)
}

main().catch((err) => {
  console.error('[BLOG-AUTOPOST] FAILED:', err)
  process.exit(1)
})
