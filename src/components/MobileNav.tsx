'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Link } from '@/i18n/routing';
import { MENU } from '@/lib/nav-menu';
import LangSwitch from './LangSwitch';

type Brand = { slug: string; nameEn: string };

type Labels = {
  shopAll: string;
  allBrands: string;
  lookbook: string;
  about: string;
  account: string;
  signin: string;
  register: string;
  admin: string;
  menu: string;
  close: string;
};

// Slide-in navigation drawer with the full MENU taxonomy. Controlled by the
// header (open/onClose) so it can be opened from either header state.
export default function MobileNav({
  open,
  onClose,
  brands,
  locale,
  labels,
}: {
  open: boolean;
  onClose: () => void;
  brands: Brand[];
  locale: string;
  labels: Labels;
}) {
  const { data: session } = useSession();
  const user = session?.user as { role?: string } | undefined;
  const loggedIn = !!user;
  const isStaff = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';
  const [openGroup, setOpenGroup] = useState<string | null>(null);
  const isRtl = locale === 'ar';
  const ar = locale === 'ar';

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const close = onClose;
  const toggleGroup = (key: string) => setOpenGroup((g) => (g === key ? null : key));
  const linkCls =
    'block font-mono text-[13px] tracking-[0.12em] uppercase text-ink/80 hover:text-accent transition-colors py-3';
  const childCls = 'block text-[12px] text-ink/60 hover:text-accent py-1.5 truncate';

  return (
    <>
      {/* Drawer — `inert` when closed removes its links from the tab order. */}
      <div
        className={`fixed inset-0 z-[95] ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
        {...({ inert: open ? undefined : '' } as Record<string, unknown>)}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={close}
        />
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          // Always slides in from the LEFT (the hamburger sits on the left in
          // both languages), so Arabic opens from the left too.
          className={`absolute inset-y-0 left-0 w-[84%] max-w-xs bg-bg border-e border-ink/10 overflow-y-auto transition-transform duration-300 ease-out ${
            open ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink/10">
            <span className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent">
              ALBAZAR
            </span>
            <button
              onClick={close}
              aria-label={labels.close}
              className="w-9 h-9 -me-1 flex items-center justify-center text-ink/70 hover:text-accent text-[18px]"
            >
              ✕
            </button>
          </div>

          <nav className="px-5 pb-8 divide-y divide-ink/[0.06]">
            <Link href="/shop" onClick={close} className={linkCls}>
              {labels.shopAll}
            </Link>

            {MENU.map((item) => {
              const label = ar ? item.ar : item.en;

              // Brands group — expandable, filled from the DB.
              if (item.brands) {
                if (brands.length === 0) {
                  return (
                    <Link key={item.en} href={item.href} onClick={close} className={linkCls}>
                      {label}
                    </Link>
                  );
                }
                const expanded = openGroup === item.en;
                return (
                  <div key={item.en}>
                    <button
                      onClick={() => toggleGroup(item.en)}
                      className={`${linkCls} flex items-center justify-between w-full`}
                    >
                      {label}
                      <span className={`text-[10px] transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    {expanded && (
                      <div className="pb-3 -mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                        {brands.slice(0, 12).map((b) => (
                          <Link key={b.slug} href={`/brand/${b.slug}`} onClick={close} className={childCls}>
                            {b.nameEn}
                          </Link>
                        ))}
                        <Link href="/brands" onClick={close} className="col-span-2 mt-1 font-mono text-[10px] uppercase tracking-wide text-accent py-1.5">
                          {labels.allBrands} ({brands.length}) →
                        </Link>
                      </div>
                    )}
                  </div>
                );
              }

              // Category group with sub-items — expandable.
              if (item.children && item.children.length > 0) {
                const expanded = openGroup === item.en;
                return (
                  <div key={item.en}>
                    <button
                      onClick={() => toggleGroup(item.en)}
                      className={`${linkCls} flex items-center justify-between w-full`}
                    >
                      {label}
                      <span className={`text-[10px] transition-transform ${expanded ? 'rotate-180' : ''}`}>▾</span>
                    </button>
                    {expanded && (
                      <div className="pb-3 -mt-1">
                        {item.children.map((c) => (
                          <Link key={c.slug} href={`/category/${c.slug}`} onClick={close} className={childCls}>
                            {ar ? c.ar : c.en}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              // Plain link (Headwear, Footwear, New Arrivals, Sale).
              return (
                <Link key={item.en} href={item.href} onClick={close} className={linkCls}>
                  {label}
                </Link>
              );
            })}

            <Link href="/lookbook" onClick={close} className={linkCls}>
              {labels.lookbook}
            </Link>
            <Link href="/about" onClick={close} className={linkCls}>
              {labels.about}
            </Link>

            {/* Account / auth. Plain <a> for /admin: it's outside [locale]; the
                i18n Link would rewrite it to /en/admin (404). */}
            {isStaff ? (
              <a href="/admin" onClick={close} className={`${linkCls} text-accent`}>
                {labels.admin}
              </a>
            ) : loggedIn ? (
              <Link href="/account" onClick={close} className={linkCls}>
                {labels.account}
              </Link>
            ) : (
              <div>
                <Link href="/login" onClick={close} className={linkCls}>
                  {labels.signin}
                </Link>
                <Link href="/register" onClick={close} className={linkCls}>
                  {labels.register}
                </Link>
              </div>
            )}

            {/* Language toggle lives here on mobile (kept off the top bar). */}
            <div className="pt-4">
              <LangSwitch />
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
