import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getCategories } from '@/lib/categories';
import LangSwitch from './LangSwitch';
import CartLink from './CartLink';

export default async function Nav() {
  const t = await getTranslations('Nav');
  const locale = await getLocale();
  const categories = await getCategories();

  const links = [
    { href: '/', label: t('shop') },
    { href: '/archive', label: t('archive') },
    { href: '/lookbook', label: t('lookbook') },
    { href: '/about', label: t('about') },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg/90 backdrop-blur-md border-b border-ink/10">
      <nav className="flex items-center justify-between px-5 sm:px-6 py-4">
        <Link href="/" className="font-display font-bold text-[17px] tracking-[0.06em] text-ink">
          ALBAZAR<span className="text-accent">.</span>
        </Link>

        <ul className="hidden sm:flex gap-7 list-none">
          {links.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                className="text-[11px] tracking-wide uppercase text-ink/70 transition-colors hover:text-accent"
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-4">
          <CartLink />
          <LangSwitch />
        </div>
      </nav>

      {/* Category bar — Urbn-Lot style */}
      {categories.length > 0 && (
        <div className="border-t border-ink/[0.06] overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-5 px-5 sm:px-6 py-2.5 min-w-max">
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
