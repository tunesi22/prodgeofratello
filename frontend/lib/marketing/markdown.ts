/**
 * Renders the same copy that LandingPage/AboutPage/blog pages show as HTML
 * into Markdown, for AI agents that negotiate `Accept: text/markdown`
 * (see middleware.ts). Reads from the same sources the pages render from
 * (MARKETING_COPY, the blog post arrays) so the two surfaces can't drift.
 */
import { MARKETING_COPY } from './copy'
import type { Lang } from './locale'
import { posts as postsId, getPostBySlug as getPostBySlugId } from '@/app/(marketing)/blog/_posts/id'
import { posts as postsEn, getPostBySlug as getPostBySlugEn } from '@/app/(marketing)/blog/_posts/en'

const SITE_URL = 'https://hifratello.com'

function heading(level: number, text: string): string {
  return `${'#'.repeat(level)} ${text}`
}

function htmlUrl(lang: Lang, path: string): string {
  const prefix = lang === 'en' ? '/en' : ''
  return `${SITE_URL}${prefix}${path}`
}

function sourceLines(lang: Lang, path: string): string[] {
  const other: Lang = lang === 'id' ? 'en' : 'id'
  return [
    `> ${lang === 'id' ? 'Versi HTML' : 'HTML version'}: ${htmlUrl(lang, path)}`,
    `> ${lang === 'id' ? 'Versi bahasa lain' : 'Other language'}: ${htmlUrl(other, path)}`,
    '',
  ]
}

function postsFor(lang: Lang) {
  return lang === 'id' ? postsId : postsEn
}

function getPostBySlugFor(lang: Lang, slug: string) {
  return lang === 'id' ? getPostBySlugId(slug) : getPostBySlugEn(slug)
}

export function renderHomeMarkdown(lang: Lang): string {
  const t = MARKETING_COPY[lang]
  const and = lang === 'id' ? 'dan' : 'and'
  const lines: string[] = []

  lines.push(heading(1, `Fratello — ${lang === 'id' ? 'Platform GEO untuk Indonesia' : 'GEO Platform for Indonesia'}`))
  lines.push('')
  lines.push(...sourceLines(lang, '/'))
  lines.push(t.hero.kicker)
  lines.push('')
  lines.push(heading(2, `${t.hero.titleBefore} ChatGPT, Gemini, Perplexity, ${and} Claude, ${t.hero.titleAfter}`))
  lines.push('')
  lines.push(t.preview.caption)
  lines.push('')

  lines.push(heading(2, t.shift.title))
  lines.push('')
  lines.push(t.shift.lead)
  lines.push('')
  lines.push(`**${t.shift.seoTag}:** ${t.shift.seoBody}`)
  lines.push('')
  lines.push(`**${t.shift.geoTag}:** ${t.shift.geoBody}`)
  lines.push('')

  lines.push(heading(2, t.how.title))
  lines.push('')
  lines.push(t.how.lead)
  lines.push('')
  t.how.steps.forEach((s, i) => lines.push(`${i + 1}. **${s.title}** — ${s.desc}`))
  lines.push('')
  lines.push(t.how.loopNote)
  lines.push('')

  lines.push(heading(2, t.features.title))
  lines.push('')
  lines.push(t.features.lead)
  lines.push('')
  lines.push(heading(3, t.features.lacak.title))
  lines.push(t.features.lacak.lead)
  t.features.lacak.bullets.forEach((b) => lines.push(`- ${b}`))
  lines.push('')
  lines.push(heading(3, t.features.analisis.title))
  lines.push(t.features.analisis.lead)
  t.features.analisis.bullets.forEach((b) => lines.push(`- ${b}`))
  lines.push('')
  lines.push(heading(3, t.features.audit.title))
  lines.push(t.features.audit.desc)
  t.features.audit.checklist.forEach((p) => lines.push(`- ${p}`))
  lines.push('')
  lines.push(heading(3, t.features.semantic.title))
  lines.push(t.features.semantic.desc)
  t.features.semantic.points.forEach((p) => lines.push(`- ${p}`))
  lines.push('')
  lines.push(heading(3, t.features.citations.title))
  lines.push(t.features.citations.desc)
  t.features.citations.points.forEach((p) => lines.push(`- ${p}`))
  lines.push('')
  lines.push(heading(3, t.features.article.title))
  lines.push(t.features.article.desc)
  t.features.article.points.forEach((p) => lines.push(`- ${p}`))
  lines.push('')
  lines.push(heading(3, t.features.distribution.title))
  lines.push(t.features.distribution.desc)
  t.features.distribution.points.forEach((p) => lines.push(`- ${p}`))
  lines.push('')

  lines.push(heading(2, t.comparison.title))
  lines.push('')
  lines.push(t.comparison.lead)
  lines.push('')
  lines.push(`| ${t.comparison.aspect} | ${t.comparison.manual} | Fratello |`)
  lines.push('|---|---|---|')
  t.comparison.rows.forEach((r) => lines.push(`| ${r.label} | ${r.manual} | ${r.fratello} |`))
  lines.push('')

  lines.push(heading(2, t.solutions.title))
  lines.push('')
  lines.push(t.solutions.lead)
  lines.push('')
  t.solutions.items.forEach((it) => lines.push(`- **${it.name}** — ${it.desc}`))
  lines.push('')

  lines.push(heading(2, lang === 'id' ? 'Statistik' : 'Stats'))
  lines.push('')
  t.stats.forEach((s) => lines.push(`- **${s.value}** ${s.label} — ${s.desc}`))
  lines.push('')

  lines.push(heading(2, t.faq.title))
  lines.push('')
  t.faq.items.forEach((item) => {
    lines.push(`**${item.q}**`)
    lines.push('')
    lines.push(item.a)
    lines.push('')
  })

  lines.push(heading(2, t.closing.title))
  lines.push('')
  lines.push(t.closing.lead)
  lines.push('')

  return `${lines.join('\n').trim()}\n`
}

