import { prisma } from './prisma';

export type HeroSlideView = {
  id: string;
  image: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string | null;
  subtitleEn: string | null;
};

export async function getHeroSlides(): Promise<HeroSlideView[]> {
  try {
    return await prisma.heroSlide.findMany({
      where: { active: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        image: true,
        titleAr: true,
        titleEn: true,
        subtitleAr: true,
        subtitleEn: true,
      },
    });
  } catch {
    return [];
  }
}
