import Image from 'next/image';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getCategoryNav } from '@/lib/categories';
import { getBrandsWithProducts } from '@/lib/brands';
import { getCurrentUser } from '@/lib/admin-auth';
import LangSwitch from './LangSwitch';
import CartLink from './CartLink';
import AccountMenu from './AccountMenu';
import MobileNav from './MobileNav';

export default async function Nav() {
  const t = await getTranslations('Nav');
  const tb = await getTranslations('Brands');
  const locale = await getLocale();
  const [categories, brands, user] = await Promise.all([
    getCategoryNav(),
    getBrandsWithProducts(),
    getCurrentUser(),
  ]);
  const isStaff = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';
  const featuredBrands = brands.slice(0, 14);

  const navItem =
    'relative font-mono text-[12px] tracking-[0.14em] uppercase text-ink/75 hover:text-accent transition-colors whitespace-nowrap py-3';

  const mobileLabels = {
    shop: t('shop'),
    brands: tb('nav'),
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
      {/* ROW 1 — utility bar */}
      <div dir="ltr" className="hidden sm:flex items-center justify-between px-6 py-1.5 border-b border-ink/[0.06] text-[9px] font-mono tracking-wide uppercase text-ink/45">
        <a href="https://wa.me/966500000000" className="hover:text-accent transition-colors">
          WhatsApp · +966 50 000 0000
        </a>
        <span className="text-accent/70">{t('freeShip')}</span>
        <div className="flex items-center gap-4">
          {user ? (
            <Link href={isStaff ? '/' : '/account'} className="hover:text-accent transition-colors">
              {isStaff ? t('adminLink') : t('account')}
            </Link>
          ) : (
            <>
              <Link href="/login" className="hover:text-accent transition-colors">{t('signin')}</Link>
              <Link href="/register" className="hover:text-accent transition-colors">{t('register') ?? 'Register'}</Link>
            </>
          )}
        </div>
      </div>

      {/* ROW 2 — logo / actions */}
      <nav dir="ltr" className="grid grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-6 py-3.5">
        <div className="justify-self-start">
          <MobileNav
            categories={categories}
            brands={featuredBrands}
            locale={locale}
            labels={mobileLabels}
            loggedIn={!!user}
            isStaff={isStaff}
          />
        </div>
        <Link href="/" className="justify-self-center" aria-label="ALBAZAR">
          {/* trimmed 6.9KB wordmark; invert renders it white on the dark header */}
          <Image
            src="/img/albazar-logo-min.png"
            alt="ALBAZAR"
            width={640}
            height={57}
            priority
            className="h-8 sm:h-10 w-auto invert"
          />
        </Link>
        <div className="justify-self-end flex items-center gap-2.5">
          {isStaff ? (
            <a href="/admin" className="text-[11px] tracking-wide uppercase text-accent hover:text-accent-bright">
              {t('adminLink')}
            </a>
          ) : (
            <AccountMenu loggedIn={!!user} isStaff={isStaff} name={user?.email} />
          )}
          <CartLink />
          <LangSwitch />
        </div>
      </nav>

      {/* ROW 3 — category / brand nav (desktop only; mobile uses the drawer). */}
      <div className="hidden lg:block border-t border-ink/[0.06]">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-1 px-5 mx-auto">
          <Link href="/" className={navItem}>{t('shop')}</Link>

          {/* Brands dropdown (CSS hover) */}
          {featuredBrands.length > 0 && (
            <div className="relative group">
              <Link href="/brands" className={navItem}>
                {tb('nav')} <span className="text-[8px]">▾</span>
              </Link>
              <div className="absolute left-1/2 -translate-x-1/2 top-full pt-1 hidden group-hover:block z-50">
                <div className="bg-bg border border-ink/15 p-4 grid grid-cols-2 gap-x-6 gap-y-1.5 w-[320px] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                  {featuredBrands.map((b) => (
                    <Link
                      key={b.slug}
                      href={`/brand/${b.slug}`}
                      className="text-[11px] text-ink/70 hover:text-accent transition-colors truncate"
                    >
                      {b.nameEn}
                    </Link>
                  ))}
                  <Link href="/brands" className="col-span-2 mt-2 pt-2 border-t border-ink/10 font-mono text-[9px] uppercase tracking-wide text-accent hover:text-accent-bright">
                    {tb('title')} →
                  </Link>
                </div>
              </div>
            </div>
          )}

          {categories.map((c) => (
            <div key={c.slug} className="relative group">
              <Link href={`/category/${c.slug}`} className={navItem}>
                {locale === 'ar' ? c.nameAr : c.nameEn}
                {c.brands.length > 0 && <span className="text-[8px] ms-1">▾</span>}
              </Link>
              {c.brands.length > 0 && (
                <div className="absolute left-1/2 -translate-x-1/2 top-full hidden group-hover:block z-[60]">
                  <div className="bg-bg border border-ink/15 p-3 w-[200px] shadow-[0_12px_40px_rgba(0,0,0,0.5)]">
                    {c.brands.map((b) => (
                      <Link
                        key={b.slug}
                        href={`/brand/${b.slug}`}
                        className="block text-[11px] text-ink/70 hover:text-accent transition-colors py-1 truncate"
                      >
                        {b.nameEn}
                      </Link>
                    ))}
                    <Link
                      href={`/category/${c.slug}`}
                      className="block mt-1.5 pt-1.5 border-t border-ink/10 font-mono text-[9px] uppercase tracking-wide text-accent hover:text-accent-bright"
                    >
                      {locale === 'ar' ? c.nameAr : c.nameEn} →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}

          <Link href="/lookbook" className={navItem}>{t('lookbook')}</Link>
          <Link href="/about" className={navItem}>{t('about')}</Link>
        </div>
      </div>
    </header>
  );
}
