import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getActiveDrop } from '@/lib/drop';
import { getDropProducts } from '@/lib/products';
import { routing } from '@/i18n/routing';
import { prisma } from '@/lib/prisma';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const drops = await prisma.drop.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return drops.flatMap((d) =>
      routing.locales.map((locale) => ({ locale, slug: d.slug }))
    );
  } catch {
    return [];
  }
}

export default async function DropPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const [drop, products] = await Promise.all([
    getActiveDrop(),
    getDropProducts(slug),
  ]);

  if (products.length === 0) notFound();

  const t = await getTranslations('Storefront');
  const name = locale === 'ar' ? drop.nameAr : drop.nameEn;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />

      <section className="px-5 sm:px-8 pt-12 pb-6 max-w-6xl mx-auto w-full">
        <div className="font-mono text-[10px] tracking-[0.35em] text-coal/50 uppercase mb-3">
          {name}
        </div>
        <h1 className="text-[clamp(32px,6vw,52px)] font-bold tracking-[-0.02em] leading-none mb-3">
          {t('shopTitle')}
        </h1>
        <p className="font-mono text-[11px] text-coal/50">
          {t('pieces', { count: products.length })}
        </p>
      </section>

      <section className="flex-1 px-5 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
          {products.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
