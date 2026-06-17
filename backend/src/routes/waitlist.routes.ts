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
    isNew = false // duplicate, email sudah terdaftar
  }

  if (!isNew) {
    res.json({ success: true, alreadyRegistered: true })
    return
  }

  // kirim notif hanya untuk email baru
  if (isNew && process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD) {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    })
    transporter.sendMail({
      from: `"Fratello Waitlist" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: 'New Waitlist Sign-up — Fratello',
      html: `
        <div style="font-family:sans-serif;padding:24px;max-width:480px">
          <h2 style="color:#03492c">New Waitlist Sign-up 🎉</h2>
          <p>Ada yang baru daftar waitlist Fratello:</p>
          <p style="font-size:20px;font-weight:bold;color:#03492c">${normalizedEmail}</p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
          <p style="font-size:13px;color:#6b7280">Sent automatically by Fratello backend</p>
        </div>
      `,
    }).catch((err) => console.error('[WAITLIST] Email error:', err.message))
  }

  res.json({ success: true })
})

export default router
