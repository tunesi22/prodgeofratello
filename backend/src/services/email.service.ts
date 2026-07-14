import nodemailer from 'nodemailer'

/**
 * Transactional email (password reset, mention-rate alerts). Uses the same
 * Gmail transporter pattern as waitlist.routes.ts / demo.routes.ts
 * (GMAIL_USER / GMAIL_APP_PASSWORD) — previously routed through Resend, but
 * RESEND_API_KEY was never configured in production, so these emails were
 * silently never sent.
 */

let transporter: nodemailer.Transporter | null = null

function getTransporter(): nodemailer.Transporter | null {
  if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    })
  }
  return transporter
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
  const t = getTransporter()
  if (!t) {
    console.error('[EMAIL] GMAIL_USER / GMAIL_APP_PASSWORD not configured, skipping alert email')
    return
  }

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
    await t.sendMail({ from: `"Fratello" <${process.env.GMAIL_USER}>`, to, subject, html })
    console.log(`[EMAIL] Alert sent to ${to}`)
  } catch (err: any) {
    console.error('[EMAIL] Failed to send alert:', err.message)
  }
}

export async function sendPasswordResetEmail(params: {
  to: string
  resetUrl: string
}): Promise<void> {
  const { to, resetUrl } = params
  const t = getTransporter()
  if (!t) {
    console.error('[EMAIL] GMAIL_USER / GMAIL_APP_PASSWORD not configured, skipping password reset email')
    return
  }
  const subject = 'Reset your Fratello password'

  // Inline hex/styles are intentional here: email clients do not support the
  // design-token CSS variables, so transactional email is exempt from the UI
  // design-system rules and must ship self-contained inline styles.
  const html = `
    <div style="font-family: -apple-system, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 8px;">
      <h2 style="color: #111827; font-weight: 600; margin: 0 0 8px;">Reset your password</h2>
      <p style="color: #4b5563; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
        We received a request to reset the password for your Fratello account. Click the
        button below to choose a new password. This link expires in 1 hour.
      </p>
      <a href="${resetUrl}" style="display: inline-block; background: #06472c; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 600; padding: 12px 24px; border-radius: 8px;">
        Reset password
      </a>
      <p style="color: #6b7280; font-size: 13px; line-height: 1.6; margin: 24px 0 0;">
        If you did not request this, you can safely ignore this email — your password
        will stay the same. For security, the link can only be used once.
      </p>
      <p style="color: #9ca3af; font-size: 12px; line-height: 1.6; margin: 16px 0 0; word-break: break-all;">
        Or paste this link into your browser:<br />${resetUrl}
      </p>
    </div>
  `

  try {
    await t.sendMail({ from: `"Fratello" <${process.env.GMAIL_USER}>`, to, subject, html })
    console.log(`[EMAIL] Password reset sent to ${to}`)
  } catch (err: any) {
    console.error('[EMAIL] Failed to send password reset:', err.message)
  }
}
