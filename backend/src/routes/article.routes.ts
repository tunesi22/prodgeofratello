import { Router } from 'express'
import { generateArticle, getArticlesByBrand, getArticle, exportArticle } from '../services/article.service'
import { generateLLMsTxt, generateNginxConfig, runGEOAudit, findBacklinkTargets } from '../services/audit.service'
import { gateArticleQuota } from '../middleware/planGate'

const router = Router({ mergeParams: true })

// ─── Articles ────────────────────────────────────────────────────────────────

// GET /api/brands/:id/articles
router.get('/', async (req, res) => {
  try {
    const articles = await getArticlesByBrand(req.params.id)
    res.json({ count: articles.length, articles })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/brands/:id/articles/generate
router.post('/generate', gateArticleQuota, async (req, res) => {
  try {
    const { promptId } = req.body
    if (!promptId) { res.status(400).json({ error: 'promptId is required' }); return }
    const article = await generateArticle(req.params.id, promptId)
    res.status(201).json(article)
  } catch (err: any) {
    console.error('[ARTICLE ROUTE] generate:', err.message)
    res.status(500).json({ error: err.message })
  }
})

// GET /api/brands/:id/articles/:articleId
router.get('/:articleId', async (req, res) => {
  try {
    const article = await getArticle(req.params.articleId)
    if (!article) { res.status(404).json({ error: 'Article not found' }); return }
    res.json(article)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/brands/:id/articles/:articleId/export?format=md|html
router.get('/:articleId/export', async (req, res) => {
  try {
    const format = (req.query.format as string) === 'html' ? 'html' : 'markdown'
    const { content, filename, mimeType } = await exportArticle(req.params.articleId, format)
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`)
    res.setHeader('Content-Type', mimeType)
    res.send(content)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// ─── Technical tools ──────────────────────────────────────────────────────────

// POST /api/brands/:id/tools/llms-txt
router.post('/tools/llms-txt', async (req, res) => {
  try {
    const { keyFacts = [] } = req.body
    const content = await generateLLMsTxt(req.params.id, keyFacts)
    res.json({ content })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/brands/:id/tools/nginx-config
router.post('/tools/nginx-config', async (req, res) => {
  try {
    const { domain, pages = [] } = req.body
    if (!domain) { res.status(400).json({ error: 'domain is required' }); return }
    const content = generateNginxConfig(domain, pages)
    res.json({ content })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/brands/:id/tools/geo-score
router.post('/tools/geo-score', async (req, res) => {
  try {
    const { url } = req.body
    if (!url) { res.status(400).json({ error: 'url is required' }); return }
    const result = await runGEOAudit(url)
    res.json(result)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/brands/:id/tools/backlinks
router.get('/tools/backlinks', async (req, res) => {
  try {
    const targets = await findBacklinkTargets(req.params.id)
    res.json({ count: targets.length, targets })
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
})

export default router
