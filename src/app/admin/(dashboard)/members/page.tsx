import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, inclVat } from '@/lib/money';

export const dynamic = 'force-dynamic';

type CartLine = { nameEn?: string; size?: string; qty?: number; price?: number };

export default async function MembersAdmin() {
  const users = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    include: {
      cart: true,
      wishlist: { include: { product: true }, take: 10 },
      orders: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 200,
  });

  const rows = users.map((u) => {
    const cartLines = (Array.isArray(u.cart?.itemsJson) ? u.cart!.itemsJson : []) as CartLine[];
    const cartCount = cartLines.reduce((n, l) => n + (l.qty ?? 0), 0);
    const cartValue = cartLines.reduce((s, l) => s + (l.price ?? 0) * (l.qty ?? 0), 0);
    const pending = u.orders.filter((o) => o.status === 'PENDING');
    const paid = u.orders.filter((o) => o.status !== 'PENDING' && o.status !== 'CANCELLED');
    const pendingValue = pending.reduce((s, o) => s + o.total, 0);
    const needsAttention = cartCount > 0 || pending.length > 0;
    return { u, cartLines, cartCount, cartValue, pending: pending.length, paid: paid.length, pendingValue, wish: u.wishlist.length, needsAttention };
  });

  const attention = rows.filter((r) => r.needsAttention);
  const rest = rows.filter((r) => !r.needsAttention);

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Members</h1>
      <p className="font-mono text-[11px] text-white/60 mb-8">
        {users.length} registered clients · {attention.length} need a nudge
        (cart or unfinished checkout).
      </p>

      <Group title={`Needs attention · ${attention.length}`} accent>
        {attention.length === 0 && <Empty>Nobody left anything behind. 🎉</Empty>}
        {attention.map((r) => <Row key={r.u.id} r={r} />)}
      </Group>

      <Group title={`All clients · ${rest.length}`}>
        {rest.length === 0 && <Empty>No other clients yet.</Empty>}
        {rest.map((r) => <Row key={r.u.id} r={r} />)}
      </Group>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function Row({ r }: { r: any }) {
  const { u, cartLines, cartCount, cartValue, pending, paid, pendingValue, wish, needsAttention } = r;
  return (
    <Link
      href={`/admin/members/${u.id}`}
      className={`block border px-4 py-3 transition-colors hover:bg-white/[0.04] ${
        needsAttention ? 'border-accent/35 bg-accent/[0.03]' : 'border-white/12'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[14px] font-medium truncate">
            {u.name ?? u.email}
            {cartCount > 0 && (
              <span className="ms-2 font-mono text-[8px] tracking-wide uppercase bg-accent text-bg px-1.5 py-0.5 align-middle">
                cart waiting
              </span>
            )}
          </div>
          <div className="font-mono text-[10px] text-white/55 mt-0.5 truncate">
            {u.email} {u.phone ? `· ${u.phone}` : ''} {u.vaultOptIn ? '· Vault' : ''}
          </div>
        </div>
        <div className="flex gap-4 font-mono text-[10px] text-white/70 shrink-0">
          <Stat label="cart" value={cartCount > 0 ? `${cartCount} · ${formatPrice(inclVat(cartValue), 'en')}` : '—'} />
          <Stat label="wishlist" value={wish || '—'} />
          <Stat label="pending" value={pending > 0 ? `${pending} · ${formatPrice(pendingValue, 'en')}` : '—'} />
          <Stat label="paid" value={paid || '—'} />
        </div>
      </div>
    </Link>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="text-end">
      <div className="text-white/40 uppercase tracking-wide text-[8px]">{label}</div>
      <div className="text-white">{value}</div>
    </div>
  );
}

function Group({ title, accent, children }: { title: string; accent?: boolean; children: React.ReactNode }) {
  return (
    <section className="mb-9">
      <div className={`font-mono text-[10px] tracking-label uppercase mb-3 flex items-center gap-2.5 before:content-[''] before:w-[20px] before:h-[0.5px] ${accent ? 'text-accent before:bg-accent/60' : 'text-white/50 before:bg-white/40'}`}>
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="text-[13px] text-white/50">{children}</p>;
}
