'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useCart, type CartLine } from './CartProvider';

type Opt = { id: string; size: string; stock: number };

// Lets a shopper swap the size of a cart line in place.
export default function SizeChanger({ line }: { line: CartLine }) {
  const t = useTranslations('Cart');
  const { add, remove } = useCart();
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<Opt[] | null>(null);

  async function toggle() {
    if (!open && !opts) {
      const r = await fetch(`/api/product-options?slug=${encodeURIComponent(line.productSlug)}`);
      const d = await r.json();
      setOpts(d.variants ?? []);
    }
    setOpen((o) => !o);
  }

  function pick(v: Opt) {
    setOpen(false);
    if (v.id === line.variantId || v.stock <= 0) return;
    // Swap: drop the old line, add the new variant with the same quantity.
    remove(line.variantId);
    add(
      {
        productSlug: line.productSlug,
        variantId: v.id,
        size: v.size,
        nameAr: line.nameAr,
        nameEn: line.nameEn,
        price: line.price,
        image: line.image,
      },
      line.qty,
    );
  }

  return (
    <span className="inline-flex items-center gap-2">
      <button onClick={toggle} className="underline hover:no-underline text-coal/50 hover:text-coal">
        {line.size} · {t('change')}
      </button>
      {open && opts && (
        <span className="inline-flex gap-1">
          {opts.map((v) => (
            <button
              key={v.id}
              disabled={v.stock <= 0}
              onClick={() => pick(v)}
              className={`w-7 h-6 text-[10px] border ${
                v.size === line.size ? 'border-coal bg-coal text-paper' : 'border-coal/25 text-coal/70 hover:border-coal'
              } ${v.stock <= 0 ? 'opacity-30 line-through' : ''}`}
            >
              {v.size}
            </button>
          ))}
        </span>
      )}
    </span>
  );
}
