import { Resend } from 'resend'

let resend: Resend

function getResend(): Resend {
  if (!resend) resend = new Resend(process.env.RESEND_API_KEY)
  return resend
}

export async function sendAlertEmail(params: {
  to: string
  brandName: string
  alertType: 'mention_drop' | 'competitor_rise'
  currentRate: number
  previousRate: number
  model?: string
}): Promise<void> {
  const { to, brandName, alertType, currentRate, previousRate, model } = params
  const from = process.env.EMAIL_FROM || 'alerts@yourdomain.com'

  const subject = alertType === 'mention_drop'
    ? `⚠️ ${brandName} mention rate dropped ${previousRate - currentRate}%`
    : `⚠️ Competitor mention rate rising for ${brandName}`

  const html = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #111;">${subject}</h2>
      <p>Brand: <strong>${brandName}</strong>${model ? ` — ${model}` : ''}</p>
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb;">Previous Rate</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb;"><strong>${previousRate}%</strong></td>
        </tr>
        <tr>
          <td style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb;">Current Rate</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; color: #dc2626;"><strong>${currentRate}%</strong></td>
        </tr>
        <tr>
          <td style="padding: 12px; background: #f9fafb; border: 1px solid #e5e7eb;">Change</td>
          <td style="padding: 12px; border: 1px solid #e5e7eb; color: #dc2626;"><strong>-${previousRate - currentRate}%</strong></td>
        </tr>
      </table>
      <p>Login to your GEO Platform dashboard to generate optimized content for this gap.</p>
    </div>
  `

  try {
    await getResend().emails.send({ from, to, subject, html })
    console.log(`[EMAIL] Alert sent to ${to}`)
  } catch (err: any) {
    console.error('[EMAIL] Failed to send alert:', err.message)
  }
}
