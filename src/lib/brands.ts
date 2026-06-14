import { prisma } from './prisma';
import type { ProductView, Variant } from './products';

export type BrandNav = { slug: string; nameEn: string };

// Every active brand (even with no products yet) — for the /brands A–Z index.
export async function getAllActiveBrands(): Promise<BrandNav[]> {
  try {
    return await prisma.brand.findMany({
      where: { active: true },
      orderBy: { nameEn: 'asc' },
      select: { slug: true, nameEn: true },
    });
  } catch {
    return [];
  }
}

// Brands that actually carry an active product (for the Brands index + nav).
export async function getBrandsWithProducts(): Promise<BrandNav[]> {
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
}

export type BrandView = {
  slug: string;
  nameEn: string;
  nameAr: string | null;
  logo: string | null;
  products: ProductView[];
};

export async function getBrandBySlug(slug: string): Promise<BrandView | null> {
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
}
