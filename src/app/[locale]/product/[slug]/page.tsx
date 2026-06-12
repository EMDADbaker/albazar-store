import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getProductBySlug, getDropProducts, piecesLeft } from '@/lib/products';
import { formatPrice, inclVat } from '@/lib/money';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AddToCart from '@/components/AddToCart';
import ProductGallery from '@/components/ProductGallery';
import Accordion from '@/components/Accordion';
import ProductCard from '@/components/ProductCard';

export default async function ProductPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const t = await getTranslations('Product');
  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const story = locale === 'ar' ? product.storyAr : product.storyEn;
  const left = piecesLeft(product);
  const soldOut = left === 0;

  // "More from the drop" — sibling pieces, current one excluded.
  const related = (await getDropProducts(product.dropSlug)).filter(
    (p) => p.slug !== product.slug,
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <section className="flex-1 px-5 sm:px-6 py-8 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-8 lg:gap-14">
        <ProductGallery
          images={product.images}
          name={name}
          badge={soldOut ? t('soldOut') : undefined}
        />

        {/* Info column */}
        <div className="md:py-2">
          <div className="font-mono text-[10px] tracking-label uppercase text-ink/40 mb-3">
            {product.sku}
          </div>
          <h1 className="text-[26px] sm:text-[30px] font-bold tracking-[-0.02em] leading-tight mb-3">
            {name}
          </h1>

          {/* Stock badge */}
          <div className="flex items-center gap-2 mb-4">
            <span
              className={`w-1.5 h-1.5 rounded-full ${soldOut ? 'bg-ink/30' : 'bg-accent'}`}
            />
            <span className="font-mono text-[10px] tracking-wide uppercase text-ink/50">
              {soldOut ? t('soldOut') : t('inStock')}
            </span>
            <span className="font-mono text-[10px] text-ink/30">
              · {t('remaining', { count: left, total: product.totalPieces })}
            </span>
          </div>

          <div className="font-mono text-[20px] text-ink mb-1">
            {formatPrice(inclVat(product.price), locale)}
          </div>
          <div className="font-mono text-[9px] text-ink/35 mb-7">{t('vatIncluded')}</div>

          <AddToCart product={product} />

          {/* Accordions */}
          <div className="mt-9">
            <Accordion title={t('description')} defaultOpen>
              {story && <p>{story}</p>}
              <p className="text-ink/40">
                <span className="text-ink/60">{t('fitTitle')}: </span>
                {t('fitBody')}
              </p>
            </Accordion>
            <Accordion title={t('shippingReturns')}>
              <p>{t('shippingBody')}</p>
            </Accordion>
          </div>
        </div>
      </section>

      {/* Related */}
      {related.length > 0 && (
        <section className="px-5 sm:px-6 pb-16 max-w-6xl mx-auto w-full">
          <div className="font-mono text-[11px] tracking-label uppercase text-ink/40 mb-6 flex items-center gap-2.5 before:content-[''] before:w-[22px] before:h-[0.5px] before:bg-accent/50">
            {t('related')}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
