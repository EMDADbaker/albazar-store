'use client';

import { useEffect } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCart } from './CartProvider';
import { formatPrice, inclVat } from '@/lib/money';
import { FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';

// Slide-out mini-cart. Reads the live cart from context (already hydrated from
// localStorage), so it's instant and stays in sync with every add/remove/qty
// change. Opens automatically on add; also openable from the bag icon.
export default function CartDrawer() {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const { lines, count, subtotal, setQty, remove, drawerOpen, closeCart } = useCart();

  // Lock body scroll + close on Esc while open.
  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeCart();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [drawerOpen, closeCart]);

  // Free shipping is based on the incl-VAT total, matching the displayed prices.
  const subtotalIncl = inclVat(subtotal);
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotalIncl);
  const pct = Math.min(100, Math.round((subtotalIncl / FREE_SHIPPING_THRESHOLD) * 100));
  const freeUnlocked = remaining === 0 && subtotalIncl > 0;

  return (
    <div
      className={`fixed inset-0 z-[100] ${drawerOpen ? '' : 'pointer-events-none'}`}
      aria-hidden={!drawerOpen}
      {...({ inert: drawerOpen ? undefined : '' } as Record<string, unknown>)}
    >
      {/* Backdrop */}
      <div
        onClick={closeCart}
        className={`absolute inset-0 bg-coal/40 transition-opacity duration-300 ${
          drawerOpen ? 'opacity-100' : 'opacity-0'
        }`}
      />

      {/* Panel — anchored to the right edge, slides in from the right */}
      <aside
        className={`absolute inset-y-0 right-0 w-[88%] max-w-sm bg-paper text-coal flex flex-col shadow-[0_0_40px_rgba(0,0,0,0.3)] transition-transform duration-300 ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-coal/12">
          <div className="flex items-baseline gap-2">
            <h2 className="text-[16px] font-bold">{t('title')}</h2>
            <span className="font-mono text-[11px] text-coal/55">{t('items', { count })}</span>
          </div>
          <button
            onClick={closeCart}
            aria-label={t('close')}
            className="w-8 h-8 flex items-center justify-center text-coal/50 hover:text-coal transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        {lines.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center px-6 text-center gap-5">
            <div className="w-12 h-12 flex items-center justify-center border border-coal/20 text-coal/40 text-[20px]">⌗</div>
            <p className="text-[14px] text-coal/65">{t('empty')}</p>
            <Link
              href="/shop"
              onClick={closeCart}
              className="font-mono text-[11px] tracking-wide uppercase text-paper bg-coal px-6 py-3 hover:opacity-90 transition-opacity"
            >
              {t('browse')}
            </Link>
          </div>
        ) : (
          <>
            {/* Free-shipping progress */}
            <div className="px-5 pt-4">
              <div className="flex items-center gap-2 text-[11px] font-medium text-coal mb-1.5">
                <span className="text-accent">{freeUnlocked ? '✓' : '🚚'}</span>
                <span>
                  {freeUnlocked
                    ? t('freeShipUnlocked')
                    : t('freeShipRemaining', { amount: formatPrice(remaining, locale) })}
                </span>
              </div>
              <div className="h-1.5 bg-coal/10 overflow-hidden">
                <div className="h-full bg-accent transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
            </div>

            {/* Lines */}
            <div className="flex-1 overflow-y-auto px-5 py-4 divide-y divide-coal/10">
              {lines.map((l) => {
                const name = locale === 'ar' ? l.nameAr : l.nameEn;
                return (
                  <div key={l.variantId} className="flex gap-3 py-3 first:pt-0">
                    <div className="relative w-16 h-20 bg-paper-2 shrink-0 overflow-hidden border border-coal/10">
                      {l.image && (
                        <Image src={l.image} alt={name} fill sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium text-coal leading-tight truncate">{name}</div>
                      <div className="font-mono text-[10px] text-coal/55 mt-0.5">
                        {l.size} · {formatPrice(inclVat(l.price), locale)}
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-[12px] mt-2">
                        <button
                          onClick={() => setQty(l.variantId, l.qty - 1)}
                          className="w-7 h-7 border border-coal/25 text-coal/70 hover:border-coal hover:bg-coal hover:text-paper transition-colors"
                          aria-label="decrease"
                        >
                          −
                        </button>
                        <span className="w-6 text-center tabular-nums text-coal">{l.qty}</span>
                        <button
                          onClick={() => setQty(l.variantId, l.qty + 1)}
                          className="w-7 h-7 border border-coal/25 text-coal/70 hover:border-coal hover:bg-coal hover:text-paper transition-colors"
                          aria-label="increase"
                        >
                          +
                        </button>
                        <button
                          onClick={() => remove(l.variantId)}
                          aria-label={t('remove')}
                          className="ms-auto w-7 h-7 flex items-center justify-center text-coal/40 hover:text-red-600 transition-colors"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                            <path d="M6 6l12 12M18 6L6 18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer actions */}
            <div className="border-t border-coal/12 px-5 py-4 space-y-3">
              <div className="flex justify-between text-[14px] font-bold text-coal">
                <span>{t('subtotal')}</span>
                <span>{formatPrice(subtotalIncl, locale)}</span>
              </div>
              <p className="font-mono text-[9px] text-coal/45 -mt-2">{t('vatIncluded')}</p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="block w-full bg-coal text-paper text-center font-bold text-[12px] tracking-[0.18em] uppercase py-3.5 hover:opacity-90 transition-opacity"
              >
                {t('checkout')}
              </Link>
              <Link
                href="/cart"
                onClick={closeCart}
                className="block w-full border border-coal/25 text-coal text-center font-mono text-[11px] tracking-wide uppercase py-3 hover:bg-coal hover:text-paper transition-colors"
              >
                {t('viewCart')}
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
