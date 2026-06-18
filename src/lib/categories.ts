import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import type { ProductView, Variant } from './products';

// Nav data is shown on every page and changes rarely — cache it across requests
// (not just per-request) so page renders don't each pay a Supabase round-trip.
// Admin category/brand mutations call revalidateTag('nav') to refresh instantly.

export type CategoryNavItem = {
  slug: string;
  nameAr: string;
  nameEn: string;
};

// Categories that carry an active product (for the nav).
export const getCategories = unstable_cache(
  async (): Promise<CategoryNavItem[]> => {
    try {
      const cats = await prisma.category.findMany({
        where: { active: true, products: { some: { isActive: true } } },
        orderBy: { sortOrder: 'asc' },
      });
      return cats.map((c) => ({ slug: c.slug, nameAr: c.nameAr, nameEn: c.nameEn }));
    } catch (e) {
      // Re-throw: never let a transient DB error cache an empty nav for 300s.
      throw e;
    }
  },
  ['categories-list'],
  { revalidate: 300, tags: ['nav'] },
);

export type CategoryNavNode = {
  slug: string;
  nameAr: string;
  nameEn: string;
  brands: { slug: string; nameEn: string }[];
};

// Categories + the brands available within each (for the header dropdowns).
export const getCategoryNav = unstable_cache(
  async (): Promise<CategoryNavNode[]> => {
  try {
    const cats = await prisma.category.findMany({
      where: { active: true, products: { some: { isActive: true } } },
      orderBy: { sortOrder: 'asc' },
      include: {
        products: {
          where: { isActive: true, brand: { active: true } },
          select: { brand: { select: { slug: true, nameEn: true } } },
        },
      },
    });
    return cats.map((c) => {
      const seen = new Map<string, string>();
      for (const p of c.products) if (p.brand) seen.set(p.brand.slug, p.brand.nameEn);
      return {
        slug: c.slug,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        brands: [...seen.entries()].slice(0, 8).map(([slug, nameEn]) => ({ slug, nameEn })),
      };
    });
  } catch (e) {
    // Re-throw so a failed query is never cached as an empty nav (which would
    // make categories vanish sitewide for up to 300s). Nav handles the throw.
    throw e;
  }
  },
  ['category-nav'],
  { revalidate: 300, tags: ['nav'] },
);

export type CategoryView = {
  slug: string;
  nameAr: string;
  nameEn: string;
  products: ProductView[];
};

export const getCategoryBySlug = unstable_cache(
  async (slug: string): Promise<CategoryView | null> => {
    // A genuine "no such category" returns null (safe to cache). A thrown DB
    // error must NOT be caught here, or a transient failure caches a false 404.
    const cat = await prisma.category.findUnique({ where: { slug } });
    if (!cat) return null;

    const products = await prisma.product.findMany({
      where: { categoryId: cat.id, isActive: true },
      include: { variants: { orderBy: { size: 'asc' } }, brand: true },
      orderBy: { createdAt: 'desc' },
    });

    return {
      slug: cat.slug,
      nameAr: cat.nameAr,
      nameEn: cat.nameEn,
      products: products.map((p) => ({
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
      })),
    };
  },
  ['category-by-slug'],
  { revalidate: 60, tags: ['nav', 'catalog'] },
);
