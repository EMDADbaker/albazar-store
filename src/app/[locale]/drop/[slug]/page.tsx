import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getActiveDrop } from '@/lib/drop';
import { getDropProducts } from '@/lib/products';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default async function DropPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const drop = await getActiveDrop();
  const products = await getDropProducts(slug);

  if (products.length === 0) notFound();

  const name = locale === 'ar' ? drop.nameAr : drop.nameEn;

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <DropHeader name={name} count={products.length} />
      <section className="px-6 pb-14 flex-1">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>
      <Ticker />
      <Footer />
    </div>
  );
}

function DropHeader({ name, count }: { name: string; count: number }) {
  const t = useTranslations('Live');
  return (
    <section className="px-6 pt-12 pb-8 text-center">
      <div className="font-mono text-[10px] tracking-[0.4em] text-accent/90 uppercase mb-3">
        {name}
      </div>
      <h1 className="text-[34px] font-bold tracking-[-0.02em] leading-[1.05] mb-2">
        {t('title')}
      </h1>
      <p className="text-[12px] text-ink/40 font-mono">{count} pieces</p>
    </section>
  );
}
