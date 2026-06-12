'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { useCart } from './CartProvider';
import type { ProductView } from '@/lib/products';

export default function AddToCart({ product }: { product: ProductView }) {
  const t = useTranslations('Product');
  const locale = useLocale();
  const router = useRouter();
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  const selected = product.variants.find((v) => v.size === size);
  const canAdd = selected && selected.stock > 0;

  function handleAdd() {
    if (!selected || selected.stock <= 0) return;
    add({
      productSlug: product.slug,
      variantId: selected.id,
      size: selected.size,
      nameAr: product.nameAr,
      nameEn: product.nameEn,
      price: product.price,
      image: product.images[0],
    });
    setAdded(true);
    setTimeout(() => router.push('/cart'), 400);
  }

  return (
    <div>
      <div className="font-mono text-[10px] tracking-label uppercase text-ink/40 mb-2.5">
        {t('size')}
      </div>
      <div className="flex gap-2 mb-6">
        {product.variants.map((v) => {
          const out = v.stock <= 0;
          const active = v.size === size;
          return (
            <button
              key={v.id}
              disabled={out}
              onClick={() => setSize(v.size)}
              className={`w-12 h-12 font-mono text-[12px] border transition-colors ${
                active
                  ? 'border-gold text-gold bg-gold/10'
                  : 'border-ink/15 text-ink/70 hover:border-ink/40'
              } ${out ? 'opacity-30 line-through cursor-not-allowed' : ''}`}
            >
              {v.size}
            </button>
          );
        })}
      </div>

      <button
        onClick={handleAdd}
        disabled={!canAdd || added}
        className="w-full bg-gold text-bg font-bold text-[12px] tracking-[0.18em] uppercase py-4 transition-colors hover:bg-gold-bright disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {added
          ? '✓'
          : !size
            ? t('selectSize')
            : !canAdd
              ? t('soldOut')
              : t('addToCart')}
      </button>

      <div className="font-mono text-[9px] text-ink/35 mt-3 text-center">
        {t('vatIncluded')}
        {locale === 'ar' ? '' : ''}
      </div>
    </div>
  );
}