export function renderAboutMarkdown(lang: Lang): string {
  const t = MARKETING_COPY[lang].about
  const stats = MARKETING_COPY[lang].stats
  const lines: string[] = []

  lines.push(heading(1, `${lang === 'id' ? 'Tentang' : 'About'} Fratello`))
  lines.push('')
  lines.push(...sourceLines(lang, '/about'))
  lines.push(t.hero.eyebrow)
  lines.push('')
  lines.push(heading(2, t.hero.title))
  lines.push('')
  lines.push(t.hero.lead)
  lines.push('')
  lines.push(`> ${t.hero.pitch}`)
  lines.push('')

  lines.push(heading(2, t.problem.title))
  lines.push('')
  t.problem.body.forEach((p) => {
    lines.push(p)
    lines.push('')
  })

  lines.push(heading(2, t.framework.title))
  lines.push('')
  lines.push(t.framework.lead)
  lines.push('')
  t.framework.layers.forEach((layer) => {
    lines.push(heading(3, layer.title))
    lines.push(layer.desc)
    lines.push('')
  })

  lines.push(heading(2, t.differentiators.title))
  lines.push('')
  t.differentiators.items.forEach((item) => lines.push(`- **${item.title}** — ${item.desc}`))
  lines.push('')

  lines.push(heading(2, t.features.title))
  lines.push('')
  lines.push(t.features.lead)
  lines.push('')
  t.features.items.forEach((item) => lines.push(`- **${item.title}** — ${item.desc}`))
  lines.push('')

  lines.push(heading(2, t.audience.title))
  lines.push('')
  t.audience.items.forEach((item) => lines.push(`- **${item.title}** — ${item.desc}`))
  lines.push('')

  lines.push(heading(2, lang === 'id' ? 'Statistik' : 'Stats'))
  lines.push('')
  stats.forEach((s) => lines.push(`- **${s.value}** ${s.label} — ${s.desc}`))
  lines.push('')

  lines.push(heading(2, t.pricing.title))
  lines.push('')
  lines.push(t.pricing.lead)
  lines.push('')
  t.pricing.plans.forEach((plan) => {
    lines.push(heading(3, `${plan.name} — ${plan.price}${plan.period} (${plan.priceIdr})`))
    lines.push(`- ${plan.prompts}`)
    lines.push(`- ${plan.models}`)
    lines.push(`- ${plan.articles}`)
    lines.push('')
  })

  lines.push(heading(2, t.closing.title))
  lines.push('')
  lines.push(t.closing.lead)
  lines.push('')

  return `${lines.join('\n').trim()}\n`
}

export function renderBlogListMarkdown(lang: Lang): string {
  const list = postsFor(lang)
  const lines: string[] = []

  lines.push(heading(1, lang === 'id' ? 'Blog Fratello — GEO & AI Search' : 'Fratello Blog — GEO & AI Search'))
  lines.push('')
  lines.push(...sourceLines(lang, '/blog'))

  list.forEach((p) => {
    lines.push(heading(2, `[${p.title}](${htmlUrl(lang, `/blog/${p.slug}`)})`))
    lines.push(`*${p.category} — ${p.date}*`)
    lines.push('')
    lines.push(p.excerpt)
    lines.push('')
  })

  return `${lines.join('\n').trim()}\n`
}

export function renderBlogPostMarkdown(lang: Lang, slug: string): string | null {
  const post = getPostBySlugFor(lang, slug)
  if (!post) return null

  const lines: string[] = []
  lines.push(heading(1, post.title))
  lines.push('')
  lines.push(...sourceLines(lang, `/blog/${slug}`))
  lines.push(`> ${post.category} — ${post.date}`)
  lines.push('')
  lines.push(`*${post.excerpt}*`)
  lines.push('')

  post.sections.forEach((s) => {
    if (s.heading) {
      lines.push(heading(3, s.heading))
      lines.push('')
    }
    lines.push(s.body)
    lines.push('')
  })

  return `${lines.join('\n').trim()}\n`
}
