import { Router, Request, Response } from 'express'
import nodemailer from 'nodemailer'
import Waitlist from '../models/Waitlist'

const router = Router()

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

router.post('/', async (req: Request, res: Response) => {
  const { email } = req.body as { email?: string }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    res.status(400).json({ error: 'Email tidak valid.' })
    return
  }

  const normalizedEmail = email.trim().toLowerCase()

  try {
    await Waitlist.create({ email: normalizedEmail })
  } catch (err: any) {
    if (err.code !== 11000) {
      console.error('[WAITLIST] DB error:', err)
      res.status(500).json({ error: 'Gagal mendaftar.' })
      return
    }
    // duplicate — still return success (idempotent)
  }

  // fire-and-forget notification email
  if (process.env.GMAIL_USER) {
    transporter.sendMail({
      from: `"Fratello Waitlist" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: 'New Waitlist Sign-up — Fratello',
      html: `<div style="font-family:sans-serif;padding:24px"><h2 style="color:#03492c">New Waitlist Sign-up</h2><p style="font-size:18px;font-weight:bold">${normalizedEmail}</p></div>`,
    }).catch((err) => console.error('[WAITLIST] Email error:', err))
  }

  res.json({ success: true })
})

export default router
