'use client';

import { useEffect, useState } from 'react';

// Listens for window 'albazar:added' events and shows a brief confirmation.
// Decoupled so any component can fire it: dispatchEvent(new CustomEvent(...)).
export default function CartToast() {
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const onAdded = (e: Event) => {
      const detail = (e as CustomEvent<{ name?: string }>).detail;
      setMsg(detail?.name ?? 'Added to cart');
      clearTimeout(timer);
      timer = setTimeout(() => setMsg(null), 2600);
    };
    window.addEventListener('albazar:added', onAdded);
    return () => {
      window.removeEventListener('albazar:added', onAdded);
      clearTimeout(timer);
    };
  }, []);

  if (!msg) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2.5 bg-coal text-paper px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)] animate-reveal">
      <span className="text-[14px]">✓</span>
      <span className="font-mono text-[11px] tracking-wide">
        <span className="font-medium">{msg}</span>
        <span className="text-paper/60"> — added to cart</span>
      </span>
    </div>
  );
}
