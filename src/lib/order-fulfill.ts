import { prisma } from './prisma';

// Single source of truth for confirming a paid order (Hard rules 2 & 3):
// decrement stock, assign sequential piece numbers, release inventory holds,
// mark the order PAID. Called by the verified Paymob webhook and by the demo
// pay route. Idempotent — a second call on an already-paid order is a no-op.
export async function markOrderPaid(
  orderId: string,
  paymentMethod: string,
  paymentId: string,
): Promise<{ ok: true; alreadyPaid: boolean } | { ok: false; error: string }> {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { items: true },
  });
  if (!order) return { ok: false, error: 'not_found' };
  if (order.status !== 'PENDING') return { ok: true, alreadyPaid: true };

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
    const newStock = Math.max(0, (stockOf[item.variantId] ?? 0) - item.quantity);
    ops.push(
      prisma.productVariant.update({ where: { id: item.variantId }, data: { stock: newStock } }),
    );
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
        paymentMethod,
        paymentId,
      },
    }),
  );

  await prisma.$transaction(ops);
  return { ok: true, alreadyPaid: false };
}
