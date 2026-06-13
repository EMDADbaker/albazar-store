import { prisma } from './prisma';
import type { ProductView, Variant } from './products';

export type CategoryNavItem = {
  slug: string;
  nameAr: string;
  nameEn: string;
};

// Categories that carry an active product (for the nav).
export async function getCategories(): Promise<CategoryNavItem[]> {
  try {
    const cats = await prisma.category.findMany({
      where: { products: { some: { isActive: true } } },
      orderBy: { sortOrder: 'asc' },
    });
    return cats.map((c) => ({ slug: c.slug, nameAr: c.nameAr, nameEn: c.nameEn }));
  } catch {
    return [];
  }
}

export type CategoryView = {
  slug: string;
  nameAr: string;
  nameEn: string;
  products: ProductView[];
};

export async function getCategoryBySlug(slug: string): Promise<CategoryView | null> {
  try {
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
  } catch {
    return null;
  }
}
