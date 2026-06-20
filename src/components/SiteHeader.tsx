'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { MENU } from '@/lib/nav-menu';
import MobileNav from './MobileNav';
import AccountMenu from './AccountMenu';
import CartLink from './CartLink';
import SearchOverlay from './SearchOverlay';

type Brand = { slug: string; nameEn: string };

export type HeaderLabels = {
  menu: string;
  close: string;
  freeShip: string;
  shopAll: string;
  allBrands: string;
  brandsTitle: string;
  lookbook: string;
  about: string;
  account: string;
  signin: string;
  register: string;
  admin: string;
  newDrop: string;
  shop: string;
  collections: string;
  search: string;
  searchPlaceholder: string;
};

const HAMBURGER = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

// Dual-state fixed header. HERO MODE (homepage + /jeddah, hero in view):
// transparent bar with hamburger, centered logo, account/cart — opens the
// slide-in drawer for full nav. SHOPPING MODE (scrolled past the hero, and the
// permanent state on every other page): solid black bar with the logo + full
// inline taxonomy (dropdowns) + search/account/cart. State is driven by an
// IntersectionObserver on #hero-sentinel (only present on the two hero pages).
export default function SiteHeader({
  hero,
  brands,
  locale,
  labels,
  minimal = false,
}: {
  hero: boolean;
  brands: Brand[];
  locale: string;
  labels: HeaderLabels;
  // `minimal`: keep the hamburger + centered-logo header in BOTH states (only
  // the background solidifies on scroll). Used by editorial pages like /jeddah
  // that shouldn't turn into the full taxonomy bar.
  minimal?: boolean;
}) {
  const ar = locale === 'ar';
  const [mode, setMode] = useState<'hero' | 'shopping'>(hero ? 'hero' : 'shopping');
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!hero) {
      setMode('shopping');
      return;
    }
    const sentinel = document.getElementById('hero-sentinel');
    if (!sentinel) {
      setMode('shopping');
      return;
    }
    setMode('hero');
    const obs = new IntersectionObserver(
      ([entry]) => setMode(entry.isIntersecting ? 'hero' : 'shopping'),
      { threshold: 0 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [hero, pathname]);

  const shopping = mode === 'shopping';

  // Close the slide-in drawer once the hero ends and the shopping bar takes over.
  useEffect(() => {
    if (shopping) setDrawerOpen(false);
  }, [shopping]);
  const navLink =
    'font-mono text-[11px] tracking-[0.1em] uppercase text-ink/80 hover:text-accent transition-colors whitespace-nowrap';

  const drawerLabels = {
    shopAll: labels.shopAll,
    allBrands: labels.allBrands,
    lookbook: labels.lookbook,
    about: labels.about,
    account: labels.account,
    signin: labels.signin,
    register: labels.register,
    admin: labels.admin,
    menu: labels.menu,
    close: labels.close,
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-[80] transition-[background-color,border-color] duration-300 ${
          minimal
            ? 'bg-transparent border-b border-transparent'
            : shopping
              ? 'bg-bg border-b border-ink/10'
              : 'bg-transparent border-b border-transparent'
        }`}
      >
        <div
          dir="ltr"
          className="relative transition-[height] duration-300 ease-out"
          style={{ height: minimal ? 72 : shopping ? 56 : 76 }}
        >
          {/* ── HERO layer (hamburger · centered logo · account/cart) ─── */}
          <div
            className={`absolute inset-0 grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 transition-all duration-300 ease-out ${
              !minimal && shopping ? 'opacity-0 pointer-events-none -translate-y-2' : 'opacity-100 translate-y-0'
            }`}
          >
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label={labels.menu}
              className="justify-self-start w-11 h-11 -ms-2 flex items-center justify-center text-ink/90 hover:text-accent transition-colors drop-shadow-[0_1px_4px_rgba(0,0,0,0.5)]"
            >
              {HAMBURGER}
            </button>
            <Link href="/" className="justify-self-center" aria-label="ALBAZAR">
              <Image
                src="/img/albazar-logo-white.png"
                alt="ALBAZAR"
                width={1424}
                height={134}
                priority
                className="h-6 sm:h-8 w-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.6)]"
              />
            </Link>
            <div className="justify-self-end flex items-center gap-1.5 sm:gap-2.5">
              <AccountMenu />
              <CartLink />
            </div>
          </div>

          {/* ── SHOPPING layer (full nav · no logo · pops in after hero).
                 Skipped entirely in `minimal` mode so the header never turns
                 into the taxonomy bar. ─────────────────────────────────────── */}
          {!minimal && (
          <div
            className={`absolute inset-0 grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 transition-all duration-300 ease-out ${
              shopping
                ? 'opacity-100 translate-y-0 pointer-events-auto'
                : 'opacity-0 -translate-y-full pointer-events-none'
            }`}
          >
            {/* Left: hamburger on mobile only — no logo in the taxonomy bar */}
            <div className="justify-self-start">
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label={labels.menu}
                className="lg:hidden w-10 h-10 -ms-2 flex items-center justify-center text-ink/85 hover:text-accent transition-colors"
              >
                {HAMBURGER}
              </button>
            </div>

            {/* Center: full taxonomy with dropdowns (desktop) */}
            <nav className="hidden lg:flex items-center justify-center gap-x-3 xl:gap-x-5 col-start-2">
              <Link href="/shop" className={navLink}>{labels.shopAll}</Link>

              {MENU.map((item) => {
                const label = ar ? item.ar : item.en;

                if (item.brands) {
                  if (brands.length === 0) {
                    return <Link key={item.en} href={item.href} className={navLink}>{label}</Link>;
                  }
                  return (
                    <div key={item.en} className="relative group flex items-center">
                      <Link href={item.href} className={navLink}>
                        {label} <span className="text-[8px]">▾</span>
                      </Link>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block pt-2">
                        <div className="bg-bg border border-ink/15 shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-4 grid grid-cols-2 gap-x-6 gap-y-1.5 w-[320px]">
                          {brands.slice(0, 12).map((b) => (
                            <Link key={b.slug} href={`/brand/${b.slug}`} className="text-[11px] text-ink/70 hover:text-accent transition-colors truncate">
                              {b.nameEn}
                            </Link>
                          ))}
                          <Link href="/brands" className="col-span-2 mt-2 pt-2 border-t border-ink/10 font-mono text-[9px] uppercase tracking-wide text-accent hover:text-accent-bright">
                            {labels.allBrands} ({brands.length}) →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.children && item.children.length > 0) {
                  return (
                    <div key={item.en} className="relative group flex items-center">
                      <Link href={item.href} className={navLink}>
                        {label} <span className="text-[8px] ms-1">▾</span>
                      </Link>
                      <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block pt-2">
                        <div className="bg-bg border border-ink/15 shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-3 w-[210px]">
                          {item.children.map((c) => (
                            <Link key={c.slug} href={`/category/${c.slug}`} className="block text-[11px] text-ink/70 hover:text-accent transition-colors py-1 truncate">
                              {ar ? c.ar : c.en}
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }

                return <Link key={item.en} href={item.href} className={navLink}>{label}</Link>;
              })}

              <Link href="/lookbook" className={navLink}>{labels.lookbook}</Link>
              <Link href="/about" className={navLink}>{labels.about}</Link>
            </nav>

            {/* Right: search + account + cart */}
            <div className="justify-self-end col-start-3 flex items-center gap-1.5 sm:gap-2.5">
              <SearchOverlay label={labels.search} placeholder={labels.searchPlaceholder} />
              <AccountMenu />
              <CartLink />
            </div>
          </div>
          )}
        </div>
      </header>

      {/* Fixed header overlays content — non-hero pages need a spacer. */}
      {!hero && <div aria-hidden style={{ height: 56 }} />}

      <MobileNav
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        brands={brands}
        locale={locale}
        labels={drawerLabels}
      />
    </>
  );
}
