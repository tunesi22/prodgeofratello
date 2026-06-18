import mongoose from 'mongoose'
import QueryResult from '../models/QueryResult'
import Prompt from '../models/Prompt'
import Brand from '../models/Brand'
import { LLM_MODELS } from '../../../shared/constants'
import type { LLMModel } from '../../../shared/constants'

// ─── Mention rate per model ──────────────────────────────────────────────────

export async function getMentionRateByModel(brandId: string) {
  const rates = await Promise.all(
    LLM_MODELS.map(async (model: LLMModel) => {
      const [total, mentioned] = await Promise.all([
        QueryResult.countDocuments({ brandId, model }),
        QueryResult.countDocuments({ brandId, model, mentioned: true }),
      ])
      return {
        model,
        totalQueries: total,
        mentionCount: mentioned,
        mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : 0,
      }
    })
  )

  const overall = rates.reduce(
    (acc, r) => { acc.total += r.totalQueries; acc.mentioned += r.mentionCount; return acc },
    { total: 0, mentioned: 0 }
  )

  return {
    byModel: rates,
    overall: {
      totalQueries: overall.total,
      mentionCount: overall.mentioned,
      mentionRate: overall.total > 0 ? Math.round((overall.mentioned / overall.total) * 100) : 0,
    },
  }
}

// ─── Sentiment breakdown ─────────────────────────────────────────────────────

export async function getSentimentBreakdown(brandId: string) {
  const results = await QueryResult.aggregate([
    { $match: { brandId: new mongoose.Types.ObjectId(brandId), mentioned: true } },
    {
      $group: {
        _id: { model: '$model', sentiment: '$sentiment' },
        count: { $sum: 1 },
      },
    },
  ])

  const breakdown: Record<string, Record<string, number>> = {}

  for (const model of LLM_MODELS) {
    breakdown[model] = { positive: 0, neutral: 0, negative: 0 }
  }

  for (const r of results) {
    if (breakdown[r._id.model]) {
      breakdown[r._id.model][r._id.sentiment] = r.count
    }
  }

  return breakdown
}

// ─── Trend over time (weekly) ────────────────────────────────────────────────

export async function getTrends(brandId: string) {
  const results = await QueryResult.aggregate([
    { $match: { brandId: new mongoose.Types.ObjectId(brandId) } },
    {
      $group: {
        _id: {
          year: { $isoWeekYear: '$queriedAt' },
          week: { $isoWeek: '$queriedAt' },
        },
        total: { $sum: 1 },
        mentioned: { $sum: { $cond: ['$mentioned', 1, 0] } },
      },
    },
    { $sort: { '_id.year': 1, '_id.week': 1 } },
    { $limit: 12 },
  ])

  return results.map((r) => ({
    label: `W${r._id.week} ${r._id.year}`,
    week: r._id.week,
    year: r._id.year,
    total: r.total,
    mentioned: r.mentioned,
    mentionRate: r.total > 0 ? Math.round((r.mentioned / r.total) * 100) : 0,
  }))
}

// ─── Prompt gap (mention rate < threshold) ────────────────────────────────────

export async function getPromptGaps(brandId: string, threshold = 20) {
  const results = await QueryResult.aggregate([
    { $match: { brandId: new mongoose.Types.ObjectId(brandId) } },
    {
      $group: {
        _id: '$promptId',
        total: { $sum: 1 },
        mentioned: { $sum: { $cond: ['$mentioned', 1, 0] } },
      },
    },
    {
      $addFields: {
        mentionRate: {
          $cond: [
            { $gt: ['$total', 0] },
            { $multiply: [{ $divide: ['$mentioned', '$total'] }, 100] },
            0,
          ],
        },
      },
    },
    { $match: { mentionRate: { $lt: threshold } } },
    { $sort: { mentionRate: 1 } },
  ])

  const promptIds = results.map((r) => r._id)
  const prompts = await Prompt.find({ _id: { $in: promptIds } })
  const promptMap = Object.fromEntries(prompts.map((p) => [String(p._id), p]))

  return results.map((r) => ({
    promptId: r._id,
    text: promptMap[String(r._id)]?.text || '',
    category: promptMap[String(r._id)]?.category || '',
    total: r.total,
    mentioned: r.mentioned,
    mentionRate: Math.round(r.mentionRate),
  }))
}

// ─── Share of voice (brands in same account) ─────────────────────────────────

export async function getShareOfVoice(brandId: string) {
  const brand = await Brand.findById(brandId)
  if (!brand) throw new Error('Brand not found')

  const allBrands = await Brand.find({ userId: brand.userId })

  const data = await Promise.all(
    allBrands.map(async (b) => {
      const [total, mentioned] = await Promise.all([
        QueryResult.countDocuments({ brandId: b._id }),
        QueryResult.countDocuments({ brandId: b._id, mentioned: true }),
      ])
      return {
        brandId: String(b._id),
        name: b.name,
        mentionCount: mentioned,
        mentionRate: total > 0 ? Math.round((mentioned / total) * 100) : 0,
      }
    })
  )

  const totalMentions = data.reduce((sum, d) => sum + d.mentionCount, 0)

  return data.map((d) => ({
    ...d,
    shareOfVoice: totalMentions > 0 ? Math.round((d.mentionCount / totalMentions) * 100) : 0,
  }))
}

// ─── All analytics aggregated ────────────────────────────────────────────────

export async function getFullAnalytics(brandId: string) {
  const [mentionRate, sentiment, trends, gaps, shareOfVoice] = await Promise.all([
    getMentionRateByModel(brandId),
    getSentimentBreakdown(brandId),
    getTrends(brandId),
    getPromptGaps(brandId),
    getShareOfVoice(brandId),
  ])

  const byModel = mentionRate.byModel
  const bestModel = byModel.reduce((a, b) => (a.mentionRate > b.mentionRate ? a : b), byModel[0])
  const worstModel = byModel.reduce((a, b) => (a.mentionRate < b.mentionRate ? a : b), byModel[0])

  return {
    overall: mentionRate.overall,
    byModel: mentionRate.byModel,
    bestModel: bestModel?.model || null,
    worstModel: worstModel?.model || null,
    sentiment,
    trends,
    gaps,
    shareOfVoice,
  }
}
