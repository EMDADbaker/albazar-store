'use client';

import { Suspense, useEffect, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Link, useRouter } from '@/i18n/routing';
import { useCart } from './CartProvider';
import { formatPrice } from '@/lib/money';

type Snapshot = { orderNumber: string; total: number };

const METHODS = [
  { id: 'mada', label: 'Mada', card: true },
  { id: 'visa', label: 'Visa / Mastercard', card: true },
  { id: 'applepay', label: 'Apple Pay', card: false },
  { id: 'stcpay', label: 'STC Pay', card: false },
  { id: 'tabby', label: 'Tabby — 4 payments', card: false },
  { id: 'tamara', label: 'Tamara — split in 3', card: false },
];

function PaymentInner() {
  const t = useTranslations('Payment');
  const locale = useLocale();
  const router = useRouter();
  const params = useSearchParams();
  const { clear } = useCart();
  const orderId = params.get('order');

  const [snap, setSnap] = useState<Snapshot | null>(null);
  const [method, setMethod] = useState('mada');
  const [card, setCard] = useState({ number: '', exp: '', cvc: '' });
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!orderId) return;
    try {
      const raw = sessionStorage.getItem(`albazar_order_${orderId}`);
      if (raw) setSnap(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [orderId]);

  const active = METHODS.find((m) => m.id === method);

  async function pay() {
    setError(false);
    setPaying(true);
    // Simulate gateway latency for realism.
    await new Promise((r) => setTimeout(r, 1100));
    try {
      const res = await fetch('/api/checkout/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, method }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(true);
        setPaying(false);
        return;
      }
      clear();
      router.push(`/checkout/confirmation?order=${orderId}`);
    } catch {
      setError(true);
      setPaying(false);
    }
  }

  if (!orderId) {
    return (
      <div className="flex-1 px-6 py-24 text-center">
        <p className="text-[14px] text-coal/50 mb-6">{t('noOrder')}</p>
        <Link href="/" className="font-mono text-[11px] uppercase tracking-wide text-coal underline">
          {t('home')}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex-1 px-5 sm:px-6 py-12 max-w-md mx-auto w-full">
      <div className="text-center mb-8">
        <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-coal/45 mb-2">
          {t('securePayment')}
        </div>
        <h1 className="text-[24px] font-bold">{t('title')}</h1>
        {snap && (
          <p className="font-mono text-[12px] text-coal/55 mt-2">
            {snap.orderNumber} · {formatPrice(snap.total, locale)}
          </p>
        )}
      </div>

      {/* Method picker */}
      <div className="grid grid-cols-2 gap-2 mb-5">
        {METHODS.map((m) => (
          <button
            key={m.id}
            onClick={() => setMethod(m.id)}
            className={`border px-3 py-3 text-start font-mono text-[11px] transition-colors ${
              method === m.id
                ? 'border-coal bg-coal text-paper'
                : 'border-coal/20 text-coal/70 hover:border-coal'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Card fields (demo — any input works) */}
      {active?.card && (
        <div className="space-y-2 mb-5">
          <input
            value={card.number}
            onChange={(e) => setCard({ ...card, number: e.target.value })}
            placeholder={t('cardNumber')}
            inputMode="numeric"
            className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal font-mono text-[13px] p-3 outline-none"
          />
          <div className="flex gap-2">
            <input
              value={card.exp}
              onChange={(e) => setCard({ ...card, exp: e.target.value })}
              placeholder="MM / YY"
              className="flex-1 bg-paper-2 border border-coal/15 focus:border-coal text-coal font-mono text-[13px] p-3 outline-none"
            />
            <input
              value={card.cvc}
              onChange={(e) => setCard({ ...card, cvc: e.target.value })}
              placeholder="CVC"
              className="w-24 bg-paper-2 border border-coal/15 focus:border-coal text-coal font-mono text-[13px] p-3 outline-none"
            />
          </div>
        </div>
      )}
      {!active?.card && (
        <div className="border border-coal/15 bg-paper-2 px-4 py-5 mb-5 text-center font-mono text-[11px] text-coal/55">
          {t('redirectNote', { method: active?.label ?? '' })}
        </div>
      )}

      {error && (
        <div className="text-[11px] text-red-600 mb-4 font-mono text-center">{t('failed')}</div>
      )}

      <button
        onClick={pay}
        disabled={paying}
        className="w-full bg-coal text-paper font-bold text-[12px] tracking-[0.18em] uppercase py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {paying ? t('processing') : snap ? `${t('pay')} ${formatPrice(snap.total, locale)}` : t('pay')}
      </button>

      <div className="flex items-center justify-center gap-2 mt-4 font-mono text-[9px] text-coal/40">
        <span>🔒</span> {t('demoNote')}
      </div>
    </div>
  );
}

export default function PaymentView() {
  return (
    <Suspense fallback={<div className="flex-1" />}>
      <PaymentInner />
    </Suspense>
  );
}
