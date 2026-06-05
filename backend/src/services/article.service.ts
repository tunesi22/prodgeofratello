import { marked } from 'marked'
import Article from '../models/Article'
import Brand from '../models/Brand'
import Prompt from '../models/Prompt'
import QueryResult from '../models/QueryResult'
import { query as queryAnthropic } from './llm/anthropic'

// ─── Generate article from gap prompt ────────────────────────────────────────

export async function generateArticle(brandId: string, promptId: string) {
  const [brand, prompt] = await Promise.all([
    Brand.findById(brandId),
    Prompt.findById(promptId),
  ])

  if (!brand) throw new Error('Brand not found')
  if (!prompt) throw new Error('Prompt not found')

  // Calculate mention rate for context
  const [total, mentioned] = await Promise.all([
    QueryResult.countDocuments({ promptId, brandId }),
    QueryResult.countDocuments({ promptId, brandId, mentioned: true }),
  ])
  const mentionRate = total > 0 ? Math.round((mentioned / total) * 100) : 0

  const systemPrompt = `You are a GEO (Generative Engine Optimization) content expert. Write a comprehensive, AI-friendly article that will help ${brand.name} get mentioned when AI assistants answer questions about "${prompt.text}".

Brand details:
- Name: ${brand.name}
- Website: ${brand.website}
- Industry: ${brand.industry}
${brand.competitors.length > 0 ? `- Competitors: ${brand.competitors.join(', ')}` : ''}

Target query: "${prompt.text}"
Current mention rate: ${mentionRate}% (this is the gap we're filling)

Requirements:
1. Write in clean Markdown format
2. Structure: H1 title → intro paragraph → 3-5 H2 sections → FAQ section (3-5 Q&As) → conclusion
3. Naturally mention ${brand.name} 3-5 times — not forced, genuinely helpful context
4. Be factual, authoritative, and structured for AI consumption
5. Include specific details, numbers, and comparisons where possible
6. Target length: 600-900 words
7. Do NOT use generic filler phrases like "In conclusion" or "In today's world"

Return ONLY the markdown content, no preamble.`

  console.log(`[ARTICLE SERVICE] Generating article for prompt: "${prompt.text.slice(0, 60)}..."`)

  const content = await queryAnthropic(systemPrompt)

  // Extract title from first H1
  const titleMatch = content.match(/^#\s+(.+)$/m)
  const title = titleMatch ? titleMatch[1] : `${brand.name} — ${prompt.text.slice(0, 60)}`

  const article = await Article.create({
    brandId,
    promptId,
    title,
    content,
    format: 'markdown',
    status: 'ready',
    generatedAt: new Date(),
  })

  console.log(`[ARTICLE SERVICE] Created article: "${title}"`)
  return article
}

// ─── List articles ────────────────────────────────────────────────────────────

export async function getArticlesByBrand(brandId: string) {
  return Article.find({ brandId })
    .populate('promptId', 'text category')
    .sort({ generatedAt: -1 })
}

// ─── Get single article ───────────────────────────────────────────────────────

export async function getArticle(articleId: string) {
  return Article.findById(articleId).populate('promptId', 'text category')
}

// ─── Export article ───────────────────────────────────────────────────────────

export async function exportArticle(articleId: string, format: 'markdown' | 'html') {
  const article = await Article.findById(articleId)
  if (!article) throw new Error('Article not found')

  if (format === 'html') {
    const html = await marked(article.content)
    return {
      content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title}</title>
  <style>
    body { font-family: -apple-system, sans-serif; max-width: 800px; margin: 40px auto; padding: 0 20px; line-height: 1.7; color: #111; }
    h1, h2 { font-weight: 700; }
    h1 { font-size: 2rem; margin-bottom: 1rem; }
    h2 { font-size: 1.3rem; margin-top: 2rem; }
    p { margin-bottom: 1rem; }
  </style>
</head>
<body>${html}</body>
</html>`,
      filename: `${slugify(article.title)}.html`,
      mimeType: 'text/html',
    }
  }

  return {
    content: article.content,
    filename: `${slugify(article.title)}.md`,
    mimeType: 'text/markdown',
  }
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60)
}
