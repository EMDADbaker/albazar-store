import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getBrandBySlug } from '@/lib/brands';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import { itemListSchema, breadcrumbSchema } from '@/lib/jsonld';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

// Rendered on-demand with ISR (no generateStaticParams) so the build never
// queries the DB for every brand — that exhausts the connection pool and fails
// the Netlify build. First request generates + caches the page for `revalidate`.
export const revalidate = 60;

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const brand = await getBrandBySlug(slug);
  if (!brand) return {};
  const name = locale === 'ar' ? brand.nameAr || brand.nameEn : brand.nameEn;
  const description =
    locale === 'ar'
      ? `تسوّق ${name} في البازار — قطع محدودة من الستريت وير. شحن داخل السعودية.`
      : `Shop ${name} streetwear at ALBAZAR — limited pieces, fast delivery across Saudi Arabia.`;
  return pageMeta({
    locale,
    path: `/brand/${brand.slug}`,
    title: name,
    description,
    images: brand.products[0]?.images,
  });
}

export default async function BrandPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const brand = await getBrandBySlug(slug);
  if (!brand) notFound();

  const ts = await getTranslations('Storefront');
  const tb = await getTranslations('Brands');

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <JsonLd
        data={[
          breadcrumbSchema(locale, [
            { name: 'ALBAZAR', path: '/' },
            { name: tb('title'), path: '/brands' },
            { name: brand.nameEn, path: `/brand/${brand.slug}` },
          ]),
          itemListSchema(locale, brand.products),
        ]}
      />
      <Nav />

      <section className="px-5 sm:px-8 pt-10 pb-6 max-w-6xl mx-auto w-full">
        <Breadcrumbs
          items={[
            { label: tb('title'), href: '/brands' },
            { label: brand.nameEn },
          ]}
        />
        {brand.logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <Image src={brand.logo} alt={brand.nameEn} width={240} height={48} className="h-12 w-auto mb-4 mt-4 object-contain" />
        )}
        <h1 className="text-[clamp(32px,6vw,52px)] font-bold tracking-[-0.02em] leading-none mb-3 mt-4">
          {brand.nameEn}
        </h1>
        <p className="font-mono text-[11px] text-coal/50">
          {ts('pieces', { count: brand.products.length })}
        </p>
        <p className="text-[13px] text-coal/60 max-w-2xl mt-4 leading-relaxed">
          {locale === 'ar'
            ? `تسوّق ${brand.nameAr || brand.nameEn} في البازار — قطع ستريت وير محدودة بأسعار شاملة الضريبة وتوصيل لكل السعودية.`
            : `Shop ${brand.nameEn} at ALBAZAR — limited streetwear pieces, VAT-inclusive prices, delivered across Saudi Arabia.`}
        </p>
      </section>

      <section className="flex-1 px-5 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        {brand.products.length === 0 ? (
          <p className="text-[14px] text-coal/50 py-10">{ts('empty')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
            {brand.products.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
