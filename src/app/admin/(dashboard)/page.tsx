import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/money';

export const dynamic = 'force-dynamic';

const PAID = ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED'] as const;

export default async function AdminOverview() {
  const [
    products, brands, clients, pending, carts,
    paidAgg, pendingAgg, paidItems, wishlist, lowStock, recent,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.brand.count({ where: { active: true } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.cart.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { in: [...PAID] } } }),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PENDING' } }),
    // Only the fields the brand-score aggregation needs — keeps the payload
    // small over the remote DB link.
    prisma.orderItem.findMany({
      where: { order: { status: { in: [...PAID] } } },
      select: { quantity: true, unitPrice: true, product: { select: { brand: { select: { nameEn: true } } } } },
    }),
    prisma.wishlistItem.findMany({
      select: { product: { select: { brand: { select: { nameEn: true } } } } },
    }),
    prisma.productVariant.count({ where: { stock: { lte: 3 } } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 6, include: { items: true, user: true } }),
  ]);

  // ---- Top brands: composite demand score ----
  type Row = { name: string; sold: number; revenue: number; wished: number };
  const map = new Map<string, Row>();
  const bump = (name: string | undefined, f: (r: Row) => void) => {
    const key = name ?? '—';
    const r = map.get(key) ?? { name: key, sold: 0, revenue: 0, wished: 0 };
    f(r);
    map.set(key, r);
  };
  for (const it of paidItems) {
    bump(it.product.brand?.nameEn, (r) => {
      r.sold += it.quantity;
      r.revenue += it.unitPrice * it.quantity;
    });
  }
  for (const w of wishlist) bump(w.product.brand?.nameEn, (r) => (r.wished += 1));
  // score = sold units ×5 + wishlist ×2 (sales weigh more than intent)
  const ranked = [...map.values()]
    .map((r) => ({ ...r, score: r.sold * 5 + r.wished * 2 }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 6);
  const maxScore = ranked[0]?.score ?? 1;

  const kpis = [
    { label: 'Confirmed revenue', value: formatPrice(paidAgg._sum.total ?? 0, 'en'), href: '/admin/orders' },
    { label: 'In unfinished checkouts', value: formatPrice(pendingAgg._sum.total ?? 0, 'en'), href: '/admin/orders', hot: (pendingAgg._sum.total ?? 0) > 0 },
    { label: 'Unfinished checkouts', value: pending, href: '/admin/orders', hot: pending > 0 },
    { label: 'Open carts', value: carts, href: '/admin/members', hot: carts > 0 },
    { label: 'Clients', value: clients, href: '/admin/members' },
    { label: 'Brands', value: brands, href: '/admin/brands' },
    { label: 'Products', value: products, href: '/admin/products' },
    { label: 'Low stock (≤3)', value: lowStock, href: '/admin/products', hot: lowStock > 0 },
  ];

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-6">Overview</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {kpis.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`border p-4 transition-colors ${
              'hot' in s && s.hot ? 'border-accent/50 bg-accent/[0.06] hover:border-accent' : 'border-white/12 hover:border-white/30'
            }`}
          >
            <div className="font-mono text-[10px] tracking-wide uppercase text-white/45 mb-2">{s.label}</div>
            <div className="text-[22px] font-bold tabular-nums">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Top brands */}
        <div>
          <div className="font-mono text-[11px] tracking-label uppercase text-white/50 mb-1">Top brands</div>
          <p className="font-mono text-[9px] text-white/35 mb-4">
            Score = units sold ×5 + wishlist saves ×2. Tap a brand to see its products.
          </p>
          {ranked.length === 0 && <p className="text-[13px] text-white/40">No demand signals yet.</p>}
          <div className="space-y-3">
            {ranked.map((r, i) => (
              <div key={r.name}>
                <div className="flex items-center justify-between text-[12px] mb-1">
                  <span className="font-medium">
                    <span className="text-white/40 font-mono me-2">{String(i + 1).padStart(2, '0')}</span>
                    {r.name}
                  </span>
                  <span className="font-mono text-white/50">{r.score} pts</span>
                </div>
                <div className="h-1.5 bg-white/10">
                  <div className="h-full bg-accent" style={{ width: `${Math.round((r.score / maxScore) * 100)}%` }} />
                </div>
                <div className="font-mono text-[9px] text-white/40 mt-1">
                  {r.sold} sold · {r.wished} wishlisted · {formatPrice(r.revenue, 'en')} revenue
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent orders */}
        <div>
          <div className="font-mono text-[11px] tracking-label uppercase text-white/50 mb-4">Recent orders</div>
          <div className="border-t border-white/12">
            {recent.length === 0 && <p className="text-[13px] text-white/40 py-4">No orders yet.</p>}
            {recent.map((o) => (
              <Link key={o.id} href="/admin/orders" className="flex items-center justify-between gap-3 py-2.5 border-b border-white/12 hover:bg-white/5">
                <div>
                  <span className="font-mono text-[12px]">AZ{o.id.slice(-6).toUpperCase()}</span>
                  <span className="font-mono text-[10px] text-white/40 ms-3">{o.user?.email ?? o.phone}</span>
                </div>
                <div className="flex items-center gap-4 font-mono text-[11px]">
                  <span className={o.status === 'PENDING' ? 'text-accent/80' : 'text-white/50'}>{o.status}</span>
                  <span>{formatPrice(o.total, 'en')}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
