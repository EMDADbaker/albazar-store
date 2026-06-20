'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Link } from '@/i18n/routing';
import { MENU } from '@/lib/nav-menu';
import MobileNav from './MobileNav';
import AccountMenu from './AccountMenu';
import CartLink from './CartLink';
import LangSwitch from './LangSwitch';
import type { HeaderLabels } from './SiteHeader';

type Brand = { slug: string; nameEn: string };

const HAMBURGER = (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 6h18M3 12h18M3 18h18" />
  </svg>
);

// Classic multi-row header for every page EXCEPT the homepage + /jeddah:
// utility bar + centered logo + account/cart/lang at the top, then a taxonomy
// row that STICKS to the top on scroll (pure CSS sticky — the rows above it
// scroll away). On mobile a single compact bar sticks instead.
export default function ClassicHeader({
  brands,
  locale,
  labels,
}: {
  brands: Brand[];
  locale: string;
  labels: HeaderLabels;
}) {
  const ar = locale === 'ar';
  const [drawerOpen, setDrawerOpen] = useState(false);

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

  const Taxonomy = (
    <nav className="flex items-center justify-center flex-wrap gap-x-4 xl:gap-x-6 px-6 py-2.5">
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
              <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block pt-2 z-50">
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
              <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block pt-2 z-50">
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
  );

  return (
    <header className="relative z-40 bg-bg text-ink">
      {/* ── Desktop: utility + logo scroll away; nav row sticks ──────────── */}
      <div className="hidden lg:block">
        <div dir="ltr" className="flex items-center justify-center gap-3 px-6 py-1.5 border-b border-ink/[0.06] text-[9px] font-mono tracking-wide uppercase text-ink/45">
          <a href="https://wa.me/966500000000" className="hover:text-accent transition-colors">
            WhatsApp · +966 50 000 0000
          </a>
          <span className="text-ink/20">·</span>
          <span className="text-accent/70">{labels.freeShip}</span>
        </div>

        <div dir="ltr" className="grid grid-cols-[1fr_auto_1fr] items-center px-6 py-3.5">
          <div />
          <Link href="/" className="justify-self-center" aria-label="ALBAZAR">
            <Image src="/img/albazar-logo-white.png" alt="ALBAZAR" width={1424} height={134} priority className="h-8 w-auto" />
          </Link>
          <div className="justify-self-end flex items-center gap-2.5">
            <AccountMenu />
            <CartLink />
            <LangSwitch />
          </div>
        </div>

        <div className="sticky top-0 z-50 bg-bg border-y border-ink/10">
          {Taxonomy}
        </div>
      </div>

      {/* ── Mobile: one compact bar that sticks ─────────────────────────── */}
      <div dir="ltr" className="lg:hidden sticky top-0 z-50 bg-bg border-b border-ink/10 grid grid-cols-[1fr_auto_1fr] items-center px-4 py-2.5">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label={labels.menu}
          className="justify-self-start w-10 h-10 -ms-2 flex items-center justify-center text-ink/85 hover:text-accent transition-colors"
        >
          {HAMBURGER}
        </button>
        <Link href="/" className="justify-self-center" aria-label="ALBAZAR">
          <Image src="/img/albazar-logo-white.png" alt="ALBAZAR" width={1424} height={134} className="h-6 w-auto" />
        </Link>
        <div className="justify-self-end flex items-center gap-1.5">
          <AccountMenu />
          <CartLink />
        </div>
      </div>

      <MobileNav
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        brands={brands}
        locale={locale}
        labels={drawerLabels}
      />
    </header>
  );
}
