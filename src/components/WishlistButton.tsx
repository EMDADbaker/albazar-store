'use client';

import { useEffect, useState, useTransition } from 'react';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { addToWishlist, removeFromWishlist } from '@/app/account/actions';

// Self-contained: reads login state (useSession) and saved state (GET
// /api/wishlist) on the client, so the product page stays static.
export default function WishlistButton({ productId }: { productId: string }) {
  const t = useTranslations('Product');
  const router = useRouter();
  const { status } = useSession();
  const loggedIn = status === 'authenticated';
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  // Hydrate the heart from the server once we know the user is logged in.
  useEffect(() => {
    if (!loggedIn) return;
    let cancel = false;
    fetch(`/api/wishlist?productId=${encodeURIComponent(productId)}`)
      .then((r) => r.json())
      .then((d) => { if (!cancel) setSaved(!!d.saved); })
      .catch(() => {});
    return () => { cancel = true; };
  }, [loggedIn, productId]);

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
      <span className={saved ? 'text-red-500' : ''}>{saved ? '♥' : '♡'}</span>
      {saved ? t('saved') : t('save')}
    </button>
  );
}
