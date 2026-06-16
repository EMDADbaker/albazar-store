import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import type { ProductView, Variant } from './products';

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

export const getNewArrivals = unstable_cache(
  async (limit = 8): Promise<ProductView[]> => {
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { variants: { orderBy: { size: 'asc' } }, brand: true },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
      return products.map(toView);
    } catch {
      return [];
    }
  },
  ['new-arrivals'],
  { revalidate: 60, tags: ['catalog'] },
);

// Every active product — powers the "/shop" all-items page.
export const getAllProducts = unstable_cache(
  async (): Promise<ProductView[]> => {
    try {
      const products = await prisma.product.findMany({
        where: { isActive: true },
        include: { variants: { orderBy: { size: 'asc' } }, brand: true },
        orderBy: { createdAt: 'desc' },
      });
      return products.map(toView);
    } catch {
      return [];
    }
  },
  ['all-products'],
  { revalidate: 60, tags: ['catalog'] },
);

export type CategoryCard = {
  slug: string;
  nameAr: string;
  nameEn: string;
  image: string | null;
  count: number;
};

// Category tiles for the "Shop by Category" homepage section.
export const getCategoryCards = unstable_cache(
  async (): Promise<CategoryCard[]> => {
    try {
      const cats = await prisma.category.findMany({
        where: { active: true, products: { some: { isActive: true } } },
        orderBy: { sortOrder: 'asc' },
        include: {
          products: {
            where: { isActive: true, images: { isEmpty: false } },
            select: { images: true },
            take: 1,
          },
          _count: { select: { products: true } },
        },
      });
      return cats.map((c) => ({
        slug: c.slug,
        nameAr: c.nameAr,
        nameEn: c.nameEn,
        image: c.products[0]?.images[0] ?? null,
        count: c._count.products,
      }));
    } catch {
      return [];
    }
  },
  ['category-cards'],
  { revalidate: 60, tags: ['catalog'] },
);
