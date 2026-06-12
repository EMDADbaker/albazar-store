import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatPrice, inclVat } from '@/lib/money';
import { piecesLeft, type ProductView } from '@/lib/products';

export default function ProductCard({ product }: { product: ProductView }) {
  const t = useTranslations('Live');
  const locale = useLocale();
  const left = piecesLeft(product);
  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const soldOut = left === 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="aspect-square bg-ink/[0.035] border border-ink/[0.06] flex items-center justify-center relative mb-2 overflow-hidden">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="w-[58%] h-[62%] bg-ink/[0.05] border border-ink/[0.08] transition-transform duration-500 group-hover:scale-[1.03]" />
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-mono text-[9px] tracking-label uppercase text-ink/65 border border-ink/40 px-3 py-1.5 -rotate-[8deg] bg-bg/55">
              {t('soldOut')}
            </span>
          </div>
        )}
      </div>
      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[12px] font-medium">{name}</div>
        <div className="font-mono text-[11px] text-ink/70 whitespace-nowrap">
          {formatPrice(inclVat(product.price), locale)}
        </div>
      </div>
      <div className="font-mono text-[9px] text-gold/70 mt-0.5 tracking-[0.1em]">
        {soldOut
          ? t('soldOut')
          : t('remaining', { count: left }) + ` / ${product.totalPieces}`}
      </div>
    </Link>
  );
}
