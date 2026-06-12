import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updateDrop } from '@/app/admin/actions';

export const dynamic = 'force-dynamic';

// datetime-local needs "YYYY-MM-DDTHH:mm"
function toLocalInput(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function EditDrop({
  params: { id },
}: {
  params: { id: string };
}) {
  const drop = await prisma.drop.findUnique({ where: { id } });
  if (!drop) notFound();

  const save = updateDrop.bind(null, id);

  return (
    <div className="max-w-xl">
      <Link
        href="/admin/drops"
        className="font-mono text-[10px] uppercase tracking-wide text-ink/40 hover:text-ink"
      >
        ← Drops
      </Link>
      <h1 className="text-[22px] font-bold mt-3 mb-6">Edit {drop.nameEn}</h1>

      <form action={save} className="grid sm:grid-cols-2 gap-3">
        <Input name="nameEn" label="Name (EN)" defaultValue={drop.nameEn} required />
        <Input name="nameAr" label="Name (AR)" defaultValue={drop.nameAr} required dir="rtl" />
        <Input name="slug" label="Slug" defaultValue={drop.slug} required />
        <Input
          name="launchAt"
          label="Launch at"
          type="datetime-local"
          defaultValue={toLocalInput(new Date(drop.launchAt))}
          required
        />
        <div>
          <Label>Status</Label>
          <select
            name="status"
            defaultValue={drop.status}
            className="w-full bg-ink/[0.04] border border-ink/[0.12] text-ink text-[13px] p-2.5 outline-none focus:border-accent/50"
          >
            {['TEASER', 'LIVE', 'SOLDOUT', 'ARCHIVED'].map((s) => (
              <option key={s} value={s} className="bg-bg">
                {s}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2.5 self-end pb-2 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            defaultChecked={drop.published}
            className="accent-accent w-4 h-4"
          />
          <span className="text-[12px] text-ink/70">Published (visible publicly)</span>
        </label>
        <div className="sm:col-span-2 flex gap-3 mt-2">
          <button className="bg-accent text-bg font-bold text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-accent-bright transition-colors">
            Save changes
          </button>
          <Link
            href="/admin/drops"
            className="font-mono text-[11px] uppercase tracking-wide text-ink/50 px-4 py-3 hover:text-ink"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[9px] uppercase tracking-wide text-ink/35 mb-1.5">
      {children}
    </div>
  );
}

function Input({ name, label, ...rest }: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        name={name}
        {...rest}
        className="w-full bg-ink/[0.04] border border-ink/[0.12] text-ink text-[13px] p-2.5 outline-none focus:border-accent/50 transition-colors"
      />
    </div>
  );
}
