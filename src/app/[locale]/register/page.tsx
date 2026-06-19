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

  // Live password rule (mirrors the server: min 6 chars).
  const pwLongEnough = form.password.length >= 6;
  // Phone is required; email is optional (only validated if filled in).
  const emailFilled = form.email.trim().length > 0;
  const emailOk = !emailFilled || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const phoneOk = /^5\d{8}$/.test(form.phone);
  const nameOk = form.name.trim().length >= 2;

  function errorFor(code: string) {
    switch (code) {
      case 'phone_taken': return t('phoneTaken');
      case 'email_taken': return t('emailTaken');
      case 'password_short': return t('passwordShort');
      case 'name_short': return t('nameShort');
      case 'email_invalid': return t('emailInvalid');
      case 'invalid_phone': return t('phoneInvalid');
      default: return t('checkFields');
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    // Explicit client-side checks first — fail fast with a precise message.
    if (!nameOk) return setError(t('nameShort'));
    if (!phoneOk) return setError(t('phoneInvalid'));
    if (!emailOk) return setError(t('emailInvalid'));
    if (!pwLongEnough) return setError(t('passwordShort'));

    setLoading(true);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, phone: `+966${form.phone}` }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(errorFor(data.error));
      setLoading(false);
      return;
    }
    // Auto sign-in (by phone) then land on the account dashboard.
    await signIn('credentials', { phone: `+966${form.phone}`, password: form.password, redirect: false });
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
        {/* Phone is the primary identifier — required. */}
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
            autoComplete="tel-national"
            className="flex-1 bg-paper-2 border border-coal/15 focus:border-coal text-coal font-mono text-[13px] p-3 outline-none transition-colors"
          />
        </div>
        <input
          type="email"
          value={form.email}
          onChange={(e) => set('email', e.target.value)}
          placeholder={t('emailOptional')}
          autoComplete="email"
          className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-3 transition-colors"
        />
        <input
          type="password"
          value={form.password}
          onChange={(e) => set('password', e.target.value)}
          placeholder={t('password')}
          autoComplete="new-password"
          className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-2 transition-colors"
        />

        {/* Live requirement checklist — turns green as the rule is met, so the
            user fixes it before submitting (no surprise "too short" error). */}
        <ul className="mb-4 space-y-1">
          <li className={`flex items-center gap-2 font-mono text-[10px] ${pwLongEnough ? 'text-green-700' : 'text-coal/45'}`}>
            <span>{pwLongEnough ? '✓' : '○'}</span>
            {t('passwordReq')}
          </li>
        </ul>

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
