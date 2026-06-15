import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import type { ProductView, Variant } from './products';

export type BrandNav = { slug: string; nameEn: string };

// Brand/nav lists appear on every page and change rarely — cache across requests
// (admin mutations call revalidateTag('nav') to refresh instantly).

// Every active brand (even with no products yet) — for the /brands A–Z index.
export const getAllActiveBrands = unstable_cache(
  async (): Promise<BrandNav[]> => {
    try {
      return await prisma.brand.findMany({
        where: { active: true },
        orderBy: { nameEn: 'asc' },
        select: { slug: true, nameEn: true },
      });
    } catch {
      return [];
    }
  },
  ['all-active-brands'],
  { revalidate: 300, tags: ['nav'] },
);

// Brands that actually carry an active product (for the Brands index + nav).
export const getBrandsWithProducts = unstable_cache(
  async (): Promise<BrandNav[]> => {
    try {
      const brands = await prisma.brand.findMany({
        where: { active: true, products: { some: { isActive: true } } },
        orderBy: { nameEn: 'asc' },
        select: { slug: true, nameEn: true },
      });
      return brands;
    } catch {
      return [];
    }
  },
  ['brands-with-products'],
  { revalidate: 300, tags: ['nav'] },
);

export type BrandView = {
  slug: string;
  nameEn: string;
  nameAr: string | null;
  logo: string | null;
  products: ProductView[];
};

export const getBrandBySlug = unstable_cache(
  async (slug: string): Promise<BrandView | null> => {
    try {
      const brand = await prisma.brand.findUnique({ where: { slug } });
      if (!brand) return null;
      const products = await prisma.product.findMany({
        where: { brandId: brand.id, isActive: true },
        include: { variants: { orderBy: { size: 'asc' } } },
        orderBy: { createdAt: 'desc' },
      });
      return {
        slug: brand.slug,
        nameEn: brand.nameEn,
        nameAr: brand.nameAr,
        logo: brand.logo,
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
          brandNameEn: brand.nameEn,
          brandSlug: brand.slug,
        })),
      };
    } catch {
      return null;
    }
  },
  ['brand-by-slug'],
  { revalidate: 60, tags: ['nav', 'catalog'] },
);
