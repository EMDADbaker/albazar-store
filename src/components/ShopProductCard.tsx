'use client';

import Image from 'next/image';
import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { formatPrice, inclVat } from '@/lib/money';
import { piecesLeft, type ProductView } from '@/lib/products';
import dynamic from 'next/dynamic';

// Modal only loads when a shopper opens Quick view — kept off the grid's path.
const QuickView = dynamic(() => import('./QuickView'), { ssr: false });

// Light-section product card. Clicking the card navigates to the product page;
// the hover heart and Quick view buttons are exceptions (they stop propagation).
export default function ShopProductCard({ product }: { product: ProductView }) {
  const t = useTranslations('Live');
  const tp = useTranslations('Product');
  const locale = useLocale();
  const router = useRouter();
  const left = piecesLeft(product);
  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const soldOut = left === 0;

  const [saved, setSaved] = useState(false);
  const [quick, setQuick] = useState(false);
  const [pending, setPending] = useState(false);

  async function toggleWish(e: React.MouseEvent) {
    e.stopPropagation();
    if (pending) return;
    setPending(true);
    try {
      const res = await fetch('/api/wishlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id }),
      });
      if (res.status === 401) {
        router.push('/login?next=/account');
        return;
      }
      const data = await res.json();
      setSaved(!!data.saved);
    } catch {
      /* ignore */
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <div
        className="group block cursor-pointer"
        onClick={() => router.push(`/product/${product.slug}`)}
      >
        <div className="relative aspect-[4/5] bg-paper-2 overflow-hidden mb-3">
          {product.images[0] ? (
            <Image
              src={product.images[0]}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-1/2 h-1/2 bg-black/[0.06]" />
            </div>
          )}

          {soldOut && (
            <div className="absolute inset-0 flex items-center justify-center bg-paper/40">
              <span className="font-mono text-[9px] tracking-label uppercase text-coal border border-coal/50 px-3 py-1.5 -rotate-[8deg] bg-paper/80">
                {t('soldOut')}
              </span>
            </div>
          )}

          {!soldOut && (
            <div className="absolute top-2.5 ltr:right-2.5 rtl:left-2.5 font-mono text-[9px] text-coal/70 bg-paper/85 px-2 py-1">
              {left} / {product.totalPieces}
            </div>
          )}

          {/* Heart — top corner, appears on hover */}
          <button
            onClick={toggleWish}
            aria-label={tp('save')}
            className={`absolute top-2.5 ltr:left-2.5 rtl:right-2.5 w-8 h-8 flex items-center justify-center bg-paper/85 text-[15px] transition-all ${
              saved
                ? 'text-red-500 opacity-100'
                : 'text-coal/70 opacity-0 group-hover:opacity-100 hover:bg-coal hover:text-paper'
            }`}
          >
            {saved ? '♥' : '♡'}
          </button>

          {/* Quick view — bottom bar, appears on hover */}
          {!soldOut && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setQuick(true);
              }}
              className="absolute bottom-0 inset-x-0 bg-coal/90 text-paper font-mono text-[10px] tracking-[0.18em] uppercase py-2.5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all"
            >
              {tp('quickView')}
            </button>
          )}
        </div>

        {product.brandNameEn && (
          <div className="font-mono text-[9px] text-coal/50 tracking-[0.08em] uppercase mb-0.5">
            {product.brandNameEn}
          </div>
        )}
        <div className="flex items-baseline justify-between gap-2">
          <div className="text-[13px] font-medium text-coal leading-tight">{name}</div>
          <div className="font-mono text-[12px] text-coal whitespace-nowrap">
            {formatPrice(inclVat(product.price), locale)}
          </div>
        </div>
      </div>

      {quick && <QuickView product={product} onClose={() => setQuick(false)} />}
    </>
  );
}
