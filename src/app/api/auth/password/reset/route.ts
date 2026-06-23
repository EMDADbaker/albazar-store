import { NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { verifyCode } from '@/lib/verification';

const schema = z.object({
  email: z.string().email(),
  code: z.string().min(4),
  password: z.string().min(6),
});

// POST { email, code, password } -> verifies the reset code and sets a new password.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const field = parsed.error.issues[0]?.path[0];
    const code = field === 'password' ? 'password_short' : 'invalid';
    return NextResponse.json({ error: code }, { status: 400 });
  }
  const email = parsed.data.email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'code_invalid' }, { status: 400 });

  const ok = await verifyCode(email, 'PASSWORD_RESET', parsed.data.code);
  if (!ok) return NextResponse.json({ error: 'code_invalid' }, { status: 400 });

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  await prisma.user.update({ where: { email }, data: { passwordHash } });

  return NextResponse.json({ ok: true });
}
