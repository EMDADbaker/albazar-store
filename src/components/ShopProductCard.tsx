import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { formatPrice, inclVat } from '@/lib/money';
import { piecesLeft, type ProductView } from '@/lib/products';

// Light-section product card (black on white) for the storefront body.
export default function ShopProductCard({ product }: { product: ProductView }) {
  const t = useTranslations('Live');
  const locale = useLocale();
  const left = piecesLeft(product);
  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const soldOut = left === 0;

  return (
    <Link href={`/product/${product.slug}`} className="group block">
      <div className="relative aspect-[4/5] bg-paper-2 overflow-hidden mb-3">
        {product.images[0] ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0]}
            alt={name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1/2 h-1/2 bg-black/[0.06]" />
          </div>
        )}
        {soldOut && (
          <div className="absolute inset-0 flex items-center justify-center bg-paper/40">
            <span className="font-mono text-[9px] tracking-label uppercase text-coal border border-coal/50 px-3 py-1.5 -rotate-[8deg] bg-paper/80">
              {t('soldOut')}
            </span>
          </div>
        )}
        {/* Live piece counter, top corner */}
        {!soldOut && (
          <div className="absolute top-2.5 ltr:right-2.5 rtl:left-2.5 font-mono text-[9px] text-coal/70 bg-paper/85 px-2 py-1">
            {left} / {product.totalPieces}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <div className="text-[13px] font-medium text-coal leading-tight">{name}</div>
        <div className="font-mono text-[12px] text-coal whitespace-nowrap">
          {formatPrice(inclVat(product.price), locale)}
        </div>
      </div>
      <div className="font-mono text-[9px] text-coal/45 mt-1 tracking-[0.08em] uppercase">
        {product.sku}
      </div>
    </Link>
  );
}
