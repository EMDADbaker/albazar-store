import { NextResponse } from 'next/server';
import { normalizeSaudiPhone } from '@/lib/phone';
import { startVerification, otpLive } from '@/lib/otp';

// POST { phone } -> sends a WhatsApp OTP (Twilio Verify), or no-ops in demo mode.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const phone = normalizeSaudiPhone(String(body?.phone ?? ''));
  if (!phone) return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });

  const { ok } = await startVerification(phone);
  if (!ok) return NextResponse.json({ error: 'send_failed' }, { status: 502 });
  return NextResponse.json({ ok: true, demo: !otpLive });
}
