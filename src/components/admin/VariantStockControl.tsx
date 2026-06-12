'use client';

import { useState, useTransition } from 'react';
import { setVariantStock } from '@/app/admin/actions';

export default function VariantStockControl({
  variantId,
  size,
  stock,
}: {
  variantId: string;
  size: string;
  stock: number;
}) {
  const [value, setValue] = useState(stock);
  const [pending, start] = useTransition();
  const dirty = value !== stock;

  return (
    <div className="flex items-center gap-1.5">
      <span className="font-mono text-[10px] text-ink/40 w-7">{size}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value, 10) || 0)}
        className="w-16 bg-ink/[0.05] border border-ink/15 text-ink text-[12px] font-mono px-2 py-1 outline-none focus:border-accent/50"
      />
      {dirty && (
        <button
          disabled={pending}
          onClick={() => start(() => setVariantStock(variantId, value))}
          className="font-mono text-[9px] uppercase tracking-wide text-accent border border-accent/30 px-2 py-1 hover:bg-accent/10 disabled:opacity-50"
        >
          Save
        </button>
      )}
    </div>
  );
}
