import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { getDisabledPaymentIds } from '@/lib/payment';

const schema = z.object({
  orderId: z.string().min(1),
  method: z.string().min(1),
});

// DEMO payment confirmation. Mirrors exactly what the real Moyasar webhook
// will do on a confirmed payment (Hard rules 2 & 3): decrement stock, assign
// piece numbers, release inventory holds, mark the order PAID. When we wire
// Moyasar for real, this same block runs from the verified webhook instead.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const { orderId, method } = parsed.data;

  // Reject methods the admin has switched off (don't trust the client).
  if ((await getDisabledPaymentIds()).includes(method)) {
    return NextResponse.json({ error: 'method_disabled' }, { status: 400 });
  }

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return NextResponse.json({ error: 'not_found' }, { status: 404 });
    }
    if (order.status !== 'PENDING') {
      return NextResponse.json({ ok: true, alreadyPaid: true });
    }

    // Read current stock + claimed-piece counts BEFORE building the write batch
    // (a batched $transaction works on the Supabase pooler; an interactive one
    // times out across many round-trips).
    const variantIds = [...new Set(order.items.map((i) => i.variantId))];
    const productIds = [...new Set(order.items.map((i) => i.productId))];
    const [variants, counts] = await Promise.all([
      prisma.productVariant.findMany({ where: { id: { in: variantIds } } }),
      Promise.all(
        productIds.map((pid) =>
          prisma.orderItem.count({ where: { productId: pid, pieceNumber: { not: null } } }),
        ),
      ),
    ]);
    const stockOf: Record<string, number> = Object.fromEntries(variants.map((v) => [v.id, v.stock]));
    const claimed: Record<string, number> = Object.fromEntries(
      productIds.map((pid, idx) => [pid, counts[idx]]),
    );

    const ops = [];
    for (const item of order.items) {
      // Decrement stock (never below zero).
      const newStock = Math.max(0, (stockOf[item.variantId] ?? 0) - item.quantity);
      ops.push(
        prisma.productVariant.update({ where: { id: item.variantId }, data: { stock: newStock } }),
      );
      // Assign the next piece number for this product (07 / 150).
      claimed[item.productId] = (claimed[item.productId] ?? 0) + 1;
      ops.push(
        prisma.orderItem.update({
          where: { id: item.id },
          data: { pieceNumber: claimed[item.productId] },
        }),
      );
    }
    ops.push(prisma.inventoryHold.deleteMany({ where: { checkoutSessionId: order.id } }));
    ops.push(
      prisma.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentMethod: method,
          paymentId: `demo_${Date.now().toString(36)}`,
        },
      }),
    );

    await prisma.$transaction(ops);
    return NextResponse.json({ ok: true, alreadyPaid: false });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
