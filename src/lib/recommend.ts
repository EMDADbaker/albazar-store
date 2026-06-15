import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import type { ProductView, Variant } from './products';

export type Recommendation = ProductView & { reasonKey: string; reasonArg?: string };

const PAID = ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED'] as const;

// Global, shopper-independent data — identical for every request, so cache it
// for 60s instead of re-querying Supabase on every cart view.
const getActiveCandidates = unstable_cache(
  () =>
    prisma.product.findMany({
      where: { isActive: true },
      include: { brand: true, category: true, variants: { orderBy: { size: 'asc' } } },
    }),
  ['reco-candidates'],
  { revalidate: 60, tags: ['reco'] },
);

const getPopularity = unstable_cache(
  async () => {
    const rows = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { status: { in: [...PAID] } } },
      _sum: { quantity: true },
    });
    // Map isn't serializable through the cache — store a plain array.
    return rows.map((r) => [r.productId, r._sum.quantity ?? 0] as [string, number]);
  },
  ['reco-popularity'],
  { revalidate: 60, tags: ['reco'] },
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toView(p: any): ProductView {
  return {
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
    variants: p.variants.map((v: Variant) => ({ id: v.id, size: v.size, stock: v.stock })),
    brandNameEn: p.brand?.nameEn ?? null,
    brandSlug: p.brand?.slug ?? null,
  };
}

/**
 * Personalised, reason-tagged recommendations. Every item is justified by a
 * concrete signal — never random. Signals (highest reason wins per product):
 *  - co-purchased with a cart item   → "often bought together"
 *  - same brand as a cart item       → "more from {brand}"
 *  - in the shopper's wishlist        → "from your wishlist"
 *  - brand/category recently viewed   → "based on your browsing"
 *  - same category as a cart item     → "pairs with your {category}"
 * Popularity (units sold) breaks ties.
 */
export async function getCartRecommendations(
  cartSkus: string[],
  userId?: string,
  anonId?: string,
  limit = 6,
): Promise<Recommendation[]> {
  try {
    const who = userId ? { userId } : anonId ? { anonId } : null;

    // The cached candidate set already holds every active product (with brand +
    // category), so resolve the cart from it by SKU — no separate cart query.
    const allCandidates = await getActiveCandidates();
    const bySku = new Map(allCandidates.map((p) => [p.sku, p]));
    const cart = cartSkus.map((s) => bySku.get(s)).filter(Boolean) as typeof allCandidates;
    const cartIds = new Set(cart.map((p) => p.id));
    const cartBrandIds = new Set(cart.map((p) => p.brandId).filter(Boolean) as string[]);
    const cartCatIds = new Set(cart.map((p) => p.categoryId).filter(Boolean) as string[]);

    // --- signals --- run all remaining queries concurrently (single round-trip
    // depth instead of sequential waits to a remote DB).
    const [coOrders, wishRows, viewRows, soldRows] = await Promise.all([
      // Co-purchase: orders containing a cart product → the other products.
      cartIds.size
        ? prisma.order.findMany({
            where: { status: { in: [...PAID] }, items: { some: { productId: { in: [...cartIds] } } } },
            include: { items: true },
          })
        : Promise.resolve([]),
      userId
        ? prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true } })
        : Promise.resolve([]),
      who
        ? prisma.event.findMany({
            where: { ...who, type: 'view', productId: { not: null } },
            orderBy: { createdAt: 'desc' },
            take: 30,
          })
        : Promise.resolve([]),
      getPopularity(),
    ]);

    const coBought = new Set<string>();
    for (const o of coOrders) for (const it of o.items) if (!cartIds.has(it.productId)) coBought.add(it.productId);

    const wished = new Set<string>(wishRows.map((x) => x.productId));

    // Recent views → browsed brands/categories. Resolve product → brand/cat from
    // the already-loaded candidate set instead of an extra DB round-trip.
    const productById = new Map(allCandidates.map((p) => [p.id, p]));
    const viewedBrand = new Set<string>();
    const viewedCat = new Set<string>();
    for (const v of viewRows) {
      const vp = v.productId ? productById.get(v.productId) : null;
      if (vp?.brandId) viewedBrand.add(vp.brandId);
      if (vp?.categoryId) viewedCat.add(vp.categoryId);
    }

    const sold = new Map(soldRows);

    // Drop cart items from the cached candidate set (cache is cart-independent).
    const candidates = allCandidates.filter((p) => !cartIds.has(p.id));

    const scored = candidates.map((p) => {
      let score = 0;
      let reasonKey = 'popular';
      let reasonArg: string | undefined;
      const consider = (cond: boolean, pts: number, key: string, arg?: string) => {
        if (cond && pts > score) { score = pts; reasonKey = key; reasonArg = arg; }
        else if (cond) score += 0; // signal already counted by higher reason
      };
      // Apply in priority order; highest-points reason becomes the label.
      consider(coBought.has(p.id), 6, 'together');
      consider(!!p.brandId && cartBrandIds.has(p.brandId), 5, 'brand', p.brand?.nameEn ?? undefined);
      consider(wished.has(p.id), 4, 'wishlist');
      consider(!!p.categoryId && cartCatIds.has(p.categoryId), 3, 'category', p.category?.nameEn ?? undefined);
      consider(!!p.brandId && viewedBrand.has(p.brandId), 2, 'viewed');
      consider(!!p.categoryId && viewedCat.has(p.categoryId), 2, 'viewed');
      const popularity = sold.get(p.id) ?? 0;
      if (score === 0 && popularity > 0) { score = 1; reasonKey = 'popular'; }
      return { p, score: score + Math.min(popularity, 5) * 0.1, reasonKey, reasonArg };
    });

    return scored
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => ({ ...toView(s.p), reasonKey: s.reasonKey, reasonArg: s.reasonArg }));
  } catch {
    return [];
  }
}
