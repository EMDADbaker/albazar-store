import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

export type HeroSlideView = {
  id: string;
  image: string;
  titleAr: string;
  titleEn: string;
  subtitleAr: string | null;
  subtitleEn: string | null;
};

export const getHeroSlides = unstable_cache(
  async (): Promise<HeroSlideView[]> => {
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
  },
  ['hero-slides'],
  { revalidate: 300, tags: ['catalog'] },
);
