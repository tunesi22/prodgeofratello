import { Router } from 'express'
import { generatePromptPool, getPromptsByBrand, deletePromptsByBrand } from '../services/prompt.service'
import Brand from '../models/Brand'

const router = Router({ mergeParams: true })

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
      competitors: brand.competitors,
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
