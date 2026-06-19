import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { formatPrice, inclVat } from '@/lib/money';

export const dynamic = 'force-dynamic';

type CartLine = { nameEn?: string; size?: string; qty?: number };

export default async function MemberDetail({ params: { id } }: { params: { id: string } }) {
  // user + view-history are independent (both keyed on the route id) — run them
  // in parallel so the page pays one DB round-trip instead of two.
  const [user, views] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      include: {
        orders: { orderBy: { createdAt: 'desc' }, include: { items: { include: { product: true } } } },
        wishlist: { include: { product: true }, orderBy: { createdAt: 'desc' } },
        cart: true,
      },
    }),
    prisma.event.findMany({
      where: { userId: id, type: 'view', productId: { not: null } },
      orderBy: { createdAt: 'desc' },
      take: 40,
    }),
  ]);
  if (!user) notFound();
  const viewedIds = [...new Set(views.map((v) => v.productId!).filter(Boolean))].slice(0, 12);
  const viewedProducts = viewedIds.length
    ? await prisma.product.findMany({ where: { id: { in: viewedIds } }, select: { id: true, nameEn: true } })
    : [];
  const nameById = new Map(viewedProducts.map((p) => [p.id, p.nameEn]));
  const cartLines = (Array.isArray(user.cart?.itemsJson) ? user.cart!.itemsJson : []) as CartLine[];

  return (
    <div className="max-w-3xl">
      <Link href="/admin/members" className="font-mono text-[10px] uppercase tracking-wide text-white/40 hover:text-white">← Members</Link>
      <h1 className="text-[22px] font-bold mt-3">{user.name ?? user.email}</h1>
      <p className="font-mono text-[11px] text-white/40 mb-8">
        {user.email} {user.phone ? `· ${user.phone}` : ''} {user.vaultOptIn ? '· Vault member' : ''}
      </p>

      <Section title={`Orders (${user.orders.length})`}>
        {user.orders.length === 0 && <Empty>No orders.</Empty>}
        {user.orders.map((o) => (
          <div key={o.id} className="flex items-center justify-between gap-3 py-2.5 border-b border-white/10">
            <div>
              <span className="font-mono text-[12px]">AZ{o.id.slice(-6).toUpperCase()}</span>
              <span className="font-mono text-[10px] text-white/40 ms-3">
                {new Date(o.createdAt).toLocaleDateString('en-GB')} · {o.items.map((i) => i.product.nameEn).join(', ')}
              </span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[11px]">
              <span className="text-white/50">{o.status}</span>
              <span>{formatPrice(o.total, 'en')}</span>
            </div>
          </div>
        ))}
      </Section>

      <Section title="In cart now">
        {cartLines.length === 0 ? <Empty>Empty.</Empty> : (
          <div className="font-mono text-[12px] text-white/60">
            {cartLines.map((l, i) => `${l.nameEn ?? '?'} ${l.size ?? ''} ×${l.qty ?? 1}`).join(' · ')}
          </div>
        )}
      </Section>

      <Section title={`Wishlist (${user.wishlist.length})`}>
        {user.wishlist.length === 0 ? <Empty>Empty.</Empty> : (
          <div className="font-mono text-[12px] text-white/60">{user.wishlist.map((w) => w.product.nameEn).join(' · ')}</div>
        )}
      </Section>

      <Section title={`Recently viewed (${viewedProducts.length})`}>
        {viewedProducts.length === 0 ? <Empty>No browsing tracked yet.</Empty> : (
          <div className="font-mono text-[12px] text-white/60">
            {viewedIds.map((vid) => nameById.get(vid)).filter(Boolean).join(' · ')}
          </div>
        )}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <div className="font-mono text-[10px] tracking-label uppercase text-white/50 mb-3 flex items-center gap-2.5 before:content-[''] before:w-[20px] before:h-[0.5px] before:bg-white/40">{title}</div>
      {children}
    </section>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-white/40">{children}</p>;
}
