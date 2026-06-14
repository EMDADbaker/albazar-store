import { prisma } from './prisma';
import type { ProductView, Variant } from './products';

export type Recommendation = ProductView & { reasonKey: string; reasonArg?: string };

const PAID = ['PAID', 'PACKED', 'SHIPPED', 'DELIVERED'] as const;

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
    const cart = await prisma.product.findMany({
      where: { sku: { in: cartSkus.length ? cartSkus : ['__none__'] } },
      include: { brand: true, category: true },
    });
    const cartIds = new Set(cart.map((p) => p.id));
    const cartBrandIds = new Set(cart.map((p) => p.brandId).filter(Boolean) as string[]);
    const cartCatIds = new Set(cart.map((p) => p.categoryId).filter(Boolean) as string[]);
    const brandNameById = new Map(cart.map((p) => [p.brandId, p.brand?.nameEn]));
    const catNameById = new Map(cart.map((p) => [p.categoryId, p.category?.nameEn]));

    // --- signals ---
    // Co-purchase: orders containing a cart product → the other products.
    const coOrders = cartIds.size
      ? await prisma.order.findMany({
          where: { status: { in: [...PAID] }, items: { some: { productId: { in: [...cartIds] } } } },
          include: { items: true },
        })
      : [];
    const coBought = new Set<string>();
    for (const o of coOrders) for (const it of o.items) if (!cartIds.has(it.productId)) coBought.add(it.productId);

    // Wishlist + recent views (personal).
    const wished = new Set<string>();
    if (userId) {
      const w = await prisma.wishlistItem.findMany({ where: { userId }, select: { productId: true } });
      w.forEach((x) => wished.add(x.productId));
    }
    const viewedBrand = new Set<string>();
    const viewedCat = new Set<string>();
    const who = userId ? { userId } : anonId ? { anonId } : null;
    if (who) {
      const views = await prisma.event.findMany({
        where: { ...who, type: 'view', productId: { not: null } },
        orderBy: { createdAt: 'desc' },
        take: 30,
      });
      const vids = [...new Set(views.map((v) => v.productId!).filter(Boolean))];
      if (vids.length) {
        const vp = await prisma.product.findMany({ where: { id: { in: vids } }, select: { brandId: true, categoryId: true } });
        vp.forEach((p) => { if (p.brandId) viewedBrand.add(p.brandId); if (p.categoryId) viewedCat.add(p.categoryId); });
      }
    }

    // Popularity (units sold) for tie-breaking.
    const soldRows = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: { order: { status: { in: [...PAID] } } },
      _sum: { quantity: true },
    });
    const sold = new Map(soldRows.map((r) => [r.productId, r._sum.quantity ?? 0]));

    // --- candidates ---
    const candidates = await prisma.product.findMany({
      where: { isActive: true, id: { notIn: [...cartIds] } },
      include: { brand: true, category: true, variants: { orderBy: { size: 'asc' } } },
    });

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
