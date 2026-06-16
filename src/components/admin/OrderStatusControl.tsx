'use client';

import { useTransition } from 'react';
import type { OrderStatus } from '@prisma/client';
import { setOrderStatus } from '@/app/admin/actions';
import { flashAdmin } from './flash';

const STATUSES: OrderStatus[] = [
  'PENDING',
  'PAID',
  'PACKED',
  'SHIPPED',
  'DELIVERED',
  'CANCELLED',
];

export default function OrderStatusControl({
  id,
  status,
}: {
  id: string;
  status: OrderStatus;
}) {
  const [pending, start] = useTransition();

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => { const s = e.target.value as OrderStatus; start(async () => { await setOrderStatus(id, s); flashAdmin(`Order set to ${s}`); }); }}
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
