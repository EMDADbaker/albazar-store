'use client';

import { Suspense, useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

function LoginForm() {
  const t = useTranslations('Auth');
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const res = await signIn('credentials', { email, password, redirect: false });
    if (!res?.ok) {
      setError(true);
      setLoading(false);
      return;
    }
    // Read role from the fresh session and route accordingly.
    const session = await getSession();
    const role = (session?.user as { role?: string })?.role;
    const dest = next || (role === 'ADMIN' || role === 'EMPLOYEE' ? '/admin' : '/account');
    window.location.href = dest;
  }

  return (
    <form onSubmit={submit} className="w-full max-w-[340px]">
      <Link
        href="/"
        className="block font-display font-bold text-[24px] tracking-[0.05em] mb-1 text-center text-coal"
      >
        ALBAZAR<span className="text-coal/50">.</span>
      </Link>
      <div className="font-mono text-[10px] tracking-label uppercase text-coal/40 text-center mb-8">
        {t('signIn')}
      </div>

      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={t('email')}
        autoComplete="username"
        className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-3 transition-colors"
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('password')}
        autoComplete="current-password"
        className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-3 outline-none mb-4 transition-colors"
      />

      {error && (
        <div className="text-[11px] text-red-600 mb-4 font-mono text-center">
          {t('invalid')}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-coal text-paper font-bold text-[12px] tracking-[0.18em] uppercase py-3.5 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {loading ? '…' : t('signIn')}
      </button>

      <div className="text-center mt-6 font-mono text-[11px] text-coal/50">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-coal underline hover:no-underline">
          {t('register')}
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 bg-paper text-coal">
      <Suspense fallback={<div />}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
