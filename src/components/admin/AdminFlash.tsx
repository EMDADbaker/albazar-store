'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

function Flash() {
  const params = useSearchParams();
  const created = params.get('created');
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!created) return;
    setShow(true);
    const id = setTimeout(() => setShow(false), 3000);
    // Clean the ?created param from the URL without a reload.
    const url = new URL(window.location.href);
    url.searchParams.delete('created');
    window.history.replaceState({}, '', url.toString());
    return () => clearTimeout(id);
  }, [created]);

  if (!show || !created) return null;
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-[120] flex items-center gap-2.5 bg-emerald-500 text-black px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)]">
      <span className="text-[14px]">✓</span>
      <span className="font-mono text-[11px] tracking-wide font-medium">{created} created</span>
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
