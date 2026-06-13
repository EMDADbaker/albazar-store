'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatPrice, inclVat } from '@/lib/money';
import type { ProductView } from '@/lib/products';
import QuickView from './QuickView';

// Horizontal rail of the client's saved pieces, shown on the cart page.
// "Add" opens the quick-view popup so they can pick a size without leaving.
export default function WishlistRail({ products }: { products: ProductView[] }) {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const [quick, setQuick] = useState<ProductView | null>(null);

  if (products.length === 0) return null;

  return (
    <section className="max-w-2xl mx-auto w-full px-5 sm:px-6 pb-16">
      <div className="font-mono text-[11px] tracking-label uppercase text-coal/50 mb-5 flex items-center gap-2.5 before:content-[''] before:w-[22px] before:h-[0.5px] before:bg-coal/40">
        ♥ {t('fromWishlist')}
      </div>

      <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
        {products.map((p) => {
          const name = locale === 'ar' ? p.nameAr : p.nameEn;
          return (
            <div key={p.id} className="w-36 shrink-0">
              <Link href={`/product/${p.slug}`} className="group block">
                <div className="aspect-[4/5] bg-paper-2 overflow-hidden mb-2">
                  {p.images[0] && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0]}
                      alt={name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  )}
                </div>
                <div className="text-[12px] font-medium text-coal leading-tight truncate">
                  {name}
                </div>
                <div className="font-mono text-[11px] text-coal/60">
                  {formatPrice(inclVat(p.price), locale)}
                </div>
              </Link>
              <button
                onClick={() => setQuick(p)}
                className="mt-2 w-full border border-coal/25 text-coal font-mono text-[10px] tracking-[0.15em] uppercase py-2 hover:bg-coal hover:text-paper transition-colors"
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
