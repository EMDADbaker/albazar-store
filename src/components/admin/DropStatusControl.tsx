'use client';

import { useTransition } from 'react';
import type { DropStatus } from '@prisma/client';
import { setDropStatus } from '@/app/admin/actions';
import { flashAdmin } from './flash';

const STATUSES: DropStatus[] = ['TEASER', 'LIVE', 'SOLDOUT', 'ARCHIVED'];

export default function DropStatusControl({
  id,
  status,
}: {
  id: string;
  status: DropStatus;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => { const s = e.target.value as DropStatus; start(async () => { await setDropStatus(id, s); flashAdmin(`Drop set to ${s}`); }); }}
      className="bg-ink/[0.05] border border-ink/15 text-ink text-[12px] font-mono px-2 py-1.5 outline-none focus:border-accent/50 disabled:opacity-50"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-bg">
          {s}
        </option>
      ))}
    </select>
  );
}
