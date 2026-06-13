import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import OrderStatusControl from '@/components/admin/OrderStatusControl';

export const dynamic = 'force-dynamic';

export default async function OrdersAdmin() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: { include: { product: true } }, user: true },
    take: 100,
  });

  const paid = orders.filter((o) => o.status !== 'PENDING' && o.status !== 'CANCELLED').length;
  const pending = orders.filter((o) => o.status === 'PENDING').length;

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Orders</h1>
      <p className="font-mono text-[11px] text-ink/40 mb-8">
        Latest 100 · {paid} paid · {pending} unfinished. Expand a row for items,
        piece numbers, and the shipping address.
      </p>

      <div className="border-t border-ink/[0.08]">
        {orders.length === 0 && (
          <p className="text-[13px] text-ink/40 py-6">No orders yet.</p>
        )}
        {orders.map((o) => {
          const addr = o.addressJson as Record<string, string> | null;
          return (
            <details key={o.id} className="border-b border-ink/[0.08] group">
              <summary className="flex items-center justify-between gap-4 py-4 cursor-pointer list-none">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium flex items-center gap-2">
                    AZ{o.id.slice(-6).toUpperCase()}
                    <span className="font-normal text-ink/60">
                      {addr?.fullName ?? o.user?.name ?? '—'}
                    </span>
                    {o.status === 'PENDING' && (
                      <span className="font-mono text-[8px] tracking-wide uppercase bg-accent text-bg px-1.5 py-0.5">
                        unfinished
                      </span>
                    )}
                  </div>
                  <div className="font-mono text-[10px] text-ink/40 mt-0.5">
                    {o.items.length} items · {o.phone} ·{' '}
                    {o.paymentMethod ? o.paymentMethod.toUpperCase() : 'unpaid'} ·{' '}
                    {new Date(o.createdAt).toLocaleString('en-GB')}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-[12px] text-ink/80">
                    {formatPrice(o.total, 'en')}
                  </span>
                  <OrderStatusControl id={o.id} status={o.status} />
                </div>
              </summary>

              <div className="pb-4 pl-1 grid sm:grid-cols-2 gap-5">
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-wide text-ink/30 mb-2">
                    Pieces
                  </div>
                  <div className="space-y-1.5">
                    {o.items.map((it) => (
                      <div key={it.id} className="flex justify-between gap-3 font-mono text-[11px]">
                        <span className="text-ink/70 truncate">
                          {it.product.nameEn} · {it.product.sku}
                        </span>
                        <span className="text-accent/90 whitespace-nowrap">
                          {it.pieceNumber
                            ? `${String(it.pieceNumber).padStart(2, '0')} / ${it.product.totalPieces}`
                            : `— ×${it.quantity}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[9px] uppercase tracking-wide text-ink/30 mb-2">
                    Ship to
                  </div>
                  <div className="font-mono text-[11px] text-ink/60 leading-relaxed">
                    {addr
                      ? `${addr.building ?? ''} ${addr.street ?? ''}, ${addr.district ?? ''}, ${addr.city ?? ''} ${addr.postalCode ?? ''}`
                      : '—'}
                    {o.user?.email && <div className="text-ink/40 mt-1">{o.user.email}</div>}
                  </div>
                </div>
              </div>
            </details>
          );
        })}
      </div>
    </div>
  );
}
