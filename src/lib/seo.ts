import type { Metadata } from 'next';

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://albazars.com').replace(/\/$/, '');
export const SITE_NAME = 'ALBAZAR';
// Branded fallback share card (1200x630) when a page has no image of its own.
export const DEFAULT_OG = '/og-default.jpg';

// next-intl: ar (default) has no path prefix; en lives under /en.
export function localePath(locale: string, path: string): string {
  const clean = path === '/' ? '' : path;
  return locale === 'en' ? `/en${clean}` : clean || '/';
}

export function absolute(src: string): string {
  if (src.startsWith('http')) return src;
  return `${SITE_URL}${src.startsWith('/') ? '' : '/'}${src}`;
}

// Build canonical + hreflang alternates + Open Graph + Twitter for a page.
// Title is returned bare; the root layout's template appends " | ALBAZAR".
export function pageMeta({
  locale,
  path,
  title,
  description,
  images,
  noIndex,
}: {
  locale: string;
  path: string;
  title: string;
  description: string;
  // string[]: use these images. undefined: fall back to the branded default.
  // null: omit images entirely (e.g. product pages, where a file-based
  // opengraph-image.tsx generates the share card automatically).
  images?: string[] | null;
  noIndex?: boolean;
}): Metadata {
  const canonical = absolute(localePath(locale, path));
  const pics =
    images === null ? undefined : (images && images.length ? images : [DEFAULT_OG]).slice(0, 4).map(absolute);
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: {
        ar: absolute(localePath('ar', path)),
        en: absolute(localePath('en', path)),
        'x-default': absolute(localePath('ar', path)),
      },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: canonical,
      title,
      description,
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      ...(pics ? { images: pics } : {}),
    },
    twitter: { card: 'summary_large_image', title, description, ...(pics ? { images: pics } : {}) },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

// Trim a description to a clean ~160-char snippet for search results.
export function clamp(text: string | null | undefined, max = 160): string {
  if (!text) return '';
  const t = text.replace(/\s+/g, ' ').trim();
  return t.length <= max ? t : t.slice(0, max - 1).trimEnd() + '…';
}
