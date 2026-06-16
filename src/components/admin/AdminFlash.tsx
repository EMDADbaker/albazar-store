'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function Flash() {
  const params = useSearchParams();
  const created = params.get('created');
  const flash = params.get('flash');
  const [msg, setMsg] = useState<string | null>(null);

  // Toast from a redirect query (?created=Brand → "Brand created", or ?flash=…).
  useEffect(() => {
    const initial = flash ?? (created ? `${created} created` : null);
    if (!initial) return;
    setMsg(initial);
    const url = new URL(window.location.href);
    url.searchParams.delete('created');
    url.searchParams.delete('flash');
    window.history.replaceState({}, '', url.toString());
  }, [created, flash]);

  // Toast from an inline client action (toggle/delete/stock/status/save).
  useEffect(() => {
    const onFlash = (e: Event) => {
      const detail = (e as CustomEvent<{ message: string }>).detail;
      if (detail?.message) setMsg(detail.message);
    };
    window.addEventListener('albazar:admin-flash', onFlash);
    return () => window.removeEventListener('albazar:admin-flash', onFlash);
  }, []);

  // Auto-dismiss whenever a new message lands.
  useEffect(() => {
    if (!msg) return;
    const id = setTimeout(() => setMsg(null), 2600);
    return () => clearTimeout(id);
  }, [msg]);

  if (!msg) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2.5 bg-emerald-500 text-black px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <span className="text-[14px]">✓</span>
      <span className="font-mono text-[11px] tracking-wide font-medium">{msg}</span>
    </div>
  );
}

export default function AdminFlash() {
  return (
    <Suspense fallback={null}>
      <Flash />
    </Suspense>
  );
}
