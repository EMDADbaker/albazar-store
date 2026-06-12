import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function VaultAdmin() {
  const members = await prisma.vaultMember.findMany({
    orderBy: { joinedAt: 'desc' },
    take: 500,
  });

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
      <p className="font-mono text-[11px] text-ink/40 mb-8">
        {members.length} members · early-access list for drop broadcasts.
      </p>

      <div className="border-t border-ink/[0.08]">
        {members.length === 0 && (
          <p className="text-[13px] text-ink/40 py-6">No members yet.</p>
        )}
        {members.map((m) => (
          <div
            key={m.id}
            className="flex items-center justify-between gap-4 py-3 border-b border-ink/[0.08]"
          >
            <div className="font-mono text-[13px]">{m.phone}</div>
            <div className="flex items-center gap-4 font-mono text-[10px] text-ink/40">
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
