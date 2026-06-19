import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { normalizeSaudiPhone } from '@/lib/phone';

const schema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string(),
  password: z.string().min(6),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    // Report which field failed so the form can show an explicit message.
    const field = parsed.error.issues[0]?.path[0];
    const code =
      field === 'password'
        ? 'password_short'
        : field === 'name'
          ? 'name_short'
          : field === 'email'
            ? 'email_invalid'
            : 'invalid';
    return NextResponse.json({ error: code }, { status: 400 });
  }
  const { name, email, password } = parsed.data;
  const phone = normalizeSaudiPhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });

  const lower = email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email: lower } });
  if (existing) {
    return NextResponse.json({ error: 'email_taken' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email: lower, phone, passwordHash, role: 'CLIENT' },
  });

  return NextResponse.json({ ok: true });
}
