import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getCategoryBySlug } from '@/lib/categories';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';

export const revalidate = 60;

export default async function CategoryPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const ts = await getTranslations('Storefront');
  const name = locale === 'ar' ? category.nameAr : category.nameEn;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />

      <section className="px-5 sm:px-8 pt-12 pb-6 max-w-6xl mx-auto w-full">
        <div className="font-mono text-[10px] tracking-[0.35em] text-coal/45 uppercase mb-3">
          {ts('browse')}
        </div>
        <h1 className="text-[clamp(32px,6vw,52px)] font-bold tracking-[-0.02em] leading-none mb-3">
          {name}
        </h1>
        <p className="font-mono text-[11px] text-coal/50">
          {ts('pieces', { count: category.products.length })}
        </p>
      </section>

      <section className="flex-1 px-5 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        {category.products.length === 0 ? (
          <p className="text-[14px] text-coal/50 py-16 text-center">{ts('empty')}</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
            {category.products.map((p) => (
              <ShopProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
