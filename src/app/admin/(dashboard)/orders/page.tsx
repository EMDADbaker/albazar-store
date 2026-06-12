import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import OrderStatusControl from '@/components/admin/OrderStatusControl';

export const dynamic = 'force-dynamic';

export default async function OrdersAdmin() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Orders</h1>
      <p className="font-mono text-[11px] text-ink/40 mb-8">
        Latest 100. Piece numbers assign on the payment webhook.
      </p>

      <div className="border-t border-ink/[0.08]">
        {orders.length === 0 && (
          <p className="text-[13px] text-ink/40 py-6">No orders yet.</p>
        )}
        {orders.map((o) => {
          const addr = o.addressJson as { fullName?: string; city?: string } | null;
          return (
            <div
              key={o.id}
              className="flex items-center justify-between gap-4 py-4 border-b border-ink/[0.08]"
            >
              <div className="min-w-0">
                <div className="text-[13px] font-medium">
                  {addr?.fullName ?? '—'}{' '}
                  <span className="font-mono text-[11px] text-ink/40">{o.phone}</span>
                </div>
                <div className="font-mono text-[10px] text-ink/40 mt-0.5">
                  {o.items.length} items · {addr?.city ?? '—'} ·{' '}
                  {new Date(o.createdAt).toLocaleString('en-GB')}
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="font-mono text-[12px] text-ink/80">
                  {formatPrice(o.total, 'en')}
                </span>
                <OrderStatusControl id={o.id} status={o.status} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
