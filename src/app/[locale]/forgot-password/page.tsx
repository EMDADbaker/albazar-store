'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function ForgotPasswordPage() {
  const t = useTranslations('Auth');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  // Step 1: request code. Step 2: enter code + new password.
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const pwOk = password.length >= 6;

  // Step 1 — always reports success (no account enumeration).
  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!emailOk) return setError(t('emailInvalid'));
    setLoading(true);
    const res = await fetch('/api/auth/password/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(t('checkFields'));
    setSent(true);
    setInfo(data.demo ? t('codeSentDemo') : t('resetSent'));
  }

  // Step 2 — verify code and set the new password, then sign in.
  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim().length < 4) return setError(t('codeInvalid'));
    if (!pwOk) return setError(t('passwordShort'));
    setLoading(true);
    const res = await fetch('/api/auth/password/reset', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error === 'password_short' ? t('passwordShort') : t('codeInvalid'));
      setLoading(false);
      return;
    }
    await signIn('credentials', { identifier: email, password, redirect: false });
    window.location.href = '/account';
  }

  const field =
    'w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-3 transition-colors';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper text-coal py-12">
      <form onSubmit={sent ? resetPassword : requestCode} className="w-full max-w-[340px]">
        <Link
          href="/"
          className="block font-display font-bold text-[24px] tracking-[0.05em] mb-1 text-center text-coal"
        >
          ALBAZAR<span className="text-coal/50">.</span>
        </Link>
        <div className="font-mono text-[10px] tracking-label uppercase text-coal/40 text-center mb-8">
          {t('resetTitle')}
        </div>

        {!sent ? (
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('email')}
            autoComplete="email"
            className={field}
          />
        ) : (
          <>
            <div className="font-mono text-[11px] text-coal/60 text-center mb-4 leading-relaxed">
              {t('codeSentTo', { email })}
            </div>
            <input
              dir="ltr"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/[^\d]/g, ''))}
              maxLength={6}
              placeholder={t('enterCode')}
              className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal font-mono text-[18px] tracking-[0.4em] text-center p-3 outline-none mb-3 transition-colors"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={t('newPassword')}
              autoComplete="new-password"
              className={field}
            />
          </>
        )}

        {info && <div className="text-[11px] text-green-700 mb-3 font-mono text-center">{info}</div>}
        {error && <div className="text-[11px] text-red-600 mb-4 font-mono text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coal text-paper font-bold text-[12px] tracking-[0.18em] uppercase py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? '…' : sent ? t('resetPassword') : t('sendCode')}
        </button>

        <div className="text-center mt-6 font-mono text-[11px] text-coal/50">
          <Link href="/login" className="text-coal underline hover:no-underline">
            {t('backToSignIn')}
          </Link>
        </div>
      </form>
    </div>
  );
}
