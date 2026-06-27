// Fixed storefront taxonomy for the header. Categories here are a curated IA
// (not the raw DB categories); brand lists are still pulled live from the DB.
// Bilingual labels live here so the menu stays a single source of truth.

export type MenuChild = { slug: string; en: string; ar: string };

export type MenuItem = {
  en: string;
  ar: string;
  href: string; // where the top-level label links
  brands?: boolean; // fill the dropdown with all brands (from the DB)
  children?: MenuChild[]; // category dropdown
};

export const MENU: MenuItem[] = [
  { en: 'Brands', ar: 'البراندات', href: '/brands', brands: true },
  {
    en: 'Tops',
    ar: 'علوي',
    href: '/category/tops',
    children: [
      { slug: 't-shirts', en: 'T-Shirts', ar: 'تيشيرتات' },
      { slug: 'crewnecks-hoodies', en: 'Crewnecks & Hoodies', ar: 'كروينك وهوديز' },
      { slug: 'button-ups-vests', en: 'Button-Ups / Vests', ar: 'قمصان وصدريات' },
      { slug: 'jackets', en: 'Jackets', ar: 'جواكيت' },
      { slug: 'tanks', en: 'Tanks', ar: 'فانيلات' },
    ],
  },
  {
    en: 'Bottoms',
    ar: 'سفلي',
    href: '/category/bottoms',
    children: [
      { slug: 'pants-jeans', en: 'Pants & Jeans', ar: 'بناطيل وجينز' },
      { slug: 'shorts', en: 'Shorts', ar: 'شورتات' },
      { slug: 'swim-shorts', en: 'Swim Shorts', ar: 'شورتات سباحة' },
    ],
  },
  { en: 'Headwear', ar: 'أغطية الرأس', href: '/category/headwear' },
  { en: 'Footwear', ar: 'أحذية', href: '/category/footwear' },
  {
    en: 'Accessories',
    ar: 'إكسسوارات',
    href: '/category/accessories',
    children: [
      { slug: 'bags', en: 'Bags', ar: 'شنط' },
      { slug: 'bracelets', en: 'Bracelets', ar: 'أساور' },
      { slug: 'chains', en: 'Chains', ar: 'سلاسل' },
      { slug: 'collectibles', en: 'Collectibles', ar: 'مقتنيات' },
      { slug: 'keychains', en: 'Keychains', ar: 'ميداليات' },
      { slug: 'masks', en: 'Masks', ar: 'كمامات' },
      { slug: 'necklaces', en: 'Necklaces', ar: 'قلائد' },
      { slug: 'pins-patches', en: 'Pins & Patches', ar: 'دبابيس ورقع' },
      { slug: 'rings', en: 'Rings', ar: 'خواتم' },
      { slug: 'rugs-mats-blankets', en: 'Rugs, Mats & Blankets', ar: 'سجاد ودعّاسات وبطانيات' },
      { slug: 'socks', en: 'Socks', ar: 'جوارب' },
      { slug: 'stickers', en: 'Stickers', ar: 'ستيكرات' },
      { slug: 'sunglasses', en: 'Sunglasses', ar: 'نظارات' },
    ],
  },
  // No dedicated pages yet — both point at the full shop for now.
  { en: 'New Arrivals', ar: 'وصل حديثاً', href: '/shop' },
  { en: 'Sale', ar: 'تخفيضات', href: '/shop' },
  { en: 'Journal', ar: 'المجلة', href: '/journal' },
];

// Human-readable title for a category slug, used by the category page when the
// slug isn't (yet) a real DB category, so the menu links never hit a hard 404.
export function menuTitleForSlug(slug: string, locale: string): string {
  const ar = locale === 'ar';
  for (const item of MENU) {
    if (item.href === `/category/${slug}`) return ar ? item.ar : item.en;
    for (const c of item.children ?? []) {
      if (c.slug === slug) return ar ? c.ar : c.en;
    }
  }
  // Fallback: humanize the slug ("swim-shorts" -> "Swim Shorts").
  return slug
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}
