import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import type { ProductView, Variant } from '@/lib/products';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';

// Query-dependent — never cached.
export const dynamic = 'force-dynamic';

async function search(q: string): Promise<ProductView[]> {
  const term = q.trim();
  if (!term) return [];
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        OR: [
          { nameEn: { contains: term, mode: 'insensitive' } },
          { nameAr: { contains: term } },
          { sku: { contains: term, mode: 'insensitive' } },
          { brand: { nameEn: { contains: term, mode: 'insensitive' } } },
        ],
      },
      include: { variants: { orderBy: { size: 'asc' } }, brand: true },
      orderBy: { createdAt: 'desc' },
      take: 48,
    });
    return products.map((p) => ({
      id: p.id,
      slug: p.sku,
      dropSlug: '',
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      storyAr: p.storyAr,
      storyEn: p.storyEn,
      price: p.price,
      sku: p.sku,
      totalPieces: p.totalPieces,
      images: p.images,
      variants: p.variants.map((v): Variant => ({ id: v.id, size: v.size, stock: v.stock })),
      brandNameEn: p.brand?.nameEn ?? null,
      brandSlug: p.brand?.slug ?? null,
    }));
  } catch {
    return [];
  }
}

export default async function SearchPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { q?: string };
}) {
  setRequestLocale(locale);
  const q = (searchParams.q ?? '').slice(0, 80);
  const t = await getTranslations('Nav');
  const products = await search(q);

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />

      <section className="px-5 sm:px-8 pt-10 pb-6 max-w-6xl mx-auto w-full">
        <div className="font-mono text-[10px] tracking-[0.35em] text-coal/45 uppercase mb-3">
          {t('search')}
        </div>
        <h1 className="text-[clamp(24px,5vw,40px)] font-bold tracking-[-0.02em] leading-none">
          {t('searchResults', { count: products.length, q })}
        </h1>
      </section>

      <section className="flex-1 px-5 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        {products.length === 0 ? (
          <p className="text-[14px] text-coal/55 py-16 text-center">{t('searchEmpty')}</p>
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
