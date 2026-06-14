import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Variants (sizes + stock) for a product, so the cart can offer size changes.
export async function GET(req: Request) {
  const slug = new URL(req.url).searchParams.get('slug');
  if (!slug) return NextResponse.json({ variants: [] });
  try {
    const product = await prisma.product.findFirst({
      where: { sku: slug },
      include: { variants: { orderBy: { size: 'asc' } } },
    });
    return NextResponse.json({
      variants: (product?.variants ?? []).map((v) => ({ id: v.id, size: v.size, stock: v.stock })),
    });
  } catch {
    return NextResponse.json({ variants: [] });
  }
}
