'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCart } from './CartProvider';
import type { ProductView } from '@/lib/products';

export default function AddToCart({ product }: { product: ProductView }) {
  const t = useTranslations('Product');
  const router = useRouter();
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const selected = product.variants.find((v) => v.size === size);
  const canAdd = selected && selected.stock > 0;
  const maxQty = selected ? Math.min(selected.stock, 5) : 5;

  function handleAdd() {
    if (!selected || selected.stock <= 0) return;
    add(
      {
        productSlug: product.slug,
        variantId: selected.id,
        size: selected.size,
        nameAr: product.nameAr,
        nameEn: product.nameEn,
        price: product.price,
        image: product.images[0],
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => router.push('/cart'), 450);
  }

  return (
    <div>
      {/* Size */}
      <div className="font-mono text-[10px] tracking-label uppercase text-ink/40 mb-2.5">
        {t('size')}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {product.variants.map((v) => {
          const out = v.stock <= 0;
          const active = v.size === size;
          return (
            <button
              key={v.id}
              disabled={out}
              onClick={() => {
                setSize(v.size);
                setQty(1);
              }}
              className={`min-w-[48px] h-12 px-3 font-mono text-[12px] border transition-colors ${
                active
                  ? 'border-accent bg-accent text-bg'
                  : 'border-ink/15 text-ink/70 hover:border-ink/40'
              } ${out ? 'opacity-30 line-through cursor-not-allowed' : ''}`}
            >
              {v.size}
            </button>
          );
        })}
      </div>

      {/* Quantity */}
      <div className="font-mono text-[10px] tracking-label uppercase text-ink/40 mb-2.5">
        {t('quantity')}
      </div>
      <div className="flex items-center gap-3 mb-7">
        <div className="flex items-center border border-ink/15 font-mono text-[14px]">
          <button
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            disabled={qty <= 1}
            className="w-10 h-11 text-ink/60 hover:text-ink disabled:opacity-30"
            aria-label="decrease quantity"
          >
            −
          </button>
          <span className="w-10 text-center tabular-nums">{qty}</span>
          <button
            onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
            disabled={qty >= maxQty}
            className="w-10 h-11 text-ink/60 hover:text-ink disabled:opacity-30"
            aria-label="increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={handleAdd}
        disabled={!canAdd || added}
        className="w-full bg-accent text-bg font-bold text-[12px] tracking-[0.18em] uppercase py-4 transition-colors hover:bg-accent-bright disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-accent"
      >
        {added
          ? t('added')
          : !size
            ? t('selectSize')
            : !canAdd
              ? t('soldOut')
              : t('addToCart')}
      </button>

      <div className="font-mono text-[9px] text-ink/35 mt-3 text-center">
        {t('vatIncluded')}
      </div>
    </div>
  );
}
