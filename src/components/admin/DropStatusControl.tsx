'use client';

import { useTransition } from 'react';
import type { DropStatus } from '@prisma/client';
import { setDropStatus } from '@/app/admin/actions';

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
      onChange={(e) =>
        start(() => setDropStatus(id, e.target.value as DropStatus))
      }
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
