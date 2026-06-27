import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PostEditor from '@/components/admin/PostEditor';

export const dynamic = 'force-dynamic';

export default async function EditPostPage({ params: { id } }: { params: { id: string } }) {
  const isNew = id === 'new';
  const [post, brands, products] = await Promise.all([
    isNew
      ? null
      : prisma.post.findUnique({ where: { id }, include: { products: { select: { id: true } } } }),
    prisma.brand.findMany({ where: { active: true }, orderBy: { nameEn: 'asc' }, select: { id: true, nameEn: true } }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { nameEn: 'asc' },
      select: { id: true, nameEn: true, brand: { select: { nameEn: true } } },
    }),
  ]);
  if (!isNew && !post) notFound();

  return (
    <PostEditor
      post={
        post
          ? {
              id: post.id,
              slug: post.slug,
              titleEn: post.titleEn,
              titleAr: post.titleAr,
              excerptEn: post.excerptEn,
              excerptAr: post.excerptAr,
              bodyEn: post.bodyEn,
              bodyAr: post.bodyAr,
              coverImage: post.coverImage,
              brandId: post.brandId,
              published: post.published,
              productIds: post.products.map((p) => p.id),
            }
          : null
      }
      brands={brands}
      products={products.map((p) => ({ id: p.id, label: `${p.nameEn}${p.brand?.nameEn ? ` — ${p.brand.nameEn}` : ''}` }))}
    />
  );
}
