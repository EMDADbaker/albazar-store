'use client';

import { useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { formatPrice } from '@/lib/money';
import Vault from './Vault';

type OrderSnapshot = {
  orderNumber: string;
  subtotal: number;
  vatAmount: number;
  shippingCost: number;
  total: number;
  phone: string;
  items: {
    productSlug: string;
    nameAr: string;
    nameEn: string;
    size: string;
    qty: number;
    unitPrice: number;
  }[];
};

export default function ConfirmationView() {
  const t = useTranslations('Confirmation');
  const locale = useLocale();
  const params = useSearchParams();
  const orderId = params.get('order');
  const [order, setOrder] = useState<OrderSnapshot | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setLoaded(true);
      return;
    }
    try {
      const raw = sessionStorage.getItem(`albazar_order_${orderId}`);
      if (raw) setOrder(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, [orderId]);

  if (!loaded) return <div className="flex-1" />;

  if (!order) {
    return (
      <div className="flex-1 px-6 py-24 text-center">
        <p className="text-[14px] text-ink/40 mb-6">{t('notFound')}</p>
        <Link
          href="/"
          className="font-mono text-[11px] tracking-wide uppercase text-accent border border-accent/30 px-5 py-2.5 inline-block hover:bg-accent/10 transition-colors"
        >
          {t('continue')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 px-6 py-14 max-w-xl mx-auto w-full text-center">
      <div className="font-mono text-[10px] tracking-[0.4em] text-accent/90 uppercase mb-4">
        {t('eyebrow')}
      </div>
      <h1 className="text-[clamp(32px,7vw,48px)] font-bold tracking-[-0.02em] leading-[1.02] mb-3">
        {t('title')}
      </h1>
      <p className="text-[13px] text-ink/45 mb-2">{t('subtitle')}</p>

      <div className="inline-flex items-center gap-2 font-mono text-[12px] text-ink/70 border border-ink/[0.12] px-4 py-2 mt-4">
        <span className="text-ink/40 uppercase tracking-wide">{t('orderNumber')}</span>
        <span className="text-accent">{order.orderNumber}</span>
      </div>

      {/* Items */}
      <div className="mt-10 text-start">
        <div className="font-mono text-[10px] tracking-label uppercase text-ink/40 mb-4">
          {t('items')}
        </div>
        <div className="divide-y divide-ink/[0.08] border-y border-ink/[0.08]">
          {order.items.map((it, i) => {
            const name = locale === 'ar' ? it.nameAr : it.nameEn;
            return (
              <div key={i} className="flex items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="text-[13px] font-medium truncate">{name}</div>
                  <div className="font-mono text-[10px] text-ink/40 mt-0.5">
                    {it.size} × {it.qty}
                  </div>
                </div>
                {/* Piece number assigned on payment webhook — shown pending for now */}
                <div className="font-mono text-[11px] text-accent/60 whitespace-nowrap">
                  — / {it.qty}
                </div>
              </div>
            );
          })}
        </div>
        <p className="font-mono text-[9px] text-ink/30 mt-3 leading-relaxed">{t('pieceNote')}</p>

        <div className="flex justify-between font-mono text-[15px] text-ink mt-6 pt-4 border-t border-ink/[0.08]">
          <span>{t('totalPending')}</span>
          <span>{formatPrice(order.total, locale)}</span>
        </div>
      </div>

      {/* Vault */}
      <div className="mt-14 pt-10 border-t border-ink/[0.08]">
        <h2 className="text-[18px] font-bold mb-5">{t('vaultTitle')}</h2>
        <Vault source="confirmation" />
      </div>

      <Link
        href="/drop/drop-001"
        className="inline-block mt-12 font-mono text-[11px] tracking-wide uppercase text-ink/50 hover:text-ink transition-colors"
      >
        {t('continue')}
      </Link>
    </div>
  );
}
