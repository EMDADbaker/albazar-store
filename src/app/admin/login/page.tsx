'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(false);
    setLoading(true);
    const res = await signIn('credentials', {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.ok) {
      router.push('/admin');
      router.refresh();
    } else {
      setError(true);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={submit} className="w-full max-w-[320px]">
        <div className="font-display font-bold text-[22px] tracking-[0.05em] mb-1 text-center">
          ALBAZAR<span className="text-accent">.</span>
        </div>
        <div className="font-mono text-[10px] tracking-label uppercase text-ink/40 text-center mb-8">
          Admin
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="username"
          className="w-full bg-ink/[0.04] border border-ink/[0.12] focus:border-accent/50 text-ink text-[13px] p-3 outline-none mb-3 transition-colors"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          autoComplete="current-password"
          className="w-full bg-ink/[0.04] border border-ink/[0.12] focus:border-accent/50 text-ink text-[13px] p-3 outline-none mb-4 transition-colors"
        />

        {error && (
          <div className="text-[11px] text-red-400/80 mb-4 font-mono text-center">
            Invalid credentials.
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-accent text-bg font-bold text-[12px] tracking-[0.18em] uppercase py-3.5 hover:bg-accent-bright transition-colors disabled:opacity-50"
        >
          {loading ? '…' : 'Sign in'}
        </button>
      </form>
    </div>
  );
}
