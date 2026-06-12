import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/admin-auth';

// Toggle a product in the current user's wishlist. 401 if not logged in.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  const body = await req.json().catch(() => null);
  const productId = body?.productId as string | undefined;
  if (!productId) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: user.id, productId } },
  });
  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  }
  await prisma.wishlistItem.create({ data: { userId: user.id, productId } });
  return NextResponse.json({ saved: true });
}
