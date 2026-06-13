import { setRequestLocale } from 'next-intl/server';
import { getCurrentUser } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import type { ProductView } from '@/lib/products';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CartView from '@/components/CartView';
import WishlistRail from '@/components/WishlistRail';

export const dynamic = 'force-dynamic';

async function getWishlistProducts(): Promise<ProductView[]> {
  const user = await getCurrentUser();
  if (!user?.id) return [];
  try {
    const items = await prisma.wishlistItem.findMany({
      where: {
        userId: user.id,
        product: { isActive: true, drop: { published: true } },
      },
      include: {
        product: { include: { variants: { orderBy: { size: 'asc' } }, drop: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 12,
    });
    return items.map(({ product: p }) => ({
      id: p.id,
      slug: p.sku,
      dropSlug: p.drop.slug,
      nameAr: p.nameAr,
      nameEn: p.nameEn,
      storyAr: p.storyAr,
      storyEn: p.storyEn,
      price: p.price,
      sku: p.sku,
      totalPieces: p.totalPieces,
      images: p.images,
      variants: p.variants.map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
    }));
  } catch {
    return [];
  }
}

export default async function CartPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const wishlist = await getWishlistProducts();

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />
      <CartView />
      <WishlistRail products={wishlist} />
      <Footer />
    </div>
  );
}
