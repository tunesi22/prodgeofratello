import { Router } from 'express'
import axios from 'axios'
import * as cheerio from 'cheerio'
import Brand from '../models/Brand'
import type { ICompetitor } from '../models/Brand'
import { query as queryAnthropic } from '../services/llm/anthropic'
import { withRetry } from '../utils/retry'

const router = Router()

function normalizeCompetitors(raw: any[]): ICompetitor[] {
  return raw.map((c) =>
    typeof c === 'string'
      ? { name: c, domain: '', includeSubdomains: false }
      : { name: String(c.name || ''), domain: String(c.domain || ''), includeSubdomains: Boolean(c.includeSubdomains) }
  )
}

// POST /api/brands/analyze — crawl website + LLM detect industry & competitors
router.post('/analyze', async (req, res) => {
  const { website, brandName: inputBrandName } = req.body
  if (!website || typeof website !== 'string') {
    res.status(400).json({ error: 'website is required' })
    return
  }

  try {
    let crawlable = true
    let extractedText = ''
    let detectedBrandName = inputBrandName || ''

    try {
      const response = await axios.get(website, {
        timeout: 10_000,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; GEO-Platform/1.0; +https://geonineten.com)' },
        maxContentLength: 500_000,
      })

      const contentType = String(response.headers['content-type'] || '')
      if (!contentType.includes('text/html')) {
        crawlable = false
      } else {
        const $ = cheerio.load(response.data as string)

        if (!detectedBrandName) {
          detectedBrandName =
            $('meta[property="og:site_name"]').attr('content') ||
            $('title').text().split(/[|\-–]/)[0].trim() ||
            ''
        }

        const title = $('title').text().trim()
        const metaDesc = $('meta[name="description"]').attr('content') || ''
        const h1s = $('h1').map((_, el) => $(el).text().trim()).get().join(' ')
        $('script, style, nav, footer, header').remove()
        const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 2000)

        extractedText = [title, metaDesc, h1s, bodyText].filter(Boolean).join('\n')
        if (!extractedText.trim()) crawlable = false
      }
    } catch {
      crawlable = false
    }

    const llmPrompt = crawlable
      ? `Analyze this website content and extract business info.\nWebsite: ${website}\n\nContent:\n${extractedText}\n\nReturn a JSON object with EXACTLY these keys:\n- industry: string (1-4 words, e.g. "E-commerce", "SaaS", "Food & Beverage")\n- competitors: array of up to 5 objects with {name: string, domain: string, includeSubdomains: boolean}\n- summary: string (1 sentence in Indonesian about what this business does)\n\nReturn ONLY valid JSON, no explanation, no markdown.`
      : `Based only on this website URL: ${website}, infer the industry.\nReturn ONLY valid JSON with keys: {industry: string, competitors: [], summary: string}. Summary in Indonesian.`

    const raw = await withRetry(() => queryAnthropic(llmPrompt, 512))

    let industry = 'General'
    let competitors: ICompetitor[] = []
    let summary = ''

    try {
      const jsonMatch = raw.match(/\{[\s\S]*\}/)
      const parsed = JSON.parse(jsonMatch?.[0] || '{}')
      industry = parsed.industry || 'General'
      competitors = normalizeCompetitors(Array.isArray(parsed.competitors) ? parsed.competitors : [])
      summary = parsed.summary || ''
    } catch {
      // LLM returned non-JSON, keep defaults
    }

    res.json({ crawlable, brandName: detectedBrandName, industry, competitors, summary })
  } catch (err: any) {
    console.error('[BRAND ROUTE] POST /analyze:', err.message)
    res.status(500).json({ error: 'Failed to analyze website' })
  }
})

// POST /api/brands/detect-industry
router.post('/detect-industry', async (req, res) => {
  try {
    const { website } = req.body
    if (!website) {
      res.status(400).json({ error: 'website is required' })
      return
    }

    const prompt = `You are a business analyst. Based on this website URL: "${website}", what industry does this company most likely operate in? Reply with ONLY the industry name, 1-4 words maximum. Examples: "E-commerce", "Software", "Food & Beverage", "Finance", "Healthcare", "Education", "Fashion", "Real Estate", "Manufacturing", "Consulting". No explanation, no punctuation at the end.`

    const raw = await queryAnthropic(prompt, 64)
    const industry = raw.trim().replace(/[."']+$/, '')

    res.json({ industry })
  } catch (err: any) {
    console.error('[BRAND ROUTE] POST /detect-industry:', err.message)
    res.status(500).json({ error: 'Failed to detect industry' })
  }
})

// POST /api/brands
router.post('/', async (req, res) => {
  try {
    const { name, website, industry, competitors } = req.body

    if (!name || !website || !industry) {
      res.status(400).json({ error: 'name, website, and industry are required' })
      return
    }

    const brand = await Brand.create({
      userId: req.userId,
      name,
      website,
      industry,
      competitors: normalizeCompetitors(Array.isArray(competitors) ? competitors : []),
    })

    res.status(201).json(brand)
  } catch (err: any) {
    console.error('[BRAND ROUTE] POST /api/brands:', err.message)
    res.status(500).json({ error: 'Failed to create brand' })
  }
})

// GET /api/brands
router.get('/', async (req, res) => {
  try {
    const brands = await Brand.find({ userId: req.userId }).sort({ createdAt: -1 })
    res.json(brands)
  } catch (err: any) {
    console.error('[BRAND ROUTE] GET /api/brands:', err.message)
    res.status(500).json({ error: 'Failed to fetch brands' })
  }
})

// GET /api/brands/:id
router.get('/:id', async (req, res) => {
  try {
    const brand = await Brand.findOne({ _id: req.params.id, userId: req.userId })
    if (!brand) {
      res.status(404).json({ error: 'Brand not found' })
      return
    }
    res.json(brand)
  } catch (err: any) {
    console.error('[BRAND ROUTE] GET /api/brands/:id:', err.message)
    res.status(500).json({ error: 'Failed to fetch brand' })
  }
})

// DELETE /api/brands/:id
router.delete('/:id', async (req, res) => {
  try {
    const brand = await Brand.findOneAndDelete({ _id: req.params.id, userId: req.userId })
    if (!brand) {
      res.status(404).json({ error: 'Brand not found' })
      return
    }
    res.json({ message: 'Brand deleted' })
  } catch (err: any) {
    console.error('[BRAND ROUTE] DELETE /api/brands/:id:', err.message)
    res.status(500).json({ error: 'Failed to delete brand' })
  }
})

export default router
