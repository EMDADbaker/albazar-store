import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { createDrop, deleteDrop } from '@/app/admin/actions';
import DropStatusControl from '@/components/admin/DropStatusControl';
import PublishToggle from '@/components/admin/PublishToggle';
import DeleteButton from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

export default async function DropsAdmin() {
  const drops = await prisma.drop.findMany({
    orderBy: { launchAt: 'desc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Drops</h1>
      <p className="font-mono text-[11px] text-white/60 mb-8">
        Status flips the public homepage instantly — no deploy.
      </p>

      {/* Create */}
      <details className="mb-10 group">
        <summary className="cursor-pointer list-none font-mono text-[11px] tracking-wide uppercase text-accent border border-accent/30 px-4 py-2.5 inline-flex items-center gap-2 hover:bg-accent/10 transition-colors">
          <span className="group-open:hidden">+ New drop</span>
          <span className="hidden group-open:inline">− Close</span>
        </summary>
        <form
          action={createDrop}
          className="border border-white/12 p-5 mt-3 grid sm:grid-cols-2 gap-3"
        >
        <Input name="nameEn" label="Name (EN)" required />
        <Input name="nameAr" label="Name (AR)" required dir="rtl" />
        <Input name="slug" label="Slug (optional)" placeholder="drop-002" />
        <Input name="launchAt" label="Launch at" type="datetime-local" required />
        <div>
          <Label>Status</Label>
          <select
            name="status"
            defaultValue="TEASER"
            className="w-full bg-white/[0.06] border border-white/20 text-white text-[13px] p-2.5 outline-none focus:border-white/50"
          >
            {['TEASER', 'LIVE', 'SOLDOUT', 'ARCHIVED'].map((s) => (
              <option key={s} value={s} className="bg-bg">
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <button className="bg-accent text-bg font-bold text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-accent-bright transition-colors">
            Create drop
          </button>
        </div>
        </form>
      </details>

      {/* List */}
      <div className="border-t border-white/12">
        {drops.length === 0 && (
          <p className="text-[13px] text-white/60 py-6">No drops yet.</p>
        )}
        {drops.map((d) => (
          <div
            key={d.id}
            className="flex flex-wrap items-center justify-between gap-3 py-4 border-b border-white/12"
          >
            <div className="min-w-0 flex-1">
              <div className="text-[14px] font-medium">{d.nameEn}</div>
              <div className="font-mono text-[10px] text-white/60 mt-0.5">
                /{d.slug} · {d._count.products} pieces ·{' '}
                {new Date(d.launchAt).toLocaleString('en-GB')}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <PublishToggle id={d.id} published={d.published} />
              <DropStatusControl id={d.id} status={d.status} />
              <Link
                href={`/admin/drops/${d.id}`}
                className="font-mono text-[9px] uppercase tracking-wide text-white/60 border border-white/20 px-2 py-1 hover:text-white hover:border-white/30 transition-colors"
              >
                Edit
              </Link>
              <DeleteButton action={deleteDrop.bind(null, d.id)} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[9px] uppercase tracking-wide text-white/55 mb-1.5">
      {children}
    </div>
  );
}

function Input({
  name,
  label,
  ...rest
}: {
  name: string;
  label: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        name={name}
        {...rest}
        className="w-full bg-white/[0.06] border border-white/20 text-white text-[13px] p-2.5 outline-none focus:border-white/50 transition-colors"
      />
    </div>
  );
}
