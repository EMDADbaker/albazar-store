'use client';

import { useEffect, useState } from 'react';
import { Link } from '@/i18n/routing';

type Brand = { slug: string; nameEn: string };
type Cat = { slug: string; nameAr: string; nameEn: string; brands: Brand[] };

type Labels = {
  shop: string;
  brands: string;
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

// Mobile / narrow-window navigation: a hamburger that opens a slide-in drawer.
// Replaces the wrap-prone desktop category row below the `lg` breakpoint.
export default function MobileNav({
  categories,
  brands,
  locale,
  labels,
  loggedIn,
  isStaff,
}: {
  categories: Cat[];
  brands: Brand[];
  locale: string;
  labels: Labels;
  loggedIn: boolean;
  isStaff: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [brandsOpen, setBrandsOpen] = useState(false);
  const isRtl = locale === 'ar';

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const close = () => setOpen(false);
  const linkCls =
    'block font-mono text-[13px] tracking-[0.12em] uppercase text-ink/80 hover:text-accent transition-colors py-3';

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label={labels.menu}
        aria-expanded={open}
        className="lg:hidden w-11 h-11 -ms-2 flex items-center justify-center text-ink/85 hover:text-accent transition-colors"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 6h18M3 12h18M3 18h18" />
        </svg>
      </button>

      {/* Drawer */}
      <div
        className={`lg:hidden fixed inset-0 z-[90] ${open ? '' : 'pointer-events-none'}`}
        aria-hidden={!open}
      >
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${
            open ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={close}
        />
        <div
          dir={isRtl ? 'rtl' : 'ltr'}
          className={`absolute inset-y-0 ${
            isRtl ? 'right-0' : 'left-0'
          } w-[84%] max-w-xs bg-bg border-ink/10 overflow-y-auto transition-transform duration-300 ease-out ${
            isRtl ? 'border-s' : 'border-e'
          } ${open ? 'translate-x-0' : isRtl ? 'translate-x-full' : '-translate-x-full'}`}
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
            <Link href="/" onClick={close} className={linkCls}>
              {labels.shop}
            </Link>

            {/* Brands — expandable */}
            {brands.length > 0 && (
              <div>
                <button
                  onClick={() => setBrandsOpen((v) => !v)}
                  className={`${linkCls} flex items-center justify-between w-full`}
                >
                  {labels.brands}
                  <span className={`text-[10px] transition-transform ${brandsOpen ? 'rotate-180' : ''}`}>▾</span>
                </button>
                {brandsOpen && (
                  <div className="pb-3 -mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                    {brands.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/brand/${b.slug}`}
                        onClick={close}
                        className="text-[12px] text-ink/60 hover:text-accent py-1.5 truncate"
                      >
                        {b.nameEn}
                      </Link>
                    ))}
                    <Link
                      href="/brands"
                      onClick={close}
                      className="col-span-2 mt-1 font-mono text-[10px] uppercase tracking-wide text-accent py-1.5"
                    >
                      {labels.allBrands} →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                onClick={close}
                className={linkCls}
              >
                {isRtl ? c.nameAr : c.nameEn}
              </Link>
            ))}

            <Link href="/lookbook" onClick={close} className={linkCls}>
              {labels.lookbook}
            </Link>
            <Link href="/about" onClick={close} className={linkCls}>
              {labels.about}
            </Link>

            {/* Account / auth */}
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
          </nav>
        </div>
      </div>
    </>
  );
}
