import ContentPublication from '../models/ContentPublication'
import QueryResult from '../models/QueryResult'
import type { PlatformType } from '../models/ContentPublication'

interface CreatePublicationInput {
  brandId: string
  title: string
  platform: string
  platformType: PlatformType
  url: string
  publishedAt: Date
  articleId?: string
}

// ─── Create ───────────────────────────────────────────────────────────────────

export async function createPublication(data: CreatePublicationInput) {
  const [total, mentioned] = await Promise.all([
    QueryResult.countDocuments({ brandId: data.brandId }),
    QueryResult.countDocuments({ brandId: data.brandId, mentioned: true }),
  ])
  const mentionRateAtPublish = total > 0 ? Math.round((mentioned / total) * 100) : 0

  return ContentPublication.create({ ...data, mentionRateAtPublish })
}

// ─── List ─────────────────────────────────────────────────────────────────────

export async function getPublications(brandId: string) {
  return ContentPublication.find({ brandId }).sort({ publishedAt: -1 })
}

// ─── Delete ───────────────────────────────────────────────────────────────────

export async function deletePublication(id: string) {
  return ContentPublication.findByIdAndDelete(id)
}

// ─── Impact analysis — mention rate before vs after each publication ──────────

export async function getPublicationImpact(brandId: string) {
  const publications = await ContentPublication.find({ brandId }).sort({ publishedAt: 1 })

  if (publications.length === 0) return []

  const allResults = await QueryResult.find({ brandId })
    .select('queriedAt mentioned')
    .lean()

  const WINDOW_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

  return publications.map((pub) => {
    const pubDate = new Date(pub.publishedAt)
    const weekBefore = new Date(pubDate.getTime() - WINDOW_MS)
    const weekAfter = new Date(pubDate.getTime() + WINDOW_MS)

    const before = allResults.filter((r: any) => {
      const d = new Date(r.queriedAt)
      return d >= weekBefore && d < pubDate
    })
    const after = allResults.filter((r: any) => {
      const d = new Date(r.queriedAt)
      return d >= pubDate && d < weekAfter
    })

    const rateBefore =
      before.length > 0
        ? Math.round((before.filter((r: any) => r.mentioned).length / before.length) * 100)
        : null
    const rateAfter =
      after.length > 0
        ? Math.round((after.filter((r: any) => r.mentioned).length / after.length) * 100)
        : null
    const delta = rateBefore !== null && rateAfter !== null ? rateAfter - rateBefore : null

    return {
      _id: pub._id,
      brandId: pub.brandId,
      title: pub.title,
      platform: pub.platform,
      platformType: pub.platformType,
      url: pub.url,
      publishedAt: pub.publishedAt,
      articleId: pub.articleId,
      mentionRateAtPublish: pub.mentionRateAtPublish,
      rateBefore,
      rateAfter,
      delta,
    }
  })
}
