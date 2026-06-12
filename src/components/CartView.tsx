'use client';

import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCart } from './CartProvider';
import { formatPrice, vatOf, inclVat } from '@/lib/money';

// Light-theme cart.
export default function CartView() {
  const t = useTranslations('Cart');
  const locale = useLocale();
  const { lines, subtotal, setQty, remove } = useCart();

  if (lines.length === 0) {
    return (
      <div className="flex-1 px-6 py-24 text-center">
        <p className="text-[14px] text-coal/50 mb-6">{t('empty')}</p>
        <Link
          href="/drop/drop-001"
          className="font-mono text-[11px] tracking-wide uppercase text-coal border border-coal/30 px-5 py-2.5 inline-block hover:bg-coal hover:text-paper transition-colors"
        >
          Drop 001
        </Link>
      </div>
    );
  }

  const vat = vatOf(subtotal);
  const total = inclVat(subtotal);

  return (
    <div className="flex-1 px-5 sm:px-6 py-12 max-w-2xl mx-auto w-full">
      <h1 className="text-[26px] font-bold mb-8">{t('title')}</h1>

      <div className="divide-y divide-coal/12 border-y border-coal/12">
        {lines.map((l) => {
          const name = locale === 'ar' ? l.nameAr : l.nameEn;
          return (
            <div key={l.variantId} className="flex items-center gap-4 py-4">
              <div className="w-16 h-20 bg-paper-2 shrink-0 overflow-hidden">
                {l.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={l.image} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="w-1/2 h-1/2 bg-coal/[0.08]" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium truncate">{name}</div>
                <div className="font-mono text-[10px] text-coal/45 mt-0.5">
                  {l.size} · {formatPrice(inclVat(l.price), locale)}
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono text-[12px]">
                <button
                  onClick={() => setQty(l.variantId, l.qty - 1)}
                  className="w-7 h-7 border border-coal/20 text-coal/60 hover:border-coal"
                  aria-label="decrease"
                >
                  −
                </button>
                <span className="w-6 text-center tabular-nums">{l.qty}</span>
                <button
                  onClick={() => setQty(l.variantId, l.qty + 1)}
                  className="w-7 h-7 border border-coal/20 text-coal/60 hover:border-coal"
                  aria-label="increase"
                >
                  +
                </button>
              </div>

              <button
                onClick={() => remove(l.variantId)}
                className="font-mono text-[9px] uppercase tracking-wide text-coal/35 hover:text-coal"
              >
                {t('remove')}
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-2 font-mono text-[12px]">
        <Row label={t('subtotal')} value={formatPrice(subtotal, locale)} />
        <Row label={t('vat')} value={formatPrice(vat, locale)} />
        <div className="flex justify-between pt-3 border-t border-coal/12 text-[15px] text-coal">
          <span>{t('total')}</span>
          <span>{formatPrice(total, locale)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="mt-8 w-full bg-coal text-paper font-bold text-[12px] tracking-[0.18em] uppercase py-4 block text-center hover:opacity-90 transition-opacity"
      >
        {t('checkout')}
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-coal/55">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
