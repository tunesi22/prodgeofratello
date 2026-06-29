import { Router } from 'express'
import { generatePromptPool, getPromptsByBrand, deletePromptsByBrand } from '../services/prompt.service'
import { discoverRealQueries } from '../services/real-queries.service'
import Brand from '../models/Brand'
import Prompt from '../models/Prompt'

const router = Router({ mergeParams: true })

// GET /api/brands/:id/prompts/discover — fetch real queries from internet
router.get('/discover', async (req, res) => {
  try {
    const brand = await Brand.findOne({ _id: req.params.id, userId: req.userId })
    if (!brand) {
      res.status(404).json({ error: 'Brand not found' })
      return
    }
    const queries = await discoverRealQueries(brand.name, brand.industry)
    res.json({ queries, total: queries.length })
  } catch (err: any) {
    console.error('[PROMPT ROUTE] GET /discover:', err.message)
    res.status(500).json({ error: err.message || 'Failed to discover queries' })
  }
})

// POST /api/brands/:id/prompts/import — add selected real queries as prompts
router.post('/import', async (req, res) => {
  try {
    const { queries } = req.body as { queries: { text: string; category: string }[] }
    if (!queries?.length) {
      res.status(400).json({ error: 'No queries provided' })
      return
    }
    const brandId = req.params.id
    const created = await Prompt.insertMany(
      queries.map((q) => ({ brandId, text: q.text, category: q.category, isActive: true }))
    )
    const allPrompts = await getPromptsByBrand(brandId)
    res.json({ added: created.length, total: allPrompts.length })
  } catch (err: any) {
    console.error('[PROMPT ROUTE] POST /import:', err.message)
    res.status(500).json({ error: err.message || 'Failed to import queries' })
  }
})

// POST /api/brands/:id/prompts — generate prompt pool
router.post('/', async (req, res) => {
  try {
    const brandId = req.params.id

    const brand = await Brand.findById(brandId)
    if (!brand) {
      res.status(404).json({ error: 'Brand not found' })
      return
    }

    // Optionally clear existing prompts before regenerating
    if (req.query.regenerate === 'true') {
      await deletePromptsByBrand(brandId)
    }

    await generatePromptPool({
      brandId,
      brandName: brand.name,
      industry: brand.industry,
      competitors: brand.competitors.map((c) => c.name),
    })

    const prompts = await getPromptsByBrand(brandId)
    res.status(201).json({ count: prompts.length, prompts })
  } catch (err: any) {
    console.error('[PROMPT ROUTE] POST /api/brands/:id/prompts:', err.message)
    res.status(500).json({ error: err.message || 'Failed to generate prompts' })
  }
})

// GET /api/brands/:id/prompts
router.get('/', async (req, res) => {
  try {
    const prompts = await getPromptsByBrand(req.params.id)
    res.json({ count: prompts.length, prompts })
  } catch (err: any) {
    console.error('[PROMPT ROUTE] GET /api/brands/:id/prompts:', err.message)
    res.status(500).json({ error: 'Failed to fetch prompts' })
  }
})

export default router
