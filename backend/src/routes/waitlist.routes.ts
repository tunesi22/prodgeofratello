import { Router, Request, Response } from 'express'
import nodemailer from 'nodemailer'
import Waitlist from '../models/Waitlist'

const router = Router()

router.post('/', async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    res.status(400).json({ error: 'Email tidak valid.' })
    return
  }

  const normalizedEmail = email.trim().toLowerCase()

  let isNew = true
  try {
    await Waitlist.create({ email: normalizedEmail })
  } catch (err: any) {
    if (err.code !== 11000) {
      console.error('[WAITLIST] DB error:', err)
      res.status(500).json({ error: 'Gagal mendaftar.' })
      return
    }
    isNew = false
  }

  if (!isNew) {
    res.json({ success: true, alreadyRegistered: true })
    return
  }

  if (process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })

    // 1. Notif ke admin
    transporter.sendMail({
      from: `"Fratello Waitlist" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: 'New Waitlist Sign-up — Fratello',
      html: `
        <div style="font-family:sans-serif;padding:24px;max-width:480px">
          <h2 style="color:#03492c">New Waitlist Sign-up</h2>
          <p>Ada yang baru daftar waitlist Fratello:</p>
          <p style="font-size:20px;font-weight:bold;color:#03492c">${normalizedEmail}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
          <p style="font-size:13px;color:#6b7280">Sent automatically by Fratello backend</p>
        </div>
      `,
    }).catch((err) => console.error('[WAITLIST] Admin email error:', err.message))

    // 2. Konfirmasi ke pendaftar
    transporter.sendMail({
      from: `"Fratello" <${process.env.GMAIL_USER}>`,
      to: normalizedEmail,
      subject: 'Kamu sudah masuk waitlist Fratello!',
      html: `
        <div style="font-family:sans-serif;padding:32px;max-width:480px;background:#ffffff">
          <div style="margin-bottom:24px">
            <svg width="39" height="29" viewBox="0 0 39.2442 28.5414" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="7.13534" height="28.5414" fill="#03492c"/>
              <path d="M39.2441 28.541H10.7031V0H39.2441V28.541ZM16.0547 14.2705H29.4336V18.7305H16.0547V23.1895H33.8926V5.35156H16.0547V14.2705Z" fill="#03492c"/>
            </svg>
          </div>
          <h1 style="color:#03492c;font-size:28px;margin:0 0 12px">Kamu sudah masuk waitlist!</h1>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 20px">
            Makasih udah daftar. Kami akan kasih tau kamu duluan begitu Fratello siap diluncurkan.
          </p>
          <p style="color:#374151;font-size:16px;line-height:1.6;margin:0 0 32px">
            Fratello bantu brand kamu direkomendasiin sama AI — ChatGPT, Gemini, Perplexity, dan Claude.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px"/>
          <p style="color:#9ca3af;font-size:13px;margin:0">
            Made possible by <strong>Nine Ten Studios</strong>
          </p>
        </div>
      `,
    }).catch((err) => console.error('[WAITLIST] Confirmation email error:', err.message))
  }

  res.json({ success: true })
})

export default router
