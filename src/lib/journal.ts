import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';
import type { ProductView, Variant } from './products';

export type PostListItem = {
  slug: string;
  titleAr: string;
  titleEn: string;
  excerptAr: string | null;
  excerptEn: string | null;
  coverImage: string | null;
  brandNameEn: string | null;
  publishedAt: Date | null;
};

export type PostDetail = PostListItem & {
  bodyAr: string;
  bodyEn: string;
  brandSlug: string | null;
  products: ProductView[];
  updatedAt: Date;
};

// Reuse the storefront ProductView shape so the "shop the story" strip can use
// the same ShopProductCard as the rest of the site.
function toProductView(p: {
  id: string; sku: string; nameAr: string; nameEn: string; storyAr: string | null;
  storyEn: string | null; price: number; totalPieces: number; images: string[];
  variants: { id: string; size: string; stock: number }[];
  brand: { nameEn: string; slug: string } | null;
}): ProductView {
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
    variants: p.variants.map((v): Variant => ({ id: v.id, size: v.size, stock: v.stock })),
    brandNameEn: p.brand?.nameEn ?? null,
    brandSlug: p.brand?.slug ?? null,
  };
}

export const getPublishedPosts = unstable_cache(
  async (): Promise<PostListItem[]> => {
    const posts = await prisma.post.findMany({
      where: { published: true },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      select: {
        slug: true, titleAr: true, titleEn: true, excerptAr: true, excerptEn: true,
        coverImage: true, publishedAt: true, brand: { select: { nameEn: true } },
      },
    });
    return posts.map((p) => ({
      slug: p.slug, titleAr: p.titleAr, titleEn: p.titleEn,
      excerptAr: p.excerptAr, excerptEn: p.excerptEn, coverImage: p.coverImage,
      publishedAt: p.publishedAt, brandNameEn: p.brand?.nameEn ?? null,
    }));
  },
  ['published-posts'],
  { revalidate: 60, tags: ['journal'] },
);

export const getPostBySlug = unstable_cache(
  async (slug: string): Promise<PostDetail | null> => {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: {
        brand: { select: { nameEn: true, slug: true } },
        products: { include: { variants: { orderBy: { size: 'asc' } }, brand: { select: { nameEn: true, slug: true } } } },
      },
    });
    if (!post || !post.published) return null;
    return {
      slug: post.slug, titleAr: post.titleAr, titleEn: post.titleEn,
      excerptAr: post.excerptAr, excerptEn: post.excerptEn, coverImage: post.coverImage,
      bodyAr: post.bodyAr, bodyEn: post.bodyEn,
      brandNameEn: post.brand?.nameEn ?? null, brandSlug: post.brand?.slug ?? null,
      publishedAt: post.publishedAt, updatedAt: post.updatedAt,
      products: post.products.map(toProductView),
    };
  },
  ['post-by-slug'],
  { revalidate: 60, tags: ['journal'] },
);

// Slugs for the sitemap (published only).
export async function getPublishedPostSlugs(): Promise<string[]> {
  try {
    const rows = await prisma.post.findMany({ where: { published: true }, select: { slug: true } });
    return rows.map((r) => r.slug);
  } catch {
    return [];
  }
}
