import { prisma } from './prisma';

export type ArchivedPiece = {
  nameAr: string;
  nameEn: string;
  image: string;
  total: number;
};

export type ArchivedDrop = {
  slug: string;
  nameAr: string;
  nameEn: string;
  droppedAt: string; // ISO
  soldOutDays: number;
  pieces: ArchivedPiece[];
};

const DEMO_ARCHIVE: ArchivedDrop[] = [
  {
    slug: 'drop-000',
    nameAr: 'دروب ٠٠٠',
    nameEn: 'Drop 000',
    droppedAt: '2025-11-20T18:00:00.000Z',
    soldOutDays: 3,
    pieces: [
      { nameAr: 'هودي البازار — أسود', nameEn: 'Bazar Hoodie — Black', image: '/img/archive/bw-supreme.jpg', total: 150 },
      { nameAr: 'تيشيرت السوق — عظمي', nameEn: 'Souq Tee — Bone', image: '/img/archive/city-cap.jpg', total: 200 },
      { nameAr: 'كارقو الليل — رمادي', nameEn: 'Night Cargo — Ash', image: '/img/archive/brick-duo.jpg', total: 120 },
      { nameAr: 'جاكيت السوق', nameEn: 'Souq Jacket', image: '/img/archive/warehouse-tee.jpg', total: 80 },
      { nameAr: 'كاب البازار', nameEn: 'Bazar Cap', image: '/img/archive/stussy-af1.jpg', total: 100 },
    ],
  },
];

export async function getArchivedDrops(): Promise<ArchivedDrop[]> {
  try {
    const drops = await prisma.drop.findMany({
      where: { status: 'ARCHIVED' },
      include: { products: true },
      orderBy: { launchAt: 'desc' },
    });
    if (drops.length === 0) return DEMO_ARCHIVE;
    return drops.map((d) => ({
      slug: d.slug,
      nameAr: d.nameAr,
      nameEn: d.nameEn,
      droppedAt: d.launchAt.toISOString(),
      soldOutDays: 3,
      pieces: d.products.map((p) => ({
        nameAr: p.nameAr,
        nameEn: p.nameEn,
        image: p.images[0] ?? '/img/archive/bw-supreme.jpg',
        total: p.totalPieces,
      })),
    }));
  } catch {
    return DEMO_ARCHIVE;
  }
}
