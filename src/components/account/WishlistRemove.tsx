'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';
import { removeFromWishlist } from '@/app/account/actions';

export default function WishlistRemove({ productId }: { productId: string }) {
  const t = useTranslations('Account');
  const [pending, start] = useTransition();
  return (
    <button
      disabled={pending}
      onClick={() => start(() => removeFromWishlist(productId))}
      className="font-mono text-[9px] uppercase tracking-wide text-coal/40 hover:text-coal disabled:opacity-50 mt-1"
    >
      {pending ? '…' : t('removeWish')}
    </button>
  );
}
