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

// Dual-state fixed header. HERO MODE (transparent, hamburger + centered logo +
// account/cart) while the hero is in view; SHOPPING MODE (solid blurred bar,
// links + search) otherwise. State is driven by an IntersectionObserver on a
// #hero-sentinel the hero page renders — no scroll listeners. Pages without a
// hero pass hero={false} and stay in shopping mode.
export default function SiteHeader({
  hero,
  brands,
  locale,
  labels,
  dropHref,
}: {
  hero: boolean;
  brands: Brand[];
  locale: string;
  labels: HeaderLabels;
  dropHref: string;
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
  const navLink =
    'font-mono text-[12px] tracking-[0.14em] uppercase text-ink/80 hover:text-accent transition-colors whitespace-nowrap';
  const categoryItems = MENU.filter((m) => !m.brands);

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
        className={`fixed inset-x-0 top-0 z-[80] transition-colors duration-300 ${
          shopping ? 'bg-bg/95 backdrop-blur-md border-b border-ink/10' : 'bg-transparent'
        }`}
      >
        <div
          dir="ltr"
          className="relative transition-[height] duration-300"
          style={{ height: shopping ? 56 : 76 }}
        >
          {/* ── HERO layer ─────────────────────────────────────────────── */}
          <div
            className={`absolute inset-0 grid grid-cols-[1fr_auto_1fr] items-center px-4 sm:px-6 transition-opacity duration-300 ${
              shopping ? 'opacity-0 pointer-events-none' : 'opacity-100'
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

          {/* ── SHOPPING layer ─────────────────────────────────────────── */}
          <div
            className={`absolute inset-0 flex items-center justify-between gap-4 px-4 sm:px-6 transition-opacity duration-300 ${
              shopping ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            {/* Left: hamburger (mobile) + smaller logo */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDrawerOpen(true)}
                aria-label={labels.menu}
                className="lg:hidden w-10 h-10 -ms-2 flex items-center justify-center text-ink/85 hover:text-accent transition-colors"
              >
                {HAMBURGER}
              </button>
              <Link href="/" aria-label="ALBAZAR">
                <Image
                  src="/img/albazar-logo-white.png"
                  alt="ALBAZAR"
                  width={1424}
                  height={134}
                  className="h-5 sm:h-6 w-auto"
                />
              </Link>
            </div>

            {/* Center: nav links (desktop) */}
            <nav className="hidden lg:flex items-center gap-7">
              <Link href={dropHref} className={navLink}>{labels.newDrop}</Link>

              {/* Shop — mega-menu (CSS hover) */}
              <div className="relative group h-full flex items-center">
                <Link href="/shop" className={navLink}>
                  {labels.shop} <span className="text-[8px]">▾</span>
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block">
                  <div className="mt-2 bg-bg border border-ink/15 shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-6 grid grid-cols-[1fr_1fr] gap-x-10 w-[460px]">
                    <div>
                      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-3">{labels.brandsTitle}</div>
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
                        {brands.slice(0, 12).map((b) => (
                          <Link key={b.slug} href={`/brand/${b.slug}`} className="text-[11px] text-ink/70 hover:text-accent transition-colors truncate">
                            {b.nameEn}
                          </Link>
                        ))}
                      </div>
                      <Link href="/brands" className="block mt-3 font-mono text-[9px] uppercase tracking-wide text-accent hover:text-accent-bright">
                        {labels.allBrands} ({brands.length}) →
                      </Link>
                    </div>
                    <div>
                      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-3">{labels.shopAll}</div>
                      <div className="grid gap-1.5">
                        {categoryItems.map((c) => (
                          <Link key={c.en} href={c.href} className="text-[11px] text-ink/70 hover:text-accent transition-colors truncate">
                            {ar ? c.ar : c.en}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <Link href="/jeddah" className={navLink}>{labels.collections}</Link>
              <Link href="/lookbook" className={navLink}>{labels.lookbook}</Link>
              <Link href="/about" className={navLink}>{labels.about}</Link>
            </nav>

            {/* Right: search + account + cart */}
            <div className="flex items-center gap-1.5 sm:gap-2.5">
              <SearchOverlay label={labels.search} placeholder={labels.searchPlaceholder} />
              <AccountMenu />
              <CartLink />
            </div>
          </div>
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
