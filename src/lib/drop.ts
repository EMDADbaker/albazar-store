import { prisma } from './prisma';

export type ActiveDrop = {
  id: string;
  slug: string;
  nameAr: string;
  nameEn: string;
  status: 'TEASER' | 'LIVE' | 'SOLDOUT' | 'ARCHIVED';
  launchAt: string; // ISO — countdown is server-driven, never trust client clock
  teaserImage: string | null;
  heroImage: string | null;
};

// Demo fallback so the UI renders before Supabase is wired up (Phase 1 dev).
// Once the DB is connected + seeded, the real drop takes over automatically.
const DEMO_DROP: ActiveDrop = {
  id: 'demo',
  slug: 'drop-001',
  nameAr: 'دروب ٠٠١',
  nameEn: 'Drop 001',
  status: 'TEASER',
  launchAt: new Date(
    Date.now() + 2 * 86400000 + 14 * 3600000 + 33 * 60000,
  ).toISOString(),
  teaserImage: '/img/campaign/king-01.jpg',
  heroImage: '/img/campaign/desert-dune.jpg',
};

/**
 * The single active drop that drives the homepage state.
 * Priority: LIVE > TEASER > SOLDOUT. Returns the demo drop if the DB is
 * unreachable so the homepage always renders during early dev.
 */
export async function getActiveDrop(): Promise<ActiveDrop> {
  try {
    const drop = await prisma.drop.findFirst({
      where: { status: { in: ['LIVE', 'TEASER', 'SOLDOUT'] } },
      orderBy: [{ status: 'asc' }, { launchAt: 'asc' }],
    });
    if (!drop) return DEMO_DROP;
    return {
      id: drop.id,
      slug: drop.slug,
      nameAr: drop.nameAr,
      nameEn: drop.nameEn,
      status: drop.status,
      launchAt: drop.launchAt.toISOString(),
      teaserImage: drop.teaserImage,
      heroImage: drop.heroImage,
    };
  } catch {
    return DEMO_DROP;
  }
}
