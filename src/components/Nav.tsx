import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import LangSwitch from './LangSwitch';

export default function Nav() {
  const t = useTranslations('Nav');

  const links = [
    { href: '/drop/drop-001', label: t('drop') },
    { href: '/archive', label: t('archive') },
    { href: '/lookbook', label: t('lookbook') },
    { href: '/about', label: t('about') },
  ];

  return (
    <nav className="flex items-center justify-between px-6 py-[18px] border-b border-ink/[0.08]">
      <Link href="/" className="font-display font-bold text-[17px] tracking-[0.06em]">
        ALBAZAR<span className="text-gold">.</span>
      </Link>

      <ul className="hidden sm:flex gap-[22px] list-none">
        {links.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="text-[11px] tracking-wide uppercase text-ink/50 transition-colors hover:text-ink"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>

      <LangSwitch />
    </nav>
  );
}
