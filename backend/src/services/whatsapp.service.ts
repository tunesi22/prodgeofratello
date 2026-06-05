import axios from 'axios'

// WaConnectHub integration — configure WACONNECTHUB_URL + WACONNECTHUB_TOKEN in .env
export async function sendWhatsAppAlert(params: {
  to: string
  brandName: string
  alertType: 'mention_drop' | 'competitor_rise'
  currentRate: number
  previousRate: number
}): Promise<void> {
  const url = process.env.WACONNECTHUB_URL
  const token = process.env.WACONNECTHUB_TOKEN

  if (!url || !token) {
    console.warn('[WHATSAPP] WACONNECTHUB_URL or WACONNECTHUB_TOKEN not set, skipping')
    return
  }

  const { to, brandName, alertType, currentRate, previousRate } = params
  const drop = previousRate - currentRate

  const message = alertType === 'mention_drop'
    ? `⚠️ *GEO Alert — ${brandName}*\n\nMention rate dropped by ${drop}%\nPrevious: ${previousRate}%\nCurrent: ${currentRate}%\n\nLogin to your dashboard to take action.`
    : `⚠️ *GEO Alert — ${brandName}*\n\nCompetitor mention rate rising.\nYour rate: ${currentRate}%\n\nLogin to your dashboard to take action.`

  try {
    await axios.post(
      `${url}/send`,
      { to, message },
      { headers: { Authorization: `Bearer ${token}` }, timeout: 10_000 }
    )
    console.log(`[WHATSAPP] Alert sent to ${to}`)
  } catch (err: any) {
    console.error('[WHATSAPP] Failed to send alert:', err.message)
  }
}
