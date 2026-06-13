import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

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

  try {
    const result = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { items: true },
      });
      if (!order) throw new Error('not_found');
      if (order.status !== 'PENDING') {
        return { alreadyPaid: true };
      }

      for (const item of order.items) {
        // Decrement stock (never below zero).
        const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
        const newStock = Math.max(0, (variant?.stock ?? 0) - item.quantity);
        await tx.productVariant.update({
          where: { id: item.variantId },
          data: { stock: newStock },
        });

        // Assign the next piece number for this product (07 / 150).
        const claimed = await tx.orderItem.count({
          where: { productId: item.productId, pieceNumber: { not: null } },
        });
        await tx.orderItem.update({
          where: { id: item.id },
          data: { pieceNumber: claimed + 1 },
        });
      }

      // Release the 10-min soft holds for this checkout.
      await tx.inventoryHold.deleteMany({ where: { checkoutSessionId: order.id } });

      await tx.order.update({
        where: { id: order.id },
        data: {
          status: 'PAID',
          paymentStatus: 'PAID',
          paymentMethod: method,
          paymentId: `demo_${Date.now().toString(36)}`,
        },
      });
      return { alreadyPaid: false };
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'error';
    return NextResponse.json({ error: msg }, { status: msg === 'not_found' ? 404 : 500 });
  }
}
