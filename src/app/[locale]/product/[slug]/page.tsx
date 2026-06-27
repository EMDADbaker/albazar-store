import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getProductBySlug, getDropProducts, piecesLeft } from '@/lib/products';
import { formatPrice, inclVat } from '@/lib/money';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AddToCart from '@/components/AddToCart';
import ProductGallery from '@/components/ProductGallery';
import Accordion from '@/components/Accordion';
import ShopProductCard from '@/components/ShopProductCard';
import WishlistButton from '@/components/WishlistButton';
import ProductViewTracker from '@/components/ProductViewTracker';
import JsonLd from '@/components/JsonLd';
import { productSchema, breadcrumbSchema } from '@/lib/jsonld';
import { pageMeta, clamp } from '@/lib/seo';
import type { Metadata } from 'next';

// On-demand ISR (no generateStaticParams) — the build must not query the DB for
// every product (677 build-time queries exhaust the pool and fail the deploy).
export const revalidate = 60;

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const name = locale === 'ar' ? product.nameAr : product.nameEn;
  const story = locale === 'ar' ? product.storyAr : product.storyEn;
  const brand = product.brandNameEn ? ` — ${product.brandNameEn}` : '';
  return pageMeta({
    locale,
    path: `/product/${product.slug}`,
    title: `${name}${brand}`,
    description: clamp(story || name),
    // The product photo is the share image — a reliable, real preview. (A
    // generated branded card was tried but @vercel/og can't run on this dev
    // environment to verify it, so we keep the dependable photo.)
    images: product.images,
  });
}

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

  const related = (await getDropProducts(product.dropSlug)).filter(
    (p) => p.slug !== product.slug,
  );

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <JsonLd
        data={[
          productSchema(product, locale),
          breadcrumbSchema(locale, [
            { name: 'ALBAZAR', path: '/' },
            ...(product.brandSlug && product.brandNameEn
              ? [{ name: product.brandNameEn, path: `/brand/${product.brandSlug}` }]
              : []),
            { name, path: `/product/${product.slug}` },
          ]),
        ]}
      />
      <ProductViewTracker productId={product.id} />
      <Nav />

      <section className="flex-1 px-5 sm:px-8 py-10 max-w-6xl mx-auto w-full grid md:grid-cols-2 gap-8 lg:gap-16">
        <ProductGallery
          images={product.images}
          name={name}
          badge={soldOut ? t('soldOut') : undefined}
        />

        <div className="md:py-2">
          {product.brandSlug ? (
            <Link
              href={`/brand/${product.brandSlug}`}
              className="font-mono text-[10px] tracking-label uppercase text-coal/60 hover:text-coal mb-3 inline-block"
            >
              {product.brandNameEn}
            </Link>
          ) : (
            <div className="font-mono text-[10px] tracking-label uppercase text-coal/45 mb-3">
              {product.sku}
            </div>
          )}
          <h1 className="text-[28px] sm:text-[34px] font-bold tracking-[-0.02em] leading-[1.05] mb-3">
            {name}
          </h1>

          <div className="flex items-center gap-2 mb-5">
            <span className={`w-1.5 h-1.5 rounded-full ${soldOut ? 'bg-coal/30' : 'bg-coal'}`} />
            <span className="font-mono text-[10px] tracking-wide uppercase text-coal/55">
              {soldOut ? t('soldOut') : t('inStock')}
            </span>
            <span className="font-mono text-[10px] text-coal/35">
              · {t('remaining', { count: left, total: product.totalPieces })}
            </span>
          </div>

          <div className="font-mono text-[22px] text-coal mb-1">
            {formatPrice(inclVat(product.price), locale)}
          </div>
          <div className="font-mono text-[9px] text-coal/40 mb-8">{t('vatIncluded')}</div>

          <AddToCart product={product} />
          <WishlistButton productId={product.id} />

          <div className="mt-10">
            <Accordion title={t('description')} defaultOpen>
              {story && <p>{story}</p>}
              <p className="text-coal/45">
                <span className="text-coal/65">{t('fitTitle')}: </span>
                {t('fitBody')}
              </p>
            </Accordion>
            <Accordion title={t('shippingReturns')}>
              <p>{t('shippingBody')}</p>
            </Accordion>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-paper-2 text-coal">
          <div className="px-5 sm:px-8 py-14 max-w-6xl mx-auto w-full">
            <div className="font-mono text-[11px] tracking-label uppercase text-coal/50 mb-7 flex items-center gap-2.5 before:content-[''] before:w-[22px] before:h-[0.5px] before:bg-coal/40">
              {t('related')}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
              {related.map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}
