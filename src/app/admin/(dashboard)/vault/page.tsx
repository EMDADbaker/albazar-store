import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// The Vault has two entry points: the homepage phone capture (VaultMember)
// and registered accounts toggling vault opt-in (User.vaultOptIn). Show both.
export default async function VaultAdmin() {
  const [members, optInUsers] = await Promise.all([
    prisma.vaultMember.findMany({ orderBy: { joinedAt: 'desc' }, take: 500 }),
    prisma.user.findMany({
      where: { vaultOptIn: true },
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, name: true, phone: true, createdAt: true },
      take: 500,
    }),
  ]);
  const total = members.length + optInUsers.length;

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-[22px] font-bold">Vault</h1>
        <a
          href="/api/admin/vault/export"
          className="font-mono text-[10px] tracking-wide uppercase text-accent border border-accent/30 px-4 py-2 hover:bg-accent/10 transition-colors"
        >
          Export CSV
        </a>
      </div>
      <p className="font-mono text-[11px] text-white/60 mb-8">
        {total} members · early-access list for drop broadcasts.
      </p>

      {/* Registered accounts opted in */}
      <div className="font-mono text-[10px] tracking-wide uppercase text-accent/70 mb-2">
        Account members ({optInUsers.length})
      </div>
      <div className="border-t border-white/12 mb-8">
        {optInUsers.length === 0 && (
          <p className="text-[13px] text-white/60 py-4">None yet.</p>
        )}
        {optInUsers.map((u) => (
          <div
            key={u.id}
            className="flex items-center justify-between gap-4 py-3 border-b border-white/12"
          >
            <div>
              <div className="font-mono text-[13px]">{u.name ?? u.email}</div>
              <div className="font-mono text-[10px] text-white/60">
                {u.email} {u.phone ? `· ${u.phone}` : ''}
              </div>
            </div>
            <div className="font-mono text-[10px] text-white/60">
              {new Date(u.createdAt).toLocaleDateString('en-GB')}
            </div>
          </div>
        ))}
      </div>

      {/* Phone-only captures from the homepage / confirmation forms */}
      <div className="font-mono text-[10px] tracking-wide uppercase text-accent/70 mb-2">
        Phone captures ({members.length})
      </div>
      <div className="border-t border-white/12">
        {members.length === 0 && (
          <p className="text-[13px] text-white/60 py-4">None yet.</p>
        )}
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-4 py-3 border-b border-white/12"
          >
            <div className="font-mono text-[13px]">{m.phone}</div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-white/60">
              <span>{m.source ?? '—'}</span>
              {m.whatsappOptIn && <span className="text-accent/70">WhatsApp</span>}
              <span>{new Date(m.joinedAt).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
