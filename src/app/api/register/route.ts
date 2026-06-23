import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { normalizeSaudiPhone } from '@/lib/phone';
import { verifyCode } from '@/lib/verification';

const schema = z.object({
  name: z.string().min(2),
  // Email is now the required login identifier and must be verified via code.
  email: z.string().email(),
  code: z.string().min(4),
  // Phone is optional (kept for shipping / WhatsApp contact only).
  phone: z.union([z.string(), z.literal('')]).optional(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const code =
      field === 'password'
        ? 'password_short'
        : field === 'name'
          ? 'name_short'
          : field === 'email'
            ? 'email_invalid'
            : field === 'code'
              ? 'code_invalid'
              : 'invalid';
    return NextResponse.json({ error: code }, { status: 400 });
  }
  const { name, password } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  // Phone optional; validate only if provided.
  let phone: string | null = null;
  if (parsed.data.phone && parsed.data.phone.trim()) {
    phone = normalizeSaudiPhone(parsed.data.phone);
    if (!phone) return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });
  }

  if (await prisma.user.findUnique({ where: { email } })) {
    return NextResponse.json({ error: 'email_taken' }, { status: 409 });
  }
  if (phone && (await prisma.user.findUnique({ where: { phone } }))) {
    return NextResponse.json({ error: 'phone_taken' }, { status: 409 });
  }

  // The email must have been verified with the code we emailed.
  const verified = await verifyCode(email, 'EMAIL_VERIFY', parsed.data.code);
  if (!verified) return NextResponse.json({ error: 'code_invalid' }, { status: 400 });

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, phone, passwordHash, role: 'CLIENT' },
  });

  return NextResponse.json({ ok: true });
}
