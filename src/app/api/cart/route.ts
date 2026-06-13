import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/admin-auth';

// Sync the client cart for logged-in users so admin can see abandoned carts.
// Guests are silently ignored — their cart stays browser-only.
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user?.id) return NextResponse.json({ synced: false });

  const body = await req.json().catch(() => null);
  const lines = Array.isArray(body?.lines) ? body.lines : null;
  if (!lines) return NextResponse.json({ error: 'invalid' }, { status: 400 });

  try {
    if (lines.length === 0) {
      await prisma.cart.deleteMany({ where: { userId: user.id } });
    } else {
      await prisma.cart.upsert({
        where: { userId: user.id },
        create: { userId: user.id, itemsJson: lines },
        update: { itemsJson: lines },
      });
    }
    return NextResponse.json({ synced: true });
  } catch {
    return NextResponse.json({ synced: false });
  }
}
