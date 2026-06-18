import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getBrandBySlug, getAllActiveBrands } from '@/lib/brands';
import { routing } from '@/i18n/routing';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const brands = await getAllActiveBrands();
  return brands.flatMap((b) =>
    routing.locales.map((locale) => ({ locale, slug: b.slug }))
  );
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
