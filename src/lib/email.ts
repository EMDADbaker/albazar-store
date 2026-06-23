// Transactional email via Resend. Until RESEND_API_KEY is set the flow runs in
// DEMO mode: nothing is sent, the message is logged to the server console so
// dev/staging works without a provider.
//
// To go live, set in the environment (server-side only):
//   RESEND_API_KEY        — from https://resend.com/api-keys
//   EMAIL_FROM            — a verified sender, e.g. "ALBAZAR <noreply@albazar.sa>"
// and verify your sending domain in the Resend dashboard (DNS records).

const API_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.EMAIL_FROM ?? 'ALBAZAR <onboarding@resend.dev>';

export const emailLive = Boolean(API_KEY);

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ ok: boolean }> {
  if (!emailLive) {
    // Demo: surface the content in logs instead of sending.
    console.info(
      `[email:demo] to=${opts.to} subject="${opts.subject}"\n${opts.text}`,
    );
    return { ok: true };
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: FROM,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
        text: opts.text,
      }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}

// Bilingual (ar + en) verification-code email. Keeps the brand voice minimal.
export function codeEmail(code: string, kind: 'verify' | 'reset') {
  const titleAr = kind === 'verify' ? 'رمز تفعيل حسابك' : 'رمز استعادة كلمة المرور';
  const titleEn = kind === 'verify' ? 'Verify your account' : 'Reset your password';
  const subject = `ALBAZAR — ${code}`;
  const text =
    `${titleEn}\nYour code: ${code}\nExpires in 10 minutes.\n\n` +
    `${titleAr}\nرمزك: ${code}\nصالح لمدة ١٠ دقائق.`;
  const html = `
    <div style="background:#080808;color:#f0f0f0;font-family:Arial,sans-serif;padding:40px 24px;text-align:center">
      <div style="font-weight:bold;letter-spacing:3px;font-size:22px;margin-bottom:24px">ALBAZAR</div>
      <div style="color:#C8A050;font-size:13px;letter-spacing:2px;text-transform:uppercase;margin-bottom:8px">${titleEn}</div>
      <div style="color:#C8A050;font-size:13px;margin-bottom:24px" dir="rtl">${titleAr}</div>
      <div style="font-size:38px;font-weight:bold;letter-spacing:10px;font-family:monospace;margin:16px 0">${code}</div>
      <div style="color:#888;font-size:12px;margin-top:24px">Expires in 10 minutes · صالح لمدة ١٠ دقائق</div>
    </div>`;
  return { subject, html, text };
}
