import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { normalizeSaudiPhone } from '@/lib/phone';

const schema = z.object({
  name: z.string().min(2),
  // Email is now optional — empty string is allowed and stored as null.
  email: z.union([z.string().email(), z.literal('')]).optional(),
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
  const { name, password } = parsed.data;
  const email = parsed.data.email ? parsed.data.email.toLowerCase() : null;

  // Phone is required and is the login identifier.
  const phone = normalizeSaudiPhone(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });

  if (await prisma.user.findUnique({ where: { phone } })) {
    return NextResponse.json({ error: 'phone_taken' }, { status: 409 });
  }
  if (email && (await prisma.user.findUnique({ where: { email } }))) {
    return NextResponse.json({ error: 'email_taken' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, phone, passwordHash, role: 'CLIENT' },
  });

  return NextResponse.json({ ok: true });
}
