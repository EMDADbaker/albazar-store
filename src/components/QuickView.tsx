'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { createPortal } from 'react-dom';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCart } from './CartProvider';
import { formatPrice, inclVat } from '@/lib/money';
import { piecesLeft, type ProductView } from '@/lib/products';

// In-page popup with the product's core content (Urbn-Lot style).
export default function QuickView({
  product,
  onClose,
}: {
  product: ProductView;
  onClose: () => void;
}) {
  const t = useTranslations('Product');
  const locale = useLocale();
  const { add } = useCart();
  const [size, setSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const story = locale === 'ar' ? product.storyAr : product.storyEn;
  const left = piecesLeft(product);
  const selected = product.variants.find((v) => v.size === size);
  const canAdd = selected && selected.stock > 0;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  function addToCart() {
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
      1,
    );
    setAdded(true);
    // Fire the global toast, then close the popup shortly after.
    window.dispatchEvent(new CustomEvent('albazar:added', { detail: { name } }));
    setTimeout(() => onClose(), 700);
  }

  // Portal to <body> so the fixed overlay can't be trapped by any ancestor
  // transform/stacking context (the cause of the invisible-modal bug).
  if (!mounted) return null;
  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-coal/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-paper text-coal w-full max-w-3xl max-h-[88vh] overflow-y-auto grid sm:grid-cols-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label={t('close')}
          className="absolute top-3 ltr:right-3 rtl:left-3 z-10 w-8 h-8 flex items-center justify-center bg-paper/90 text-coal text-[16px] hover:bg-coal hover:text-paper transition-colors"
        >
          ✕
        </button>

        {/* Capped height when stacked so the size picker stays in view; full 4:5 on desktop. */}
        <div className="relative h-[34vh] sm:h-auto sm:aspect-[4/5] bg-paper-2 overflow-hidden">
          {product.images[0] && (
            <Image src={product.images[0]} alt={name} fill sizes="(max-width: 640px) 100vw, 384px" className="object-cover" />
          )}
        </div>

        <div className="p-5 sm:p-6">
          <div className="font-mono text-[9px] tracking-label uppercase text-coal/45 mb-2">
            {product.sku}
          </div>
          <h2 className="text-[20px] font-bold leading-tight mb-2">{name}</h2>
          <div className="font-mono text-[16px] mb-1">
            {formatPrice(inclVat(product.price), locale)}
          </div>
          <div className="font-mono text-[9px] text-coal/40 mb-5">
            {left === 0 ? t('soldOut') : t('remaining', { count: left, total: product.totalPieces })}
          </div>

          <div className="font-mono text-[10px] tracking-label uppercase text-coal/45 mb-2">
            {t('size')}
          </div>
          <div className="flex flex-wrap gap-2 mb-5">
            {product.variants.map((v) => {
              const out = v.stock <= 0;
              const active = v.size === size;
              return (
                <button
                  key={v.id}
                  disabled={out}
                  onClick={() => setSize(v.size)}
                  className={`min-w-[42px] h-10 px-2.5 font-mono text-[12px] border transition-colors ${
                    active ? 'border-coal bg-coal text-paper' : 'border-coal/20 text-coal/80 hover:border-coal'
                  } ${out ? 'opacity-30 line-through cursor-not-allowed' : ''}`}
                >
                  {v.size}
                </button>
              );
            })}
          </div>

          <button
            onClick={addToCart}
            disabled={!canAdd}
            className="w-full bg-coal text-paper font-bold text-[12px] tracking-[0.18em] uppercase py-3.5 hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {added ? `✓ ${t('added')}` : !size ? t('selectSize') : !canAdd ? t('soldOut') : t('addToCart')}
          </button>

          {story && <p className="text-[12px] text-coal/55 leading-relaxed mt-4">{story}</p>}

          <Link
            href={`/product/${product.slug}`}
            className="inline-block mt-4 font-mono text-[10px] uppercase tracking-wide text-coal underline hover:no-underline"
          >
            {t('fullDetails')}
          </Link>
        </div>
      </div>
    </div>,
    document.body,
  );
}
