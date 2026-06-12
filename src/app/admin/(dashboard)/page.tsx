import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/money';

export const dynamic = 'force-dynamic';

export default async function AdminOverview() {
  const [drops, products, orders, vault, paidAgg] = await Promise.all([
    prisma.drop.count(),
    prisma.product.count(),
    prisma.order.count(),
    prisma.vaultMember.count(),
    prisma.order.aggregate({ _sum: { total: true }, where: { status: { not: 'CANCELLED' } } }),
  ]);

  const liveDrop = await prisma.drop.findFirst({ where: { status: 'LIVE' } });

  const stats = [
    { label: 'Drops', value: drops, href: '/admin/drops' },
    { label: 'Products', value: products, href: '/admin/products' },
    { label: 'Orders', value: orders, href: '/admin/orders' },
    { label: 'Vault members', value: vault, href: '/admin/vault' },
  ];

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Overview</h1>
      <p className="font-mono text-[11px] text-ink/40 mb-8">
        {liveDrop ? `Live now — ${liveDrop.nameEn}` : 'No drop is live'}
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
        {stats.map((s) => (
          <Link
            key={s.label}
            href={s.href}
            className="border border-ink/[0.08] p-4 hover:border-ink/25 transition-colors"
          >
            <div className="font-mono text-[10px] tracking-wide uppercase text-ink/40 mb-2">
              {s.label}
            </div>
            <div className="text-[26px] font-bold tabular-nums">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="border border-ink/[0.08] p-5 max-w-xs">
        <div className="font-mono text-[10px] tracking-wide uppercase text-ink/40 mb-2">
          Gross revenue (incl. VAT)
        </div>
        <div className="text-[24px] font-bold font-mono">
          {formatPrice(paidAgg._sum.total ?? 0, 'en')}
        </div>
      </div>
    </div>
  );
}
