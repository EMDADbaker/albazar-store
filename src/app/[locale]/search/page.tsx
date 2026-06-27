import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import type { ProductView, Variant } from '@/lib/products';
import { getAllActiveBrands } from '@/lib/brands';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';

// Query-dependent — never cached.
export const dynamic = 'force-dynamic';

type Filters = { q: string; brand: string; stock: string; sort: string; max: string };

async function runSearch(f: Filters): Promise<ProductView[]> {
  const term = f.q.trim();
  const maxSar = Number(f.max);
  const hasAny = term || f.brand || f.stock === '1' || maxSar > 0;
  if (!hasAny) return [];

  const where: Prisma.ProductWhereInput = { isActive: true };
  if (term) {
    where.OR = [
      { nameEn: { contains: term, mode: 'insensitive' } },
      { nameAr: { contains: term } },
      { sku: { contains: term, mode: 'insensitive' } },
      { brand: { nameEn: { contains: term, mode: 'insensitive' } } },
    ];
  }
  if (f.brand) where.brand = { slug: f.brand };
  if (f.stock === '1') where.variants = { some: { stock: { gt: 0 } } };
  if (maxSar > 0) where.price = { lte: Math.round(maxSar * 100) };

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    f.sort === 'price_asc'
      ? { price: 'asc' }
      : f.sort === 'price_desc'
        ? { price: 'desc' }
        : { createdAt: 'desc' };

  try {
    const products = await prisma.product.findMany({
      where,
      include: { variants: { orderBy: { size: 'asc' } }, brand: true },
      orderBy,
      take: 60,
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
  searchParams: { q?: string; brand?: string; stock?: string; sort?: string; max?: string };
}) {
  setRequestLocale(locale);
  const ar = locale === 'ar';
  const f: Filters = {
    q: (searchParams.q ?? '').slice(0, 80),
    brand: searchParams.brand ?? '',
    stock: searchParams.stock ?? '',
    sort: searchParams.sort ?? '',
    max: searchParams.max ?? '',
  };
  const t = await getTranslations('Nav');
  const [products, brands] = await Promise.all([runSearch(f), getAllActiveBrands()]);

  // next-intl: the form posts back to the locale-correct path (ar = no prefix).
  const action = locale === 'en' ? '/en/search' : '/search';
  const L = {
    search: ar ? 'بحث' : 'Search',
    allBrands: ar ? 'كل البراندات' : 'All brands',
    newest: ar ? 'الأحدث' : 'Newest',
    priceAsc: ar ? 'السعر: من الأقل' : 'Price: low to high',
    priceDesc: ar ? 'السعر: من الأعلى' : 'Price: high to low',
    inStock: ar ? 'المتوفر فقط' : 'In stock only',
    maxPrice: ar ? 'أعلى سعر (ر.س)' : 'Max price (SAR)',
    apply: ar ? 'تطبيق' : 'Apply filters',
  };

  const field =
    'bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] px-3 py-2.5 outline-none transition-colors';

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />

      <section className="px-5 sm:px-8 pt-10 pb-6 max-w-6xl mx-auto w-full">
        <div className="font-mono text-[10px] tracking-[0.35em] text-coal/45 uppercase mb-4">
          {t('search')}
        </div>

        {/* Search box + filters — a single GET form so any control re-runs it. */}
        <form action={action} method="get" className="space-y-3">
          <div className="flex gap-2">
            <input
              type="search"
              name="q"
              defaultValue={f.q}
              placeholder={t('searchPlaceholder')}
              className={`${field} flex-1`}
              autoFocus
            />
            <button
              type="submit"
              className="bg-coal text-paper font-bold text-[12px] tracking-[0.15em] uppercase px-6 hover:opacity-90 transition-opacity"
            >
              {L.search}
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select name="brand" defaultValue={f.brand} className={field}>
              <option value="">{L.allBrands}</option>
              {brands.map((b) => (
                <option key={b.slug} value={b.slug}>
                  {b.nameEn}
                </option>
              ))}
            </select>
            <select name="sort" defaultValue={f.sort} className={field}>
              <option value="">{L.newest}</option>
              <option value="price_asc">{L.priceAsc}</option>
              <option value="price_desc">{L.priceDesc}</option>
            </select>
            <input
              type="number"
              name="max"
              min="0"
              defaultValue={f.max}
              placeholder={L.maxPrice}
              className={`${field} w-[150px]`}
            />
            <label className="flex items-center gap-2 text-[12px] text-coal/70 px-1 cursor-pointer">
              <input type="checkbox" name="stock" value="1" defaultChecked={f.stock === '1'} className="accent-coal" />
              {L.inStock}
            </label>
            <button
              type="submit"
              className="border border-coal/30 text-coal font-mono text-[11px] uppercase tracking-wide px-4 py-2.5 hover:bg-coal hover:text-paper transition-colors"
            >
              {L.apply}
            </button>
          </div>
        </form>
      </section>

      <section className="px-5 sm:px-8 pb-4 max-w-6xl mx-auto w-full">
        <h1 className="text-[clamp(20px,4vw,32px)] font-bold tracking-[-0.02em] leading-none">
          {f.q
            ? t('searchResults', { count: products.length, q: f.q })
            : t('searchResults', { count: products.length, q: '' })}
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
