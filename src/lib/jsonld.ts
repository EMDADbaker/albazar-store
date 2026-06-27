// Structured-data (schema.org) builders. Keep output minimal and accurate —
// Google penalises markup that doesn't match visible content.
import { SITE_URL, SITE_NAME, absolute, localePath } from './seo';
import { inclVat } from './money';
import type { ProductView } from './products';

// Organisation identity — emit once (homepage).
export function organizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    alternateName: 'البازار',
    url: SITE_URL,
    logo: absolute('/img/albazar-logo.png'),
    sameAs: ['https://www.instagram.com/albazarst'],
  };
}

// WebSite + Sitelinks SearchBox (lets Google show a search box for the brand).
export function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

// Product offer — incl-VAT price, currency, live availability.
export function productSchema(p: ProductView, locale: string) {
  const name = locale === 'ar' ? p.nameAr : p.nameEn;
  const description = (locale === 'ar' ? p.storyAr : p.storyEn) ?? name;
  const inStock = p.variants.some((v) => v.stock > 0);
  const priceSar = (inclVat(p.price) / 100).toFixed(2);
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name,
    description,
    sku: p.sku,
    image: p.images.map(absolute),
    ...(p.brandNameEn ? { brand: { '@type': 'Brand', name: p.brandNameEn } } : {}),
    offers: {
      '@type': 'Offer',
      url: absolute(localePath(locale, `/product/${p.slug}`)),
      priceCurrency: 'SAR',
      price: priceSar,
      availability: inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/SoldOut',
      itemCondition: 'https://schema.org/NewCondition',
    },
  };
}

// Breadcrumb trail. Pass [{name, path}] from home down to the current page.
export function breadcrumbSchema(locale: string, trail: { name: string; path: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.name,
      item: absolute(localePath(locale, t.path)),
    })),
  };
}

// Journal article — feeds rich results (headline, image, dates).
export function articleSchema(opts: {
  locale: string;
  slug: string;
  headline: string;
  description: string;
  image: string | null;
  published: Date | null;
  modified: Date;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: opts.headline,
    description: opts.description,
    ...(opts.image ? { image: [absolute(opts.image)] } : {}),
    datePublished: (opts.published ?? opts.modified).toISOString(),
    dateModified: opts.modified.toISOString(),
    author: { '@type': 'Organization', name: SITE_NAME },
    publisher: { '@type': 'Organization', name: SITE_NAME, logo: { '@type': 'ImageObject', url: absolute('/img/albazar-logo.png') } },
    mainEntityOfPage: absolute(localePath(opts.locale, `/journal/${opts.slug}`)),
  };
}

// A listing page's products (category / brand) as an ItemList.
export function itemListSchema(locale: string, products: ProductView[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absolute(localePath(locale, `/product/${p.slug}`)),
      name: locale === 'ar' ? p.nameAr : p.nameEn,
    })),
  };
}
