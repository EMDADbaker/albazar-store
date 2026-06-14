import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, inclVat } from '@/lib/money';

export const dynamic = 'force-dynamic';

type CartLine = { nameEn?: string; size?: string; qty?: number; price?: number };

// Registered clients with their live cart, wishlist, and unfinished checkouts —
// the "they wanted it but didn't buy" view.
export default async function MembersAdmin() {
  const users = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    include: {
      cart: true,
      wishlist: { include: { product: true }, take: 10 },
      orders: { where: { status: 'PENDING' } },
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const rows = users.map((u) => {
    const cartLines = (Array.isArray(u.cart?.itemsJson) ? u.cart!.itemsJson : []) as CartLine[];
    const cartCount = cartLines.reduce((n, l) => n + (l.qty ?? 0), 0);
    const cartValue = cartLines.reduce((s, l) => s + (l.price ?? 0) * (l.qty ?? 0), 0);
    const pendingValue = u.orders.reduce((s, o) => s + o.total, 0);
    const abandoned = cartCount > 0 || u.orders.length > 0;
    return { u, cartLines, cartCount, cartValue, pendingValue, abandoned };
  });

  const hot = rows.filter((r) => r.abandoned).length;

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Members</h1>
      <p className="font-mono text-[11px] text-ink/40 mb-8">
        {users.length} registered clients · {hot} with items in cart or an
        unfinished checkout.
      </p>

      <div className="space-y-3">
        {rows.length === 0 && <p className="text-[13px] text-ink/40">No clients yet.</p>}
        {rows.map(({ u, cartLines, cartCount, cartValue, pendingValue, abandoned }) => (
          <div
            key={u.id}
            className={`border p-4 ${abandoned ? 'border-accent/35 bg-accent/[0.03]' : 'border-ink/[0.08]'}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <div className="text-[14px] font-medium">
                  <Link href={`/admin/members/${u.id}`} className="hover:text-accent transition-colors">
                    {u.name ?? u.email}
                  </Link>
                  {abandoned && (
                    <span className="ms-2 font-mono text-[8px] tracking-wide uppercase bg-accent text-bg px-1.5 py-0.5 align-middle">
                      didn&apos;t finish
                    </span>
                  )}
                  <Link href={`/admin/members/${u.id}`} className="ms-2 font-mono text-[9px] uppercase tracking-wide text-white/40 hover:text-white">
                    history →
                  </Link>
                </div>
                <div className="font-mono text-[10px] text-ink/40 mt-0.5">
                  {u.email} {u.phone ? `· ${u.phone}` : ''}{' '}
                  {u.vaultOptIn && <span className="text-accent/70">· Vault</span>}
                </div>
              </div>
              <div className="flex gap-5 font-mono text-[10px] text-ink/50">
                <span>
                  Cart: <b className="text-ink">{cartCount}</b>
                  {cartCount > 0 && ` (${formatPrice(inclVat(cartValue), 'en')})`}
                </span>
                <span>
                  Wishlist: <b className="text-ink">{u.wishlist.length}</b>
                </span>
                <span>
                  Pending: <b className="text-ink">{u.orders.length}</b>
                  {pendingValue > 0 && ` (${formatPrice(pendingValue, 'en')})`}
                </span>
              </div>
            </div>

            {(cartLines.length > 0 || u.wishlist.length > 0) && (
              <div className="font-mono text-[10px] text-ink/45 leading-relaxed border-t border-ink/[0.06] pt-2 mt-2">
                {cartLines.length > 0 && (
                  <div>
                    <span className="text-ink/30 uppercase tracking-wide">In cart: </span>
                    {cartLines
                      .map((l) => `${l.nameEn ?? '?'} ${l.size ?? ''} ×${l.qty ?? 1}`)
                      .join(' · ')}
                  </div>
                )}
                {u.wishlist.length > 0 && (
                  <div>
                    <span className="text-ink/30 uppercase tracking-wide">Wishlist: </span>
                    {u.wishlist.map((w) => w.product.nameEn).join(' · ')}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
