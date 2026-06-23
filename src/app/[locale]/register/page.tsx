'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export default function RegisterPage() {
  const t = useTranslations('Auth');
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [code, setCode] = useState('');
  // Two steps: enter details + send code (1), then confirm code + create (2).
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof form, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const pwLongEnough = form.password.length >= 6;
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  // Phone is optional; only validated when filled in.
  const phoneFilled = form.phone.trim().length > 0;
  const phoneOk = !phoneFilled || /^5\d{8}$/.test(form.phone);
  const nameOk = form.name.trim().length >= 2;

  function errorFor(code: string) {
    switch (code) {
      case 'phone_taken': return t('phoneTaken');
      case 'email_taken': return t('emailTaken');
      case 'password_short': return t('passwordShort');
      case 'name_short': return t('nameShort');
      case 'email_invalid': return t('emailInvalid');
      case 'invalid_phone': return t('phoneInvalid');
      case 'code_invalid': return t('codeInvalid');
      case 'too_soon': return t('codeTooSoon');
      default: return t('checkFields');
    }
  }

  // Step 1 — validate fields, then email a verification code.
  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    if (!nameOk) return setError(t('nameShort'));
    if (!emailOk) return setError(t('emailInvalid'));
    if (!phoneOk) return setError(t('phoneInvalid'));
    if (!pwLongEnough) return setError(t('passwordShort'));

    setLoading(true);
    const res = await fetch('/api/auth/email/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: form.email }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) return setError(errorFor(data.error));
    setCodeSent(true);
    setInfo(data.demo ? t('codeSentDemo') : t('codeSent'));
  }

  // Step 2 — confirm the code and create the account.
  async function createAccount(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (code.trim().length < 4) return setError(t('codeInvalid'));

    setLoading(true);
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        email: form.email,
        password: form.password,
        code,
        phone: form.phone ? `+966${form.phone}` : '',
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(errorFor(data.error));
      setLoading(false);
      return;
    }
    // Auto sign-in by email then land on the account dashboard.
    await signIn('credentials', { identifier: form.email, password: form.password, redirect: false });
    window.location.href = '/account';
  }

  const field =
    'w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-3 transition-colors';

  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper text-coal py-12">
      <form onSubmit={codeSent ? createAccount : sendCode} className="w-full max-w-[340px]">
        <Link
          href="/"
          className="block font-display font-bold text-[24px] tracking-[0.05em] mb-1 text-center text-coal"
        >
          ALBAZAR<span className="text-coal/50">.</span>
        </Link>
        <div className="font-mono text-[10px] tracking-label uppercase text-coal/40 text-center mb-8">
          {t('createAccount')}
        </div>

        {!codeSent ? (
          <>
            <input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder={t('name')}
              className={field}
            />
            {/* Email is the primary identifier — required and verified. */}
            <input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              placeholder={t('email')}
              autoComplete="email"
              className={field}
            />
            {/* Phone optional — for delivery / WhatsApp only. */}
            <div className="flex gap-2 mb-3">
              <div className="font-mono text-[13px] text-coal/50 border border-coal/15 flex items-center px-3 bg-paper-2">
                +966
              </div>
              <input
                dir="ltr"
                value={form.phone}
                onChange={(e) => set('phone', e.target.value.replace(/[^\d]/g, ''))}
                maxLength={9}
                placeholder={t('phoneOptional')}
                autoComplete="tel-national"
                className="flex-1 bg-paper-2 border border-coal/15 focus:border-coal text-coal font-mono text-[13px] p-3 outline-none transition-colors"
              />
            </div>
            <input
              type="password"
              value={form.password}
              onChange={(e) => set('password', e.target.value)}
              placeholder={t('password')}
              autoComplete="new-password"
              className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-2 transition-colors"
            />
            <ul className="mb-4 space-y-1">
              <li className={`flex items-center gap-2 font-mono text-[10px] ${pwLongEnough ? 'text-green-700' : 'text-coal/45'}`}>
                <span>{pwLongEnough ? '✓' : '○'}</span>
                {t('passwordReq')}
              </li>
            </ul>
          </>
        ) : (
          <>
            <div className="font-mono text-[11px] text-coal/60 text-center mb-4 leading-relaxed">
              {t('codeSentTo', { email: form.email })}
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
            <button
              type="button"
              onClick={sendCode}
              className="block mx-auto mb-3 font-mono text-[10px] uppercase tracking-wide text-coal/50 hover:text-coal"
            >
              {t('resendCode')}
            </button>
          </>
        )}

        {info && <div className="text-[11px] text-green-700 mb-3 font-mono text-center">{info}</div>}
        {error && <div className="text-[11px] text-red-600 mb-4 font-mono text-center">{error}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coal text-paper font-bold text-[12px] tracking-[0.18em] uppercase py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? '…' : codeSent ? t('createAccount') : t('sendCode')}
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
