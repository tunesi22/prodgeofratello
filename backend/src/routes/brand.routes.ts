import { Router } from 'express'
import Brand from '../models/Brand'

const router = Router()

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
      competitors: competitors || [],
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
