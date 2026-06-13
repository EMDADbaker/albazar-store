'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { Link, useRouter } from '@/i18n/routing';
import { useCart } from './CartProvider';
import { formatPrice, vatOf, inclVat } from '@/lib/money';
import { shippingFor, SAUDI_CITIES } from '@/lib/shipping';
import { isValidSaudiPhone } from '@/lib/phone';

export type Prefill = {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  street: string;
  building: string;
  postalCode: string;
};

type Form = Prefill;

const EMPTY: Form = {
  fullName: '',
  phone: '',
  email: '',
  city: '',
  district: '',
  street: '',
  building: '',
  postalCode: '',
};

export default function CheckoutView({ prefill }: { prefill?: Prefill }) {
  const t = useTranslations('Checkout');
  const locale = useLocale();
  const router = useRouter();
  const { lines, subtotal, clear, remove } = useCart();

  const [form, setForm] = useState<Form>(prefill ?? EMPTY);
  const [whatsappOptIn, setWhatsappOptIn] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const shipping = shippingFor(subtotal);
  const vat = vatOf(subtotal);
  const total = subtotal + vat + shipping;

  function set<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit() {
    setError(null);
    if (!isValidSaudiPhone(`+966${form.phone}`)) return setError(t('errorPhone'));
    if (!/^\d{5}$/.test(form.postalCode)) return setError(t('errorPostal'));
    if (!form.fullName || !form.city || !form.district || !form.street || !form.building) {
      return setError(t('errorGeneric'));
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          address: { ...form, phone: `+966${form.phone}` },
          lines: lines.map((l) => ({ variantId: l.variantId, qty: l.qty })),
          whatsappOptIn,
        }),
      });
      const data = await res.json();
      if (res.status === 409 && data.error === 'cart_changed') {
        // Drop the no-longer-available lines and ask the user to review.
        (data.removeVariantIds as string[]).forEach((id) => remove(id));
        setError(t('cartChanged'));
        setSubmitting(false);
        return;
      }
      if (!res.ok || !data.ok) {
        setError(t('errorGeneric'));
        setSubmitting(false);
        return;
      }
      sessionStorage.setItem(
        `albazar_order_${data.orderId}`,
        JSON.stringify({ orderNumber: data.orderNumber, ...data.summary }),
      );
      // Cart is cleared after payment confirms, not here.
      router.push(`/checkout/payment?order=${data.orderId}`);
    } catch {
      setError(t('errorGeneric'));
      setSubmitting(false);
    }
  }

  return (
    <div className="flex-1 px-5 sm:px-6 py-12 max-w-4xl mx-auto w-full grid md:grid-cols-[1fr_360px] gap-10">
      <div>
        <h1 className="text-[26px] font-bold mb-8">{t('title')}</h1>

        <Section label={t('contact')}>
          <Field label={t('fullName')} value={form.fullName} onChange={(v) => set('fullName', v)} />
          <div>
            <FieldLabel>{t('phone')}</FieldLabel>
            <div className="flex gap-2">
              <div className="font-mono text-[13px] text-coal/50 border border-coal/15 flex items-center px-3 bg-paper-2">
                +966
              </div>
              <input
                dir="ltr"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value.replace(/[^\d]/g, ''))}
                maxLength={9}
                placeholder="5X XXX XXXX"
                className="flex-1 bg-paper-2 border border-coal/15 focus:border-coal text-coal font-mono text-[13px] p-3 outline-none transition-colors"
              />
            </div>
          </div>
          <Field label={t('email')} value={form.email} onChange={(v) => set('email', v)} type="email" optional />
        </Section>

        <Section label={t('address')}>
          <div>
            <FieldLabel>{t('city')}</FieldLabel>
            <select
              value={form.city}
              onChange={(e) => set('city', e.target.value)}
              className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none transition-colors"
            >
              <option value="">{t('cityPlaceholder')}</option>
              {SAUDI_CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <Field label={t('district')} value={form.district} onChange={(v) => set('district', v)} />
          <Field label={t('street')} value={form.street} onChange={(v) => set('street', v)} />
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('building')} value={form.building} onChange={(v) => set('building', v)} />
            <Field
              label={t('postalCode')}
              value={form.postalCode}
              onChange={(v) => set('postalCode', v.replace(/[^\d]/g, ''))}
              maxLength={5}
            />
          </div>
        </Section>

        <label className="flex items-center gap-2.5 mt-2 cursor-pointer">
          <input
            type="checkbox"
            checked={whatsappOptIn}
            onChange={(e) => setWhatsappOptIn(e.target.checked)}
            className="accent-coal w-4 h-4"
          />
          <span className="text-[12px] text-coal/65">{t('whatsappOptIn')}</span>
        </label>
      </div>

      <aside className="md:sticky md:top-20 h-fit border border-coal/15 p-5 bg-paper-2/40">
        <div className="font-mono text-[10px] tracking-label uppercase text-coal/45 mb-4">
          {t('summary')}
        </div>
        <div className="space-y-3 mb-5">
          {lines.map((l) => {
            const name = locale === 'ar' ? l.nameAr : l.nameEn;
            return (
              <div key={l.variantId} className="flex justify-between gap-3 text-[12px]">
                <span className="text-coal/70 truncate">
                  {name} <span className="text-coal/35">· {l.size} × {l.qty}</span>
                </span>
                <span className="font-mono text-coal/70 whitespace-nowrap">
                  {formatPrice(inclVat(l.price * l.qty), locale)}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2 font-mono text-[12px] border-t border-coal/12 pt-4">
          <Row label={t('subtotal')} value={formatPrice(subtotal, locale)} />
          <Row label={t('vat')} value={formatPrice(vat, locale)} />
          <Row
            label={t('shipping')}
            value={shipping === 0 ? t('freeShipping') : formatPrice(shipping, locale)}
          />
          <div className="flex justify-between pt-3 border-t border-coal/12 text-[15px] text-coal">
            <span>{t('total')}</span>
            <span>{formatPrice(total, locale)}</span>
          </div>
        </div>

        {error && <div className="text-[11px] text-red-600 mt-4 font-mono">{error}</div>}

        <button
          onClick={submit}
          disabled={submitting}
          className="mt-5 w-full bg-coal text-paper font-bold text-[12px] tracking-[0.18em] uppercase py-4 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {submitting ? t('placing') : t('placeOrder')}
        </button>
        <p className="font-mono text-[9px] text-coal/40 mt-3 text-center leading-relaxed">
          {t('paymentNote')}
        </p>
      </aside>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="font-mono text-[10px] tracking-label uppercase text-coal/55 mb-4">{label}</div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <div className="font-mono text-[9px] uppercase tracking-wide text-coal/40 mb-1.5">{children}</div>;
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
  optional,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  optional?: boolean;
  maxLength?: number;
}) {
  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none transition-colors"
        required={!optional}
      />
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
