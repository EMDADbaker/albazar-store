'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { useCart } from './CartProvider';

export default function CartLink() {
  const t = useTranslations('Nav');
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="text-[11px] tracking-wide uppercase text-ink/50 transition-colors hover:text-ink flex items-center gap-1.5"
    >
      {t('cart')}
      <span className="font-mono text-accent tabular-nums">[{count}]</span>
    </Link>
  );
}
