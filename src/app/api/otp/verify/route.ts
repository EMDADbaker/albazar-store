import { NextResponse } from 'next/server';
import { normalizeSaudiPhone } from '@/lib/phone';
import { checkVerification } from '@/lib/otp';

// POST { phone, code } -> { approved } via Twilio Verify (or demo acceptance).
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const phone = normalizeSaudiPhone(String(body?.phone ?? ''));
  const code = String(body?.code ?? '').replace(/[^\d]/g, '');
  if (!phone) return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });
  if (!code) return NextResponse.json({ approved: false });

  const { approved } = await checkVerification(phone, code);
  return NextResponse.json({ approved });
}
