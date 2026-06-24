import mongoose from 'mongoose'
import QueryResult from '../models/QueryResult'
import Brand from '../models/Brand'
import User from '../models/User'
import { sendAlertEmail } from './email.service'
import { sendWhatsAppAlert } from './whatsapp.service'

interface WeeklyRate {
  week: number
  year: number
  mentionRate: number
}

async function getWeeklyRates(brandId: string): Promise<WeeklyRate[]> {
  const results = await QueryResult.aggregate([
    { $match: { brandId: new mongoose.Types.ObjectId(brandId) } },
    {
      $group: {
        _id: { year: { $isoWeekYear: '$queriedAt' }, week: { $isoWeek: '$queriedAt' } },
        total: { $sum: 1 },
        mentioned: { $sum: { $cond: ['$mentioned', 1, 0] } },
      },
    },
    { $sort: { '_id.year': -1, '_id.week': -1 } },
    { $limit: 2 },
  ])

  return results.map((r) => ({
    week: r._id.week,
    year: r._id.year,
    mentionRate: r.total > 0 ? Math.round((r.mentioned / r.total) * 100) : 0,
  }))
}

export async function checkAndSendAlerts(): Promise<void> {
  console.log('[ALERT] Running mention rate alert check...')

  const brands = await Brand.find({})

  for (const brand of brands) {
    try {
      const user = await User.findOne({ clerkUserId: brand.userId })
      if (!user) continue

      const rates = await getWeeklyRates(String(brand._id))
      if (rates.length < 2) continue

      const [currentWeek, lastWeek] = rates
      const drop = lastWeek.mentionRate - currentWeek.mentionRate

      if (drop >= user.alertThreshold) {
        console.log(`[ALERT] Drop detected for ${brand.name}: ${lastWeek.mentionRate}% → ${currentWeek.mentionRate}%`)

        if (user.alertEmail && user.email) {
          await sendAlertEmail({
            to: user.email,
            brandName: brand.name,
            alertType: 'mention_drop',
            currentRate: currentWeek.mentionRate,
            previousRate: lastWeek.mentionRate,
          })
        }

        if (user.alertWhatsApp && user.whatsappNumber) {
          await sendWhatsAppAlert({
            to: user.whatsappNumber,
            brandName: brand.name,
            alertType: 'mention_drop',
            currentRate: currentWeek.mentionRate,
            previousRate: lastWeek.mentionRate,
          })
        }
      }
    } catch (err: any) {
      console.error(`[ALERT] Failed for brand ${brand.name}:`, err.message)
    }
  }
}
