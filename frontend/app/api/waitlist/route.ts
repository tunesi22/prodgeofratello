import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import fs from "fs/promises";
import path from "path";

const WAITLIST_FILE = path.join(process.cwd(), "waitlist.json");

// Simple in-memory, per-IP fixed-window rate limit. This is a single-instance
// mitigation (resets on redeploy and is not shared across instances); it exists
// to blunt email/SMTP-quota abuse, not as a hard guarantee. For a stronger
// guarantee move this to Redis or a managed limiter.
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const ipHits = new Map<string, { count: number; resetAt: number }>();

function rateLimitOk(ip: string): boolean {
  const now = Date.now();
  // Opportunistic cleanup so the map cannot grow unbounded across many IPs.
  if (ipHits.size > 5000) {
    for (const [key, entry] of ipHits) if (now > entry.resetAt) ipHits.delete(key);
  }
  const existing = ipHits.get(ip);
  if (!existing || now > existing.resetAt) {
    ipHits.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return true;
  }
  if (existing.count >= RATE_LIMIT_MAX) return false;
  existing.count += 1;
  return true;
}

function clientIp(req: NextRequest): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

async function getWaitlist(): Promise<string[]> {
  try {
    const data = await fs.readFile(WAITLIST_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function addToWaitlist(email: string): Promise<void> {
  const list = await getWaitlist();
  list.push(email);
  await fs.writeFile(WAITLIST_FILE, JSON.stringify(list, null, 2));
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
});

function ownerEmailHtml(email: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#599e81,#03492c);padding:32px 40px;text-align:center;">
            <p style="margin:0;color:rgba(255,255,255,0.7);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Fratello</p>
            <h1 style="margin:8px 0 0;color:#ffffff;font-size:28px;font-weight:400;">New Sign-up 🎉</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;">
            <p style="margin:0 0 8px;color:#666;font-size:13px;text-transform:uppercase;letter-spacing:1px;">Email Pendaftar</p>
            <p style="margin:0 0 28px;color:#03492c;font-size:20px;font-weight:600;">${email}</p>
            <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
            <p style="margin:0;color:#999;font-size:13px;">Dikirim otomatis dari Fratello Waitlist System</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function userEmailHtml(email: string) {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f0;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f0;padding:40px 16px;">
    <tr><td align="center">
      <table width="520" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#599e81,#03492c);padding:40px;text-align:center;">
            <p style="margin:0 0 12px;color:rgba(255,255,255,0.75);font-size:12px;letter-spacing:3px;text-transform:uppercase;">Coming June</p>
            <h1 style="margin:0;color:#ffffff;font-size:48px;font-weight:300;font-style:italic;font-family:Georgia,'Times New Roman',serif;">Fratello</h1>
            <p style="margin:16px 0 0;color:rgba(255,255,255,0.85);font-size:15px;line-height:1.5;">Bikin brand kamu direkomendasiin sama AI,<br>dipilih sama manusia.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <h2 style="margin:0 0 12px;color:#1a1a1a;font-size:22px;font-weight:600;">Kamu udah masuk waitlist! 🎉</h2>
            <p style="margin:0 0 24px;color:#555;font-size:15px;line-height:1.7;">Hei <strong>${email}</strong>,<br><br>
            Makasih udah daftar waitlist Fratello. Kamu jadi salah satu dari yang pertama tahu saat kami launch.<br><br>
            Kami bakal hubungi kamu langsung begitu Fratello siap. Stay tuned!</p>
            <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
              <tr>
                <td style="background:linear-gradient(135deg,#599e81,#03492c);border-radius:100px;padding:14px 32px;">
                  <a href="https://nineten-studios.com/fratello" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;">Lihat Halaman Fratello →</a>
                </td>
              </tr>
            </table>
            <hr style="border:none;border-top:1px solid #eee;margin:0 0 24px;">
            <p style="margin:0;color:#bbb;font-size:12px;line-height:1.6;">Email ini dikirim karena kamu mendaftar di waitlist Fratello.<br>Kamu tidak perlu melakukan apa-apa lagi.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f9f9f7;padding:20px 40px;text-align:center;">
            <p style="margin:0;color:#bbb;font-size:12px;">© 2026 Fratello · Nineten Studios</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export async function POST(req: NextRequest) {
  if (!rateLimitOk(clientIp(req))) {
    return NextResponse.json(
      { error: "Terlalu banyak percobaan. Silakan coba lagi nanti." },
      { status: 429 },
    );
  }

  let email: unknown;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
  }

  if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return NextResponse.json({ error: "Email tidak valid." }, { status: 400 });
  }

  // Uniform success response whether or not the email is already registered, so
  // the endpoint cannot be used to enumerate which addresses exist. Already
  // registered addresses short-circuit here (no duplicate emails sent).
  const waitlist = await getWaitlist();
  if (waitlist.includes(email.toLowerCase())) {
    return NextResponse.json({ success: true });
  }

  try {
    await Promise.all([
      transporter.sendMail({
        from: `"Fratello" <${process.env.GMAIL_USER}>`,
        to: process.env.GMAIL_USER,
        subject: `New Waitlist Sign-up, ${email}`,
        html: ownerEmailHtml(email),
      }),
      transporter.sendMail({
        from: `"Fratello" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: "Kamu udah masuk waitlist Fratello! 🎉",
        html: userEmailHtml(email),
      }),
    ]);

    await addToWaitlist(email.toLowerCase());

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("SMTP error:", err);
    return NextResponse.json({ error: "Gagal mengirim email." }, { status: 500 });
  }
}
