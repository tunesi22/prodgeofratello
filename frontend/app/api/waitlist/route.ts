import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
  }

  try {
    await transporter.sendMail({
      from: `"Fratello Waitlist" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      subject: "New Waitlist Sign-up — Fratello",
      text: `Email baru masuk waitlist: ${email}`,
      html: `
        <div style="font-family:sans-serif;padding:24px;max-width:480px">
          <h2 style="color:#03492c">New Waitlist Sign-up</h2>
          <p>Ada yang daftar waitlist Fratello:</p>
          <p style="font-size:18px;font-weight:bold">${email}</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SMTP error:", err);
    return NextResponse.json({ error: "Gagal mengirim email." }, { status: 500 });
  }
}
