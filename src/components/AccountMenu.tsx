'use client';

import { useEffect, useRef, useState } from 'react';
import { signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

// Click-to-open account dropdown: links + sign in/out for every role.
export default function AccountMenu({
  loggedIn,
  isStaff,
  name,
}: {
  loggedIn: boolean;
  isStaff: boolean;
  name?: string | null;
}) {
  const t = useTranslations('AccountMenu');
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const item =
    'block w-full text-start px-4 py-2.5 text-[11px] tracking-wide uppercase text-ink/70 hover:text-accent hover:bg-ink/[0.05] transition-colors';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={t('account')}
        aria-expanded={open}
        className={`p-1.5 transition-colors ${open ? 'text-accent' : 'text-ink/80 hover:text-accent'}`}
      >
        {/* user icon */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
          <circle cx="12" cy="8" r="3.5" />
          <path d="M4.5 20c1.2-3.4 4-5 7.5-5s6.3 1.6 7.5 5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-bg border border-ink/15 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.5)] z-[70]">
          {loggedIn ? (
            <>
              {name && (
                <div className="px-4 pb-2 mb-1 border-b border-ink/10 font-mono text-[10px] text-accent/80 truncate">
                  {name}
                </div>
              )}
              <Link href="/account" className={item} onClick={() => setOpen(false)}>
                {t('account')}
              </Link>
              <Link href="/account#orders" className={item} onClick={() => setOpen(false)}>
                {t('orders')}
              </Link>
              <Link href="/account#wishlist" className={item} onClick={() => setOpen(false)}>
                {t('wishlist')}
              </Link>
              {isStaff && (
                <a href="/admin" className={`${item} text-accent/90`}>
                  {t('admin')}
                </a>
              )}
              <button onClick={() => signOut({ callbackUrl: '/' })} className={`${item} border-t border-ink/10 mt-1 pt-3`}>
                {t('signOut')}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className={item} onClick={() => setOpen(false)}>
                {t('signIn')}
              </Link>
              <Link href="/register" className={item} onClick={() => setOpen(false)}>
                {t('register')}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
