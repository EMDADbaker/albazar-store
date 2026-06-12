import { prisma } from './prisma';
import type { ProductView, Variant } from './products';

export type StorefrontDrop = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  status: 'TEASER' | 'LIVE' | 'SOLDOUT' | 'ARCHIVED';
  launchAt: string;
  heroImage: string | null;
  products: ProductView[];
};

// Status display order on the homepage: live first, then upcoming, then history.
const STATUS_RANK: Record<string, number> = {
  LIVE: 0,
  TEASER: 1,
  SOLDOUT: 2,
  ARCHIVED: 3,
};

// Demo fallback mirrors the seeded data so the homepage renders even with no DB.
const DEMO: StorefrontDrop[] = [];

/**
 * All PUBLISHED drops with their products, ordered live → upcoming → sold out
 * → archived. Drafts (published=false) never appear. Powers the browsable
 * storefront so every visitor can shop across drops.
 */
export async function getStorefrontDrops(): Promise<StorefrontDrop[]> {
  try {
    const drops = await prisma.drop.findMany({
      // Archived drops live only on /archive, never on the homepage storefront.
      where: { published: true, status: { not: 'ARCHIVED' } },
      include: {
        products: {
          where: { isActive: true },
          include: { variants: { orderBy: { size: 'asc' } } },
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (drops.length === 0) return DEMO;

    const mapped: StorefrontDrop[] = drops.map((d) => ({
      id: d.id,
      slug: d.slug,
      nameAr: d.nameAr,
      nameEn: d.nameEn,
      status: d.status,
      launchAt: d.launchAt.toISOString(),
      heroImage: d.heroImage,
      products: d.products.map((p) => ({
        id: p.id,
        slug: p.sku,
        dropSlug: d.slug,
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        storyAr: p.storyAr,
        storyEn: p.storyEn,
        price: p.price,
        sku: p.sku,
        totalPieces: p.totalPieces,
        images: p.images,
        variants: p.variants.map(
          (v): Variant => ({ id: v.id, size: v.size, stock: v.stock }),
        ),
      })),
    }));

    return mapped
      .filter((d) => d.products.length > 0)
      .sort(
        (a, b) =>
          (STATUS_RANK[a.status] ?? 9) - (STATUS_RANK[b.status] ?? 9) ||
          new Date(b.launchAt).getTime() - new Date(a.launchAt).getTime(),
      );
  } catch {
    return DEMO;
  }
}
