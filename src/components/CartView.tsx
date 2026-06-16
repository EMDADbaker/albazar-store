'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { useCart } from './CartProvider';
import { formatPrice, vatOf, inclVat } from '@/lib/money';
import { shippingFor, FREE_SHIPPING_THRESHOLD } from '@/lib/shipping';
import SizeChanger from './SizeChanger';

// Light-theme cart.
export default function CartView() {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const { lines, subtotal, count, setQty, remove } = useCart();

  // Animate a line out before it leaves the cart, so removal is visible.
  const [removing, setRemoving] = useState<Set<string>>(new Set());
  function removeWithAnim(variantId: string) {
    setRemoving((prev) => new Set(prev).add(variantId));
    setTimeout(() => remove(variantId), 320);
  }

  if (lines.length === 0) {
    return (
      <div className="flex-1 px-6 py-24 text-center">
        <div className="mx-auto mb-5 w-12 h-12 flex items-center justify-center border border-coal/20 text-coal/40 text-[20px]">
          ⌗
        </div>
        <p className="text-[15px] text-coal/70 mb-6">{t('empty')}</p>
        <Link
          href="/shop"
          className="font-mono text-[11px] tracking-wide uppercase text-paper bg-coal px-6 py-3 inline-block hover:opacity-90 transition-opacity"
        >
          {t('browse')}
        </Link>
      </div>
    );
  }

  const vat = vatOf(subtotal);
  const shipping = shippingFor(subtotal);
  const total = inclVat(subtotal) + shipping;

  // Free-shipping progress (threshold + subtotal are both excl-VAT).
  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
  const freeUnlocked = remaining === 0;

  return (
    <div className="flex-1 px-5 sm:px-6 py-10 sm:py-12 max-w-2xl mx-auto w-full">
      <div className="flex items-baseline justify-between gap-3 mb-6">
        <h1 className="text-[26px] font-bold">{t('title')}</h1>
        <span className="font-mono text-[11px] text-coal/60">{t('items', { count })}</span>
      </div>

      {/* Free-shipping progress */}
      <div className="border border-coal/15 bg-paper-2/50 px-4 py-3.5 mb-6">
        <div className="flex items-center gap-2 text-[12px] font-medium text-coal mb-2">
          <span className="text-accent">{freeUnlocked ? '✓' : '🚚'}</span>
          <span>
            {freeUnlocked
              ? t('freeShipUnlocked')
              : t('freeShipRemaining', { amount: formatPrice(remaining, locale) })}
          </span>
        </div>
        <div className="h-1.5 bg-coal/10 overflow-hidden">
          <div
            className="h-full bg-accent transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Items — bordered card with defined edges */}
      <div className="border border-coal/15 divide-y divide-coal/10">
        {lines.map((l) => {
          const name = locale === 'ar' ? l.nameAr : l.nameEn;
          const isRemoving = removing.has(l.variantId);
          return (
            <div
              key={l.variantId}
              className={`flex items-center gap-3 sm:gap-4 p-3.5 transition-all duration-300 ${
                isRemoving ? 'opacity-0 ltr:translate-x-3 rtl:-translate-x-3 pointer-events-none' : 'opacity-100'
              }`}
            >
              <div className="relative w-16 h-20 bg-paper-2 shrink-0 overflow-hidden border border-coal/10">
                {l.image ? (
                  <Image src={l.image} alt={name} fill sizes="64px" className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1/2 h-1/2 bg-coal/[0.08]" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-coal truncate">{name}</div>
                {isRemoving ? (
                  <div className="font-mono text-[10px] text-coal/55 mt-1">{t('removing')}</div>
                ) : (
                  <div className="font-mono text-[10px] text-coal/60 mt-1 flex items-center gap-2 flex-wrap">
                    <SizeChanger line={l} />
                    <span>· {formatPrice(inclVat(l.price), locale)}</span>
                  </div>
                )}
                {/* line total */}
                {!isRemoving && l.qty > 1 && (
                  <div className="font-mono text-[11px] text-coal mt-1">
                    {formatPrice(inclVat(l.price * l.qty), locale)}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-1.5 font-mono text-[12px]">
                <button
                  onClick={() => (l.qty - 1 <= 0 ? removeWithAnim(l.variantId) : setQty(l.variantId, l.qty - 1))}
                  className="w-8 h-8 border border-coal/25 text-coal/70 hover:border-coal hover:bg-coal hover:text-paper transition-colors disabled:opacity-40"
                  aria-label="decrease"
                  disabled={isRemoving}
                >
                  −
                </button>
                <span className="w-6 text-center tabular-nums text-coal">{l.qty}</span>
                <button
                  onClick={() => setQty(l.variantId, l.qty + 1)}
                  className="w-8 h-8 border border-coal/25 text-coal/70 hover:border-coal hover:bg-coal hover:text-paper transition-colors disabled:opacity-40"
                  aria-label="increase"
                  disabled={isRemoving}
                >
                  +
                </button>
              </div>

              <button
                onClick={() => removeWithAnim(l.variantId)}
                disabled={isRemoving}
                aria-label={t('remove')}
                className="shrink-0 w-8 h-8 flex items-center justify-center text-coal/40 hover:text-red-600 transition-colors disabled:opacity-50"
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          );
        })}
      </div>

      {/* Summary — bordered card */}
      <div className="border border-coal/15 bg-paper-2/40 mt-6 p-5">
        <div className="font-mono text-[10px] tracking-label uppercase text-coal/55 mb-4">
          {t('summary')}
        </div>
        <div className="space-y-2 font-mono text-[12px]">
          <Row label={t('subtotal')} value={formatPrice(subtotal, locale)} />
          <Row label={t('vat')} value={formatPrice(vat, locale)} />
          <Row
            label={t('shipping')}
            value={shipping === 0 ? t('freeShipUnlocked') : formatPrice(shipping, locale)}
            accent={shipping === 0}
          />
          <div className="flex justify-between pt-3 mt-1 border-t border-coal/15 text-[15px] font-bold text-coal">
            <span>{t('total')}</span>
            <span>{formatPrice(total, locale)}</span>
          </div>
        </div>
        <p className="font-mono text-[9px] text-coal/45 mt-2">{t('vatIncluded')}</p>

        <Link
          href="/checkout"
          className="mt-5 w-full bg-coal text-paper font-bold text-[12px] tracking-[0.18em] uppercase py-4 block text-center hover:opacity-90 transition-opacity"
        >
          {t('checkout')}
        </Link>

        <Link
          href="/shop"
          className="mt-3 block text-center font-mono text-[10px] tracking-wide uppercase text-coal/55 hover:text-coal transition-colors"
        >
          ← {t('continueShopping')}
        </Link>
      </div>

      {/* Trust badges */}
      <div className="grid grid-cols-3 gap-2 mt-6 text-center">
        <Badge icon="🔒" label={t('secure')} />
        <Badge icon="🚚" label={t('fastDelivery')} />
        <Badge icon="💬" label={t('support')} />
      </div>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-coal/60">{label}</span>
      <span className={accent ? 'text-accent font-medium' : 'text-coal/80'}>{value}</span>
    </div>
  );
}

function Badge({ icon, label }: { icon: string; label: string }) {
  return (
    <div className="border border-coal/12 py-3 px-1.5 flex flex-col items-center gap-1.5">
      <span className="text-[15px]">{icon}</span>
      <span className="font-mono text-[8.5px] tracking-wide uppercase text-coal/60 leading-tight">{label}</span>
    </div>
  );
}
