'use client';

import { useTranslations } from 'next-intl';
import { useCart } from './CartProvider';

// Minimal shopping-bag icon with a live count badge. Opens the slide-out
// mini-cart drawer (instead of navigating) so the cart is one tap away.
export default function CartLink() {
  const t = useTranslations('Nav');
  const { count, openCart } = useCart();

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={t('cart')}
      className="relative p-1.5 text-ink/80 hover:text-accent transition-colors"
    >
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round">
        <path d="M5.5 8h13l-1.1 12h-10.8L5.5 8Z" />
        <path d="M9 8V6.5a3 3 0 0 1 6 0V8" />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-1 min-w-[16px] h-4 px-1 bg-accent text-bg rounded-full font-mono text-[9px] leading-none flex items-center justify-center tabular-nums">
          {count}
        </span>
      )}
    </button>
  );
}
