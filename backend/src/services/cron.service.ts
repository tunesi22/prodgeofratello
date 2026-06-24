import cron from 'node-cron'
import Brand from '../models/Brand'
import { triggerScan } from './scan.service'
import { checkAndSendAlerts } from './alert.service'

export function startCronJobs(): void {
  // Run every day at 2:00 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[CRON] Running daily auto-scan check...')
    await runAutoScans('daily')
  })

  // Run every Monday at 3:00 AM
  cron.schedule('0 3 * * 1', async () => {
    console.log('[CRON] Running weekly auto-scan check...')
    await runAutoScans('weekly')
  })

  // Run alert checks every Monday at 4:00 AM (after weekly scan completes)
  cron.schedule('0 4 * * 1', async () => {
    console.log('[CRON] Running weekly alert checks...')
    await checkAndSendAlerts()
  })

  console.log('[CRON] Scheduled jobs started (daily @ 2AM, weekly @ Monday 3AM, alerts @ Monday 4AM)')
}

async function runAutoScans(frequency: 'daily' | 'weekly'): Promise<void> {
  try {
    const brands = await Brand.find({ scanFrequency: frequency })

    if (brands.length === 0) {
      console.log(`[CRON] No brands with ${frequency} frequency`)
      return
    }

    console.log(`[CRON] Auto-scanning ${brands.length} brands (${frequency})`)

    for (const brand of brands) {
      try {
        const { jobsEnqueued } = await triggerScan(String(brand._id))
        await Brand.findByIdAndUpdate(brand._id, { lastScannedAt: new Date() })
        console.log(`[CRON] Queued ${jobsEnqueued} jobs for brand: ${brand.name}`)
      } catch (err: any) {
        console.error(`[CRON] Failed to scan brand ${brand.name}:`, err.message)
      }
    }
  } catch (err: any) {
    console.error(`[CRON] Auto-scan failed:`, err.message)
  }
}
