import { setRequestLocale, getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { getProductBySlug, piecesLeft } from '@/lib/products';
import { formatPrice, inclVat } from '@/lib/money';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AddToCart from '@/components/AddToCart';

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

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <section className="flex-1 px-6 py-10 max-w-5xl mx-auto w-full grid md:grid-cols-2 gap-10">
        {/* Gallery */}
        <div className="aspect-square bg-ink/[0.035] border border-ink/[0.06] flex items-center justify-center relative overflow-hidden">
          {product.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={product.images[0]} alt={name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-[55%] h-[60%] bg-ink/[0.05] border border-ink/[0.08]" />
          )}
          <div className="absolute top-3 ltr:right-3 rtl:left-3 font-mono text-[10px] text-gold/80 tracking-[0.1em]">
            {left} / {product.totalPieces}
          </div>
        </div>

        {/* Details */}
        <div>
          <div className="font-mono text-[10px] tracking-label uppercase text-gold/80 mb-3">
            {product.sku}
          </div>
          <h1 className="text-[30px] font-bold tracking-[-0.02em] leading-tight mb-3">
            {name}
          </h1>
          <div className="font-mono text-[18px] text-ink mb-1">
            {formatPrice(inclVat(product.price), locale)}
          </div>
          <div className="font-mono text-[9px] text-ink/35 mb-6">
            {t('remaining', { count: left, total: product.totalPieces })}
          </div>

          {story && (
            <p className="text-[13px] text-ink/50 leading-relaxed mb-8 max-w-prose">
              {story}
            </p>
          )}

          <AddToCart product={product} />
        </div>
      </section>
      <Footer />
    </div>
  );
}
