import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { normalizeSaudiPhone } from '@/lib/phone';

const schema = z.object({
  phone: z.string(),
  email: z.string().email().optional(),
  source: z.string().optional(),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const phone = normalizeSaudiPhone(parsed.data.phone);
  if (!phone) {
    return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });
  }

  try {
    await prisma.vaultMember.upsert({
      where: { phone },
      create: {
        phone,
        email: parsed.data.email,
        source: parsed.data.source ?? 'home',
        whatsappOptIn: true,
      },
      update: {}, // already a member — idempotent
    });
  } catch {
    // DB not connected yet (early dev): accept the lead without failing the UX.
    return NextResponse.json({ ok: true, persisted: false });
  }

  return NextResponse.json({ ok: true, persisted: true });
}
