import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/admin-auth';

// Records a first-party behaviour event (view | search | add_to_cart).
// Logged-out visitors get a stable anon id cookie so personalization works
// before sign-up and merges to their account on login.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const type = body?.type as string | undefined;
  if (!type) return NextResponse.json({ ok: false }, { status: 400 });

  const user = await getCurrentUser();
  const jar = cookies();
  let anonId = jar.get('albazar_anon')?.value;
  const res = NextResponse.json({ ok: true });
  if (!anonId) {
    anonId = crypto.randomUUID();
    res.cookies.set('albazar_anon', anonId, { maxAge: 60 * 60 * 24 * 365, httpOnly: true, sameSite: 'lax' });
  }

  try {
    await prisma.event.create({
      data: {
        userId: user?.id ?? null,
        anonId: user?.id ? null : anonId,
        type,
        productId: (body?.productId as string) ?? null,
        query: (body?.query as string) ?? null,
      },
    });
  } catch {
    /* tracking is best-effort */
  }
  return res;
}
