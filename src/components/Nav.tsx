import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getCategories } from '@/lib/categories';
import { getCurrentUser } from '@/lib/admin-auth';
import LangSwitch from './LangSwitch';
import CartLink from './CartLink';
import AccountMenu from './AccountMenu';

export default async function Nav() {
  const t = await getTranslations('Nav');
  const tb = await getTranslations('Brands');
  const locale = await getLocale();
  const [categories, user] = await Promise.all([getCategories(), getCurrentUser()]);
  const isStaff = user?.role === 'ADMIN' || user?.role === 'EMPLOYEE';

  const links = [
    { href: '/', label: t('shop') },
    { href: '/brands', label: tb('nav') },
    { href: '/lookbook', label: t('lookbook') },
    { href: '/about', label: t('about') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-ink/10">
      {/* dir=ltr pins logo left / icons right in BOTH languages — no jumping */}
      <nav dir="ltr" className="grid grid-cols-[1fr_auto_1fr] items-center px-5 sm:px-6 py-3.5">
        <Link
          href="/"
          className="justify-self-start font-display font-bold text-[17px] tracking-[0.06em] text-ink"
        >
          ALBAZAR<span className="text-accent">.</span>
        </Link>

        <ul className="hidden md:flex gap-8 list-none">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="relative text-[11px] tracking-wide uppercase text-ink/70 transition-colors hover:text-accent after:absolute after:-bottom-1 after:start-0 after:h-px after:w-0 after:bg-accent after:transition-all hover:after:w-full"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="justify-self-end flex items-center gap-2.5">
          <AccountMenu loggedIn={!!user} isStaff={isStaff} name={user?.email} />
          <CartLink />
          <LangSwitch />
        </div>
      </nav>

      {/* Centered category bar */}
      {categories.length > 0 && (
        <div className="border-t border-ink/[0.06] overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-center gap-6 px-5 py-2.5 min-w-max mx-auto">
            <Link
              href="/"
              className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50 hover:text-accent whitespace-nowrap transition-colors"
            >
              {t('all')}
            </Link>
            {categories.map((c) => (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50 hover:text-accent whitespace-nowrap transition-colors"
              >
                {locale === 'ar' ? c.nameAr : c.nameEn}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
