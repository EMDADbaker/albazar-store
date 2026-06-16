import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getAllProducts } from '@/lib/catalog';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';
import Breadcrumbs from '@/components/Breadcrumbs';

export const revalidate = 60;

export default async function ShopPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const ts = await getTranslations('Storefront');
  const products = await getAllProducts();

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />

      <section className="px-5 sm:px-8 pt-10 pb-6 max-w-6xl mx-auto w-full">
        <Breadcrumbs items={[{ label: ts('shopTitle') }]} />
        <h1 className="text-[clamp(32px,6vw,52px)] font-bold tracking-[-0.02em] leading-none mb-3 mt-4">
          {ts('shopTitle')}
        </h1>
        <p className="font-mono text-[11px] text-coal/65">
          {ts('pieces', { count: products.length })}
        </p>
      </section>

      <section className="flex-1 px-5 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        {products.length === 0 ? (
          <p className="text-[14px] text-coal/65 py-10">{ts('empty')}</p>
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
