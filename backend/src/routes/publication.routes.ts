import { Router } from 'express'
import {
  createPublication,
  getPublications,
  deletePublication,
  getPublicationImpact,
} from '../services/publication.service'

const router = Router({ mergeParams: true })

// GET /api/brands/:id/publications
router.get('/', async (req, res) => {
  try {
    const publications = await getPublications(req.params.id)
    res.json(publications)
  } catch (err: any) {
    console.error('[PUBLICATION ROUTE] GET /publications:', err.message)
    res.status(500).json({ error: 'Failed to fetch publications' })
  }
})

// GET /api/brands/:id/publications/impact
router.get('/impact', async (req, res) => {
  try {
    const impact = await getPublicationImpact(req.params.id)
    res.json(impact)
  } catch (err: any) {
    console.error('[PUBLICATION ROUTE] GET /publications/impact:', err.message)
    res.status(500).json({ error: 'Failed to compute publication impact' })
  }
})

// POST /api/brands/:id/publications
router.post('/', async (req, res) => {
  try {
    const { title, platform, platformType, url, publishedAt, articleId } = req.body
    if (!title || !platform || !url || !publishedAt) {
      res.status(400).json({ error: 'title, platform, url, publishedAt are required' })
      return
    }
    const pub = await createPublication({
      brandId: req.params.id,
      title,
      platform,
      platformType: platformType || 'other',
      url,
      publishedAt: new Date(publishedAt),
      articleId,
    })
    res.status(201).json(pub)
  } catch (err: any) {
    console.error('[PUBLICATION ROUTE] POST /publications:', err.message)
    res.status(500).json({ error: 'Failed to create publication' })
  }
})

// DELETE /api/brands/:id/publications/:pubId
router.delete('/:pubId', async (req, res) => {
  try {
    await deletePublication(req.params.pubId)
    res.json({ success: true })
  } catch (err: any) {
    console.error('[PUBLICATION ROUTE] DELETE /publications/:pubId:', err.message)
    res.status(500).json({ error: 'Failed to delete publication' })
  }
})

export default router
