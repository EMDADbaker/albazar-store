import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { issueCode } from '@/lib/verification';
import { sendEmail, codeEmail, emailLive } from '@/lib/email';

const schema = z.object({ email: z.string().email() });

// POST { email } -> emails a password-reset code if an account exists.
// Always returns ok (no account enumeration); only emails when a user exists.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'email_invalid' }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const code = await issueCode(email, 'PASSWORD_RESET');
    if (code) {
      const { subject, html, text } = codeEmail(code, 'reset');
      await sendEmail({ to: email, subject, html, text });
    }
  }

  return NextResponse.json({ ok: true, demo: !emailLive });
}
