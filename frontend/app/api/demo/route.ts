import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

/**
 * "Book a demo" intro form. Emails the submitted details to the sales inbox with
 * a fixed subject. Uses the same Gmail transporter as the waitlist route
 * (GMAIL_USER / GMAIL_APP_PASSWORD). No DB — this is a notify-only endpoint.
 */

const TO_EMAIL = 'hariadi.alessandro@gmail.com'
const SUBJECT = 'Fratello GEO Intro'

// --- basic IP rate limit (mirrors the waitlist route) -----------------------
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const ipHits = new Map<string, { count: number; resetAt: number }>()

function rateLimitOk(ip: string): boolean {
  const now = Date.now()
  if (ipHits.size > 5000) {
    for (const [key, entry] of ipHits) if (now > entry.resetAt) ipHits.delete(key)
  }
  const existing = ipHits.get(ip)
  if (!existing || now > existing.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }
  if (existing.count >= RATE_LIMIT_MAX) return false
  existing.count += 1
  return true
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') || 'unknown'
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
})

interface DemoPayload {
  name: string
  email: string
  phone: string
  companyType: string
  companySize: string
  source: string
  message: string
}

function esc(s: string): string {
  return s.replace(/[<>&]/g, (c) => (c === '<' ? '&lt;' : c === '>' ? '&gt;' : '&amp;'))
}

function emailHtml(d: DemoPayload): string {
  const row = (label: string, value: string): string =>
    `<tr>
       <td style="padding:10px 0;color:#888;font-size:13px;width:170px;vertical-align:top;">${esc(label)}</td>
       <td style="padding:10px 0;color:#1a1a1a;font-size:15px;font-weight:500;vertical-align:top;">${value ? esc(value) : '—'}</td>
     </tr>`
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#599e81,#03492c);padding:30px 40px;">
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Fratello GEO</p>
            <h1 style="margin:6px 0 0;color:#fff;font-size:24px;font-weight:500;">Permintaan Demo Baru</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 40px 36px;">
            <table width="100%" cellpadding="0" cellspacing="0">
              ${row('Nama', d.name)}
              ${row('Email', d.email)}
              ${row('Nomor telepon', d.phone)}
              ${row('Jenis perusahaan', d.companyType)}
              ${row('Ukuran perusahaan', d.companySize)}
              ${row('Sumber', d.source)}
              ${row('Permintaan khusus', d.message)}
            </table>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  if (!rateLimitOk(clientIp(req))) {
    return NextResponse.json({ error: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' }, { status: 429 })
  }

  let body: Partial<Record<keyof DemoPayload, unknown>>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Data tidak valid.' }, { status: 400 })
  }

  const name = typeof body.name === 'string' ? body.name.trim() : ''
  const email = typeof body.email === 'string' ? body.email.trim() : ''
  if (!name) return NextResponse.json({ error: 'Nama wajib diisi.' }, { status: 400 })
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: 'Email tidak valid.' }, { status: 400 })
  }

  const str = (v: unknown): string => (typeof v === 'string' ? v.trim().slice(0, 2000) : '')
  const payload: DemoPayload = {
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    phone: str(body.phone),
    companyType: str(body.companyType),
    companySize: str(body.companySize),
    source: str(body.source),
    message: str(body.message),
  }

  try {
    await transporter.sendMail({
      from: `"Fratello GEO" <${process.env.GMAIL_USER}>`,
      to: TO_EMAIL,
      replyTo: payload.email,
      subject: SUBJECT,
      html: emailHtml(payload),
    })
    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[DEMO] Error:', err)
    return NextResponse.json({ error: 'Gagal mengirim, silakan coba lagi.' }, { status: 500 })
  }
}
