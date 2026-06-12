'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { addToWishlist, removeFromWishlist } from '@/app/account/actions';

export default function WishlistButton({
  productId,
  initialSaved,
  loggedIn,
}: {
  productId: string;
  initialSaved: boolean;
  loggedIn: boolean;
}) {
  const t = useTranslations('Product');
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [pending, start] = useTransition();

  function toggle() {
    if (!loggedIn) {
      router.push('/login?next=/account');
      return;
    }
    const next = !saved;
    setSaved(next);
    start(() => (next ? addToWishlist(productId) : removeFromWishlist(productId)));
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="mt-3 w-full border border-coal/25 text-coal font-mono text-[11px] tracking-[0.15em] uppercase py-3 hover:bg-coal hover:text-paper transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
    >
      <span>{saved ? '♥' : '♡'}</span>
      {saved ? t('saved') : t('save')}
    </button>
  );
}
