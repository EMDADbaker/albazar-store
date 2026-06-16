'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

type Item = { href: string; label: string };

// Hamburger + slide-in side panel for the admin dashboard on phones and narrow
// windows (replaces the wrap/scroll-prone horizontal nav below `md`).
export default function AdminMobileNav({ items }: { items: Item[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Menu"
        aria-expanded={open}
        className="md:hidden w-10 h-10 -ms-2 flex items-center justify-center text-white/85 hover:text-white"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      <div
        className={`md:hidden fixed inset-0 z-[110] ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
        {...({ inert: open ? undefined : '' } as Record<string, unknown>)}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setOpen(false)}
        />
        <div
          className={`absolute inset-y-0 left-0 w-[78%] max-w-xs bg-[#101013] border-e border-white/12 overflow-y-auto transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/12">
            <span className="font-display font-bold text-[14px] tracking-[0.05em] text-white">
              ALBAZAR<span className="text-accent">.</span>
              <span className="font-mono text-[9px] text-white/45 ms-2 tracking-label uppercase">Admin</span>
            </span>
            <button
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="w-9 h-9 -me-1 flex items-center justify-center text-white/70 hover:text-white text-[18px]"
            >
              ✕
            </button>
          </div>

          <nav className="px-3 py-3">
            {items.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                onClick={() => setOpen(false)}
                className={`block px-3 py-3 font-mono text-[12px] tracking-wide uppercase transition-colors ${
                  isActive(n.href)
                    ? 'text-accent bg-white/[0.04]'
                    : 'text-white/70 hover:text-white hover:bg-white/[0.03]'
                }`}
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
