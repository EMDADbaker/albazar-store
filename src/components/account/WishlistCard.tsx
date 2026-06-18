'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatPrice, inclVat } from '@/lib/money';
import { removeFromWishlist } from '@/app/account/actions';

type Props = {
  productId: string;
  sku: string;
  nameAr: string;
  nameEn: string;
  image?: string | null;
  price: number; // excl VAT, halalas
};

// One wishlist tile with an overlay remove button. Removal is optimistic — the
// tile fades out at once and the server delete runs in the background.
export default function WishlistCard({ productId, sku, nameAr, nameEn, image, price }: Props) {
  const t = useTranslations('Account');
  const locale = useLocale();
  const name = locale === 'ar' ? nameAr : nameEn;
  const [gone, setGone] = useState(false);
  const [, start] = useTransition();

  function remove() {
    setGone(true); // optimistic — disappear immediately
    start(() => removeFromWishlist(productId));
  }

  if (gone) return null;

  return (
    <div className="group/card">
      <div className="relative aspect-[4/5] bg-paper-2 overflow-hidden mb-2">
        <Link href={`/product/${sku}`} className="block w-full h-full group">
          {image && (
            <Image
              src={image}
              alt={name}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          )}
        </Link>
        {/* Overlay remove — always visible on touch, hover-reveal on desktop */}
        <button
          onClick={remove}
          aria-label={t('removeWish')}
          className="absolute top-2 ltr:right-2 rtl:left-2 w-8 h-8 flex items-center justify-center rounded-full bg-paper/85 text-coal/70 hover:text-red-600 hover:bg-paper shadow-sm opacity-100 lg:opacity-0 lg:group-hover/card:opacity-100 transition-all"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <Link href={`/product/${sku}`} className="block">
        <div className="text-[12px] font-medium">{name}</div>
        <div className="font-mono text-[11px] text-coal/60">
          {formatPrice(inclVat(price), locale)}
        </div>
      </Link>
    </div>
  );
}
