import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LangSwitch from './LangSwitch';
import CartLink from './CartLink';

export default function Nav() {
  const t = useTranslations('Nav');

  const links = [
    { href: '/drop/drop-001', label: t('drop') },
    { href: '/archive', label: t('archive') },
    { href: '/lookbook', label: t('lookbook') },
    { href: '/about', label: t('about') },
  ];

  return (
    <nav className="sticky top-0 z-50 flex items-center justify-between px-5 sm:px-6 py-4 bg-bg/85 backdrop-blur-md border-b border-ink/10">
      <Link
        href="/"
        className="font-display font-bold text-[17px] tracking-[0.06em] text-ink"
      >
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
  );
}
