import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllActiveBrands } from '@/lib/brands';
import { MENU } from '@/lib/nav-menu';
import LangSwitch from './LangSwitch';
import CartLink from './CartLink';
import AccountMenu from './AccountMenu';
import MobileNav from './MobileNav';

// No session read here on purpose — account state lives in AccountMenu /
// MobileNav (client, via useSession). That keeps Nav (and every page that
// renders it) free of cookie access, so public pages serve fully static.
export default async function Nav() {
  const t = await getTranslations('Nav');
  const tb = await getTranslations('Brands');
  const locale = await getLocale();
  const ar = locale === 'ar';

  // Only the brand list is dynamic; the category taxonomy comes from MENU.
  // getAllActiveBrands THROWS on a DB error (so a failure isn't cached empty) —
  // catch here so a transient blip just renders the menu without brands.
  let brands: Awaited<ReturnType<typeof getAllActiveBrands>> = [];
  try {
    brands = await getAllActiveBrands();
  } catch {
    /* leave brands empty for this render; not cached, retried next request */
  }

  const navItem =
    'relative font-mono text-[12px] tracking-[0.14em] uppercase text-ink/75 hover:text-accent transition-colors whitespace-nowrap py-3';

  const mobileLabels = {
    shopAll: t('shopAll'),
    allBrands: tb('title'),
    lookbook: t('lookbook'),
    about: t('about'),
    account: t('account'),
    signin: t('signin'),
    register: t('register') ?? 'Register',
    admin: t('adminLink'),
    menu: t('menu'),
    close: t('close'),
  };

  return (
    <header className="relative z-50 bg-bg border-b border-ink/10">
      {/* ROW 1 — utility bar (account/auth all live in the profile menu, row 2) */}
      <div dir="ltr" className="hidden sm:flex items-center justify-center gap-3 px-6 py-1.5 border-b border-ink/[0.06] text-[9px] font-mono tracking-wide uppercase text-ink/45">
        <a href="https://wa.me/966500000000" className="hover:text-accent transition-colors">
          WhatsApp · +966 50 000 0000
        </a>
        <span className="text-ink/20">·</span>
        <span className="text-accent/70">{t('freeShip')}</span>
      </div>

      {/* ROW 2 — logo / actions */}
      <nav dir="ltr" className="grid grid-cols-[1fr_auto_1fr] items-center px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="justify-self-start">
          <MobileNav brands={brands} locale={locale} labels={mobileLabels} />
        </div>
        <Link href="/" className="justify-self-center" aria-label="ALBAZAR">
          {/* trimmed 6.9KB wordmark; invert renders it white on the dark header */}
          <Image
            src="/img/albazar-logo-min.png"
            alt="ALBAZAR"
            width={640}
            height={57}
            priority
            className="h-6 sm:h-10 w-auto invert"
          />
        </Link>
        <div className="justify-self-end flex items-center gap-2 sm:gap-2.5">
          {/* Everything account-related — sign in / register / account / admin /
              sign out — lives in this one profile dropdown. */}
          <AccountMenu />
          <CartLink />
          {/* Language pill is bulky on phones — it lives in the drawer there. */}
          <div className="hidden sm:block">
            <LangSwitch />
          </div>
        </div>
      </nav>

      {/* ROW 3 — category / brand nav (desktop only; mobile uses the drawer). */}
      <div className="hidden lg:block border-t border-ink/[0.06]">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 mx-auto">
          <Link href="/shop" className={navItem}>{t('shopAll')}</Link>

          {MENU.map((item) => {
            const label = ar ? item.ar : item.en;

            // Brands — dropdown filled from the DB.
            if (item.brands) {
              if (brands.length === 0) {
                return <Link key={item.en} href={item.href} className={navItem}>{label}</Link>;
              }
              return (
                <div key={item.en} className="relative group">
                  <Link href={item.href} className={navItem}>
                    {label} <span className="text-[8px]">▾</span>
                  </Link>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 hidden group-hover:block z-50">
                    <div className="bg-bg border border-ink/15 p-4 grid grid-cols-2 gap-x-6 gap-y-1.5 w-[320px] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                      {/* A featured handful only — the full A–Z lives on /brands. */}
                      {brands.slice(0, 12).map((b) => (
                        <Link key={b.slug} href={`/brand/${b.slug}`} className="text-[11px] text-ink/70 hover:text-accent transition-colors truncate">
                          {b.nameEn}
                        </Link>
                      ))}
                      <Link href="/brands" className="col-span-2 mt-2 pt-2 border-t border-ink/10 font-mono text-[9px] uppercase tracking-wide text-accent hover:text-accent-bright">
                        {tb('title')} ({brands.length}) →
                      </Link>
                    </div>
                  </div>
                </div>
              );
            }

            // Category group with sub-items — dropdown.
            if (item.children && item.children.length > 0) {
              return (
                <div key={item.en} className="relative group">
                  <Link href={item.href} className={navItem}>
                    {label} <span className="text-[8px] ms-1">▾</span>
                  </Link>
                  <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block z-[60]">
                    <div className="bg-bg border border-ink/15 p-3 w-[230px] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
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

            // Plain link (Headwear, Footwear, New Arrivals, Sale).
            return (
              <Link key={item.en} href={item.href} className={navItem}>{label}</Link>
            );
          })}

          <Link href="/lookbook" className={navItem}>{t('lookbook')}</Link>
          <Link href="/about" className={navItem}>{t('about')}</Link>
        </div>
      </div>
    </header>
  );
}
