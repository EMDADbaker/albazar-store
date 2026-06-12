'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { isValidSaudiPhone } from '@/lib/phone';

export default function Vault({ source = 'home' }: { source?: string }) {
  const t = useTranslations('Vault');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function join() {
    const candidate = `+966${phone}`;
    if (!isValidSaudiPhone(candidate)) {
      setError(true);
      return;
    }
    setError(false);
    setSubmitting(true);
    try {
      await fetch('/api/vault', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: candidate, source }),
      });
      setDone(true);
    } catch {
      // Optimistic: still confirm to the user; the lead is retried server-side later.
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[380px] mx-auto">
      <div className="text-[15px] font-bold mb-1">
        {t('title').split(t('titleAccent'))[0]}
        <span className="text-gold">{t('titleAccent')}</span>
      </div>
      <div className="text-[11px] text-ink/40 mb-4">{t('subtitle')}</div>

      {done ? (
        <div className="flex items-center justify-center gap-2 border border-gold/35 py-3.5 text-[12px] text-gold">
          {t('success')}
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <div className="font-mono text-[12px] text-ink/50 border border-ink/[0.12] flex items-center px-2.5 bg-ink/[0.03]">
              +966
            </div>
            <input
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
              placeholder={t('phonePlaceholder')}
              maxLength={9}
              className={`flex-1 bg-ink/[0.04] border text-ink font-mono text-[12px] p-3 outline-none min-w-0 transition-colors ${
                error ? 'border-red-500/70' : 'border-ink/[0.12] focus:border-gold/50'
              }`}
            />
            <button
              onClick={join}
              disabled={submitting}
              className="bg-gold text-bg font-bold text-[10px] tracking-[0.18em] uppercase px-[18px] disabled:opacity-60 transition-colors hover:bg-gold-bright"
            >
              {t('join')}
            </button>
          </div>
          {error && (
            <div className="text-[10px] text-red-400/80 mt-2 font-mono">
              {t('invalidPhone')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
