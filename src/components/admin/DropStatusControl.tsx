'use client';

import { useEffect, useState, useTransition } from 'react';
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
  const [val, setVal] = useState(status);
  const [pending, start] = useTransition();
  useEffect(() => setVal(status), [status]);

  function change(s: DropStatus) {
    const prev = val;
    setVal(s); // optimistic
    start(async () => {
      try {
        await setDropStatus(id, s);
        flashAdmin(`Drop set to ${s}`);
      } catch {
        setVal(prev);
        flashAdmin('Could not save — reverted');
      }
    });
  }

  return (
    <select
      value={val}
      onChange={(e) => change(e.target.value as DropStatus)}
      className={`bg-ink/[0.05] border border-ink/15 text-ink text-[12px] font-mono px-2 py-1.5 outline-none focus:border-accent/50 ${pending ? 'opacity-70' : ''}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s} className="bg-bg">
          {s}
        </option>
      ))}
    </select>
  );
}
