import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getCartRecommendations } from '@/lib/recommend';
import { getCurrentUser } from '@/lib/admin-auth';

// Reason-tagged recommendations for the cart page.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const slugs = Array.isArray(body?.slugs) ? (body.slugs as string[]) : [];

  const user = await getCurrentUser();
  const anonId = cookies().get('albazar_anon')?.value;

  const items = await getCartRecommendations(slugs, user?.id, anonId);
  return NextResponse.json({ items });
}
