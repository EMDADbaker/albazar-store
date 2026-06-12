'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { isValidSaudiPhone } from '@/lib/phone';

export default function Vault({
  source = 'home',
  light = false,
}: {
  source?: string;
  light?: boolean;
}) {
  const t = useTranslations('Vault');
  const [phone, setPhone] = useState('');
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Theme-aware class fragments (dark hero/footer vs light shopping pages).
  const c = light
    ? {
        sub: 'text-coal/50',
        accent: 'text-coal',
        okBox: 'border-coal/30 text-coal',
        prefix: 'text-coal/50 border-coal/20 bg-paper-2',
        input: 'bg-paper-2 border-coal/20 text-coal focus:border-coal',
        btn: 'bg-coal text-paper hover:opacity-90',
      }
    : {
        sub: 'text-ink/40',
        accent: 'text-accent',
        okBox: 'border-accent/35 text-accent',
        prefix: 'text-ink/50 border-ink/[0.12] bg-ink/[0.03]',
        input: 'bg-ink/[0.04] border-ink/[0.12] text-ink focus:border-accent/50',
        btn: 'bg-accent text-bg hover:bg-accent-bright',
      };

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
      setDone(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-[380px] mx-auto">
      <div className="text-[15px] font-bold mb-1">
        {t('title').split(t('titleAccent'))[0]}
        <span className={c.accent}>{t('titleAccent')}</span>
      </div>
      <div className={`text-[11px] mb-4 ${c.sub}`}>{t('subtitle')}</div>

      {done ? (
        <div className={`flex items-center justify-center gap-2 border py-3.5 text-[12px] ${c.okBox}`}>
          {t('success')}
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <div className={`font-mono text-[12px] border flex items-center px-2.5 ${c.prefix}`}>
              +966
            </div>
            <input
              dir="ltr"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ''))}
              placeholder={t('phonePlaceholder')}
              maxLength={9}
              className={`flex-1 border font-mono text-[12px] p-3 outline-none min-w-0 transition-colors ${
                error ? 'border-red-500/70' : c.input
              }`}
            />
            <button
              onClick={join}
              disabled={submitting}
              className={`font-bold text-[10px] tracking-[0.18em] uppercase px-[18px] disabled:opacity-60 transition-colors ${c.btn}`}
            >
              {t('join')}
            </button>
          </div>
          {error && (
            <div className="text-[10px] text-red-500 mt-2 font-mono">{t('invalidPhone')}</div>
          )}
        </>
      )}
    </div>
  );
}
