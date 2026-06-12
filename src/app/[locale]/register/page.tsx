'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, phone: `+966${form.phone}` }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error === 'email_taken' ? t('emailTaken') : t('checkFields'));
      setLoading(false);
      return;
    }
    // Auto sign-in then land on the account dashboard.
    await signIn('credentials', { email: form.email, password: form.password, redirect: false });
    window.location.href = '/account';
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper text-coal py-12">
      <form onSubmit={submit} className="w-full max-w-[340px]">
        <Link
          href="/"
          className="block font-display font-bold text-[24px] tracking-[0.05em] mb-1 text-center text-coal"
        >
          ALBAZAR<span className="text-coal/50">.</span>
        </Link>
        <div className="font-mono text-[10px] tracking-label uppercase text-coal/40 text-center mb-8">
          {t('createAccount')}
        </div>

        <input
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
          placeholder={t('name')}
          className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-3 transition-colors"
        />
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder={t('email')}
          autoComplete="username"
          className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-3 transition-colors"
        />
        <div className="flex gap-2 mb-3">
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
        <input
          type="password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          placeholder={t('password')}
          autoComplete="new-password"
          className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-4 transition-colors"
        />

        {error && (
          <div className="text-[11px] text-red-600 mb-4 font-mono text-center">{error}</div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coal text-paper font-bold text-[12px] tracking-[0.18em] uppercase py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? '…' : t('createAccount')}
        </button>

        <div className="text-center mt-6 font-mono text-[11px] text-coal/50">
          {t('haveAccount')}{' '}
          <Link href="/login" className="text-coal underline hover:no-underline">
            {t('signIn')}
          </Link>
        </div>
      </form>
    </div>
  );
}
