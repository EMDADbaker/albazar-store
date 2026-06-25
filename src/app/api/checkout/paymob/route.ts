import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { createIntention, checkoutUrl, paymobLive } from '@/lib/paymob';

const schema = z.object({ orderId: z.string().min(1) });

// Creates a Paymob payment intention for a PENDING order and returns the
// hosted-checkout URL the client should redirect to.
export async function POST(req: Request) {
  if (!paymobLive) {
    return NextResponse.json({ error: 'paymob_not_configured' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: 'not_found' }, { status: 404 });
  if (order.status !== 'PENDING') {
    return NextResponse.json({ error: 'already_paid' }, { status: 409 });
  }

  // Public base URL for callbacks. Prefer the configured app URL (set in prod);
  // fall back to the request origin for local dev.
  const base = (process.env.NEXTAUTH_URL ?? new URL(req.url).origin).replace(/\/$/, '');
  const addr = (order.addressJson ?? {}) as Record<string, string>;
  const [firstName, ...rest] = (addr.fullName ?? 'Customer').trim().split(/\s+/);

  const intention = await createIntention({
    amount: order.total, // halalas — matches Paymob's smallest-unit "amount"
    orderId: order.id,
    notificationUrl: `${base}/api/webhooks/paymob`,
    redirectionUrl: `${base}/checkout/confirmation?order=${order.id}`,
    billing: {
      firstName,
      lastName: rest.join(' ') || '-',
      phone: order.phone,
      email: order.email ?? 'no-reply@albazars.com',
      city: addr.city ?? 'NA',
      street: addr.street ?? 'NA',
    },
    items: order.items.map((it) => ({
      name: it.product.nameEn.slice(0, 50),
      amount: it.unitPrice,
      quantity: it.quantity,
    })),
  });

  if (!intention) {
    return NextResponse.json({ error: 'intention_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, url: checkoutUrl(intention.clientSecret) });
}
