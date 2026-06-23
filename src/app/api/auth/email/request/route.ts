import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { issueCode } from '@/lib/verification';
import { sendEmail, codeEmail, emailLive } from '@/lib/email';

const schema = z.object({ email: z.string().email() });

// POST { email } -> emails a 6-digit verification code for registration.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'email_invalid' }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: 'email_taken' }, { status: 409 });
  }

  const code = await issueCode(email, 'EMAIL_VERIFY');
  if (!code) return NextResponse.json({ error: 'too_soon' }, { status: 429 });

  const { subject, html, text } = codeEmail(code, 'verify');
  const { ok } = await sendEmail({ to: email, subject, html, text });
  if (!ok) return NextResponse.json({ error: 'send_failed' }, { status: 502 });

  return NextResponse.json({ ok: true, demo: !emailLive });
}
