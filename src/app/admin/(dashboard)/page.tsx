import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const [drops, products, orders, pending, clients, vaultPhones, vaultUsers, paidAgg, pendingAgg, carts, recent] =
    await Promise.all([
      prisma.drop.count(),
      prisma.product.count(),
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.user.count({ where: { role: 'CLIENT' } }),
      prisma.vaultMember.count(),
      prisma.user.count({ where: { vaultOptIn: true } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: { notIn: ['CANCELLED', 'PENDING'] } } }),
      prisma.order.aggregate({ _sum: { total: true }, where: { status: 'PENDING' } }),
      prisma.cart.count(),
      prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 5, include: { items: true, user: true } }),
    ]);

  const liveDrop = await prisma.drop.findFirst({ where: { status: 'LIVE' } });

  const stats = [
    { label: 'Orders', value: orders, href: '/admin/orders' },
    { label: 'Unfinished checkouts', value: pending, href: '/admin/orders', hot: pending > 0 },
    { label: 'Open carts', value: carts, href: '/admin/members', hot: carts > 0 },
    { label: 'Clients', value: clients, href: '/admin/members' },
    { label: 'Vault members', value: vaultPhones + vaultUsers, href: '/admin/vault' },
    { label: 'Products', value: products, href: '/admin/products' },
    { label: 'Drops', value: drops, href: '/admin/drops' },
    { label: 'Hero slides', value: '→', href: '/admin/hero' },
  ];

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Overview</h1>
      <p className="font-mono text-[11px] text-ink/40 mb-8">
        {liveDrop ? `Live now — ${liveDrop.nameEn}` : 'No drop is live'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className={`border p-4 transition-colors ${
              'hot' in s && s.hot
                ? 'border-accent/40 bg-accent/[0.04] hover:border-accent'
                : 'border-ink/[0.08] hover:border-ink/25'
            }`}
          >
            <div className="font-mono text-[10px] tracking-wide uppercase text-ink/40 mb-2">
              {s.label}
            </div>
            <div className="text-[26px] font-bold tabular-nums">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-3 mb-8 max-w-2xl">
        <div className="border border-ink/[0.08] p-5">
          <div className="font-mono text-[10px] tracking-wide uppercase text-ink/40 mb-2">
            Confirmed revenue (incl. VAT)
          </div>
          <div className="text-[24px] font-bold font-mono">
            {formatPrice(paidAgg._sum.total ?? 0, 'en')}
          </div>
        </div>
        <div className="border border-accent/25 p-5">
          <div className="font-mono text-[10px] tracking-wide uppercase text-accent/70 mb-2">
            Sitting in unfinished checkouts
          </div>
          <div className="text-[24px] font-bold font-mono">
            {formatPrice(pendingAgg._sum.total ?? 0, 'en')}
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="font-mono text-[10px] tracking-wide uppercase text-ink/40 mb-3">
        Recent orders
      </div>
      <div className="border-t border-ink/[0.08]">
        {recent.length === 0 && <p className="text-[13px] text-ink/40 py-4">No orders yet.</p>}
        {recent.map((o) => (
          <Link
            key={o.id}
            href="/admin/orders"
            className="flex items-center justify-between gap-3 py-3 border-b border-ink/[0.08] hover:bg-ink/[0.03] transition-colors"
          >
            <div>
              <span className="font-mono text-[12px]">AZ{o.id.slice(-6).toUpperCase()}</span>
              <span className="font-mono text-[10px] text-ink/40 ms-3">
                {o.user?.email ?? o.phone} · {o.items.length} items
              </span>
            </div>
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <span className={o.status === 'PENDING' ? 'text-accent/80' : 'text-ink/50'}>
                {o.status}
              </span>
              <span>{formatPrice(o.total, 'en')}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
