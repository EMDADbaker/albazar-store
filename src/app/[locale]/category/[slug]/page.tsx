import { setRequestLocale, getTranslations } from 'next-intl/server';
import { getCategoryBySlug } from '@/lib/categories';
import { menuTitleForSlug } from '@/lib/nav-menu';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';
import JsonLd from '@/components/JsonLd';
import { itemListSchema, breadcrumbSchema } from '@/lib/jsonld';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

// On-demand ISR (no generateStaticParams) so the build doesn't query the DB for
// every category — keeps the Netlify build off the connection pool.
export const revalidate = 60;

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const category = await getCategoryBySlug(slug);
  const name = category
    ? locale === 'ar'
      ? category.nameAr
      : category.nameEn
    : menuTitleForSlug(slug, locale);
  const description =
    locale === 'ar'
      ? `${name} من البازار — ستريت وير وبراندات محدودة في السعودية.`
      : `${name} at ALBAZAR — limited streetwear drops and brands in Saudi Arabia.`;
  return pageMeta({
    locale,
    path: `/category/${slug}`,
    title: name,
    description,
    images: category?.products[0]?.images,
  });
}

export default async function CategoryPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const category = await getCategoryBySlug(slug);

  const ts = await getTranslations('Storefront');
  // A menu slug that isn't (yet) a real DB category still renders a clean
  // page with an empty grid — using the menu's own label — instead of a 404.
  const name = category
    ? locale === 'ar'
      ? category.nameAr
      : category.nameEn
    : menuTitleForSlug(slug, locale);
  const products = category?.products ?? [];

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <JsonLd
        data={[
          breadcrumbSchema(locale, [
            { name: 'ALBAZAR', path: '/' },
            { name, path: `/category/${slug}` },
          ]),
          ...(products.length ? [itemListSchema(locale, products)] : []),
        ]}
      />
      <Nav />

      <section className="px-5 sm:px-8 pt-12 pb-6 max-w-6xl mx-auto w-full">
        <div className="font-mono text-[10px] tracking-[0.35em] text-coal/45 uppercase mb-3">
          {ts('browse')}
        </div>
        <h1 className="text-[clamp(32px,6vw,52px)] font-bold tracking-[-0.02em] leading-none mb-3">
          {name}
        </h1>
        <p className="font-mono text-[11px] text-coal/50">
          {ts('pieces', { count: products.length })}
        </p>
        <p className="text-[13px] text-coal/60 max-w-2xl mt-4 leading-relaxed">
          {locale === 'ar'
            ? `تشكيلة ${name} من البازار — ستريت وير وبراندات محدودة، أسعار شاملة الضريبة، وتوصيل لكل مدن السعودية.`
            : `Shop the ${name} edit at ALBAZAR — limited streetwear and brands, VAT-inclusive prices, delivered to every city in Saudi Arabia.`}
        </p>
      </section>

      <section className="flex-1 px-5 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        {products.length === 0 ? (
          <p className="text-[14px] text-coal/50 py-16 text-center">{ts('empty')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
            {products.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
