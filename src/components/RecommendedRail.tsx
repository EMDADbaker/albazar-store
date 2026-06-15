'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatPrice, inclVat } from '@/lib/money';
import type { ProductView } from '@/lib/products';
import { useCart } from './CartProvider';
import QuickView from './QuickView';

type Reco = ProductView & { reasonKey: string; reasonArg?: string };

// Smart "recommended for you" rail on the cart page. Every item carries a
// reason from the server (brand / co-purchase / wishlist / browsing / category).
export default function RecommendedRail() {
  const t = useTranslations('Reco');
  const locale = useLocale();
  const { lines } = useCart();
  const slugs = lines.map((l) => l.productSlug);
  const [items, setItems] = useState<Reco[]>([]);
  const [quick, setQuick] = useState<ProductView | null>(null);

  useEffect(() => {
    let cancel = false;
    fetch('/api/recommendations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ slugs }),
    })
      .then((r) => r.json())
      .then((d) => { if (!cancel) setItems(d.items ?? []); })
      .catch(() => {});
    return () => { cancel = true; };
  }, [slugs.join(',')]); // eslint-disable-line react-hooks/exhaustive-deps

  if (items.length === 0) return null;

  return (
    <section className="max-w-2xl mx-auto w-full px-5 sm:px-6 pb-16">
      <div className="font-mono text-[11px] tracking-label uppercase text-coal/50 mb-5 flex items-center gap-2.5 before:content-[''] before:w-[22px] before:h-[0.5px] before:bg-coal/40">
        {t('title')}
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {items.map((p) => {
          const name = locale === 'ar' ? p.nameAr : p.nameEn;
          return (
            <div key={p.id} className="w-40 shrink-0">
              <Link href={`/product/${p.slug}`} className="group block">
                <div className="relative aspect-[4/5] bg-paper-2 overflow-hidden mb-2">
                  {p.images[0] && (
                    <Image src={p.images[0]} alt={name} fill sizes="160px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                  )}
                </div>
              </Link>
              {/* The reason — why this was suggested */}
              <div className="font-mono text-[8.5px] uppercase tracking-[0.08em] text-coal/45 mb-1 truncate">
                {t(p.reasonKey, { x: p.reasonArg ?? '' })}
              </div>
              <div className="text-[12px] font-medium text-coal leading-tight truncate">{name}</div>
              <div className="font-mono text-[11px] text-coal/60 mb-1.5">
                {formatPrice(inclVat(p.price), locale)}
              </div>
              <button
                onClick={() => setQuick(p)}
                className="w-full border border-coal/25 text-coal font-mono text-[10px] tracking-[0.15em] uppercase py-2 hover:bg-coal hover:text-paper transition-colors"
              >
                + {t('add')}
              </button>
            </div>
          );
        })}
      </div>

      {quick && <QuickView product={quick} onClose={() => setQuick(null)} />}
    </section>
  );
}
