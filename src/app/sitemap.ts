import type { MetadataRoute } from 'next';
import { getAllProducts } from '@/lib/catalog';
import { getAllActiveBrands } from '@/lib/brands';
import { getCategoryNav } from '@/lib/categories';
import { getPublishedPostSlugs } from '@/lib/journal';

// Public site URL. Override with NEXT_PUBLIC_SITE_URL in the environment.
const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://albazars.com').replace(/\/$/, '');

// next-intl: Arabic is the default locale (no path prefix); English lives under
// /en. Each entry lists the ar URL as canonical with an en alternate so Google
// indexes both languages and understands they're the same page.
function entry(path: string, lastModified?: Date): MetadataRoute.Sitemap[number] {
  const p = path === '/' ? '' : path;
  return {
    url: `${BASE}${p || '/'}`,
    lastModified: lastModified ?? new Date(),
    changeFrequency: 'daily',
    alternates: {
      languages: {
        ar: `${BASE}${p || '/'}`,
        en: `${BASE}/en${p}`,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Indexable, non-transactional pages only (cart/checkout/account are in robots).
  const staticPaths = ['/', '/shop', '/brands', '/archive', '/lookbook', '/lookbook/denim', '/lookbook/street', '/about', '/jeddah', '/journal'];

  // Never let one failing query blank the whole sitemap.
  const [products, brands, categories, postSlugs] = await Promise.all([
    getAllProducts().catch(() => []),
    getAllActiveBrands().catch(() => []),
    getCategoryNav().catch(() => []),
    getPublishedPostSlugs().catch(() => []),
  ]);

  return [
    ...staticPaths.map((p) => entry(p)),
    ...products.map((p) => entry(`/product/${p.slug}`)),
    ...brands.map((b) => entry(`/brand/${b.slug}`)),
    ...categories.map((c) => entry(`/category/${c.slug}`)),
    ...postSlugs.map((s) => entry(`/journal/${s}`)),
  ];
}
