'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from '@/i18n/routing';

// Search icon that opens a full-width overlay with an input. Submitting routes
// to /search?q=… (a server page that filters products by name/brand).
export default function SearchOverlay({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const term = q.trim();
    if (!term) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(term)}`);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={label}
        className="p-1.5 text-ink/80 hover:text-accent transition-colors"
      >
        <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <circle cx="11" cy="11" r="7" />
          <path d="M21 21l-4.3-4.3" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[110]">
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-bg border-b border-ink/10 px-5 sm:px-8 py-5">
            <form onSubmit={submit} className="max-w-3xl mx-auto flex items-center gap-3">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" className="text-ink/50 shrink-0">
                <circle cx="11" cy="11" r="7" />
                <path d="M21 21l-4.3-4.3" />
              </svg>
              <input
                ref={inputRef}
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-transparent text-ink text-[16px] outline-none placeholder:text-ink/35"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="w-8 h-8 flex items-center justify-center text-ink/60 hover:text-accent"
              >
                ✕
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
