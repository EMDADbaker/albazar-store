'use client';

import Image from 'next/image';
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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const res = await signIn('credentials', { identifier, password, redirect: false });
    if (!res?.ok) {
      setError(true);
      setLoading(false);
      return;
    }
    const session = await getSession();
    const role = (session?.user as { role?: string })?.role;
    const dest = next || (role === 'ADMIN' || role === 'EMPLOYEE' ? '/admin' : '/account');
    window.location.href = dest;
  }

  const field =
    'w-full bg-white/[0.06] border border-white/20 focus:border-accent text-ink text-[13px] p-3 outline-none mb-3 transition-colors placeholder:text-ink/30';

  return (
    <form onSubmit={submit} className="w-full max-w-[360px]">
      <Link href="/" className="block mb-6" aria-label="ALBAZAR">
        <Image
          src="/img/albazar-logo-min.png"
          alt="ALBAZAR"
          width={640}
          height={57}
          priority
          className="h-11 w-auto invert mx-auto"
        />
      </Link>
      <div className="font-mono text-[10px] tracking-[0.35em] uppercase text-accent/80 text-center mb-8">
        {t('signIn')}
      </div>

      <input
        type="email"
        value={identifier}
        onChange={(e) => setIdentifier(e.target.value)}
        placeholder={t('email')}
        autoComplete="email"
        className={field}
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder={t('password')}
        autoComplete="current-password"
        className={`${field} mb-2`}
      />

      <div className="text-right mb-4">
        <Link
          href="/forgot-password"
          className="font-mono text-[10px] uppercase tracking-wide text-ink/50 hover:text-accent"
        >
          {t('forgotPassword')}
        </Link>
      </div>

      {error && (
        <div className="text-[11px] text-red-400 mb-4 font-mono text-center">{t('invalid')}</div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-accent text-bg font-bold text-[12px] tracking-[0.18em] uppercase py-3.5 hover:bg-accent-bright transition-colors disabled:opacity-50"
      >
        {loading ? '…' : t('signIn')}
      </button>

      <div className="text-center mt-6 font-mono text-[11px] text-ink/50">
        {t('noAccount')}{' '}
        <Link href="/register" className="text-accent underline hover:no-underline">
          {t('register')}
        </Link>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-screen flex items-center justify-center px-6 bg-bg text-ink overflow-hidden">
      {/* Cinematic backdrop */}
      <Image
        src="/img/campaign/riyadh-arch.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover opacity-[0.28]"
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/80 via-bg/50 to-bg" aria-hidden />
      {/* Form card */}
      <div className="relative w-full max-w-[420px] border border-white/10 bg-bg/60 backdrop-blur-md px-7 sm:px-10 py-12 flex justify-center">
        <Suspense fallback={<div />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
