import { getLocale, getTranslations } from 'next-intl/server';
import { getAllActiveBrands } from '@/lib/brands';
import { getActiveDropSlug } from '@/lib/drop';
import SiteHeader, { type HeaderLabels } from './SiteHeader';

// Server wrapper: fetches the (cached) nav data and renders the dual-state
// SiteHeader. Pass `hero` on pages that render a #hero-sentinel (homepage,
// /jeddah) to enable Hero Mode; everything else stays in Shopping Mode.
export default async function Nav({ hero = false }: { hero?: boolean }) {
  const t = await getTranslations('Nav');
  const tb = await getTranslations('Brands');
  const locale = await getLocale();

  // Cached getters; catch so a transient DB blip just renders an emptier header.
  let brands: Awaited<ReturnType<typeof getAllActiveBrands>> = [];
  let dropSlug: string | null = null;
  try {
    [brands, dropSlug] = await Promise.all([getAllActiveBrands(), getActiveDropSlug()]);
  } catch {
    /* leave defaults */
  }

  const labels: HeaderLabels = {
    menu: t('menu'),
    close: t('close'),
    shopAll: t('shopAll'),
    allBrands: tb('title'),
    brandsTitle: tb('nav'),
    lookbook: t('lookbook'),
    about: t('about'),
    account: t('account'),
    signin: t('signin'),
    register: t('register') ?? 'Register',
    admin: t('adminLink'),
    newDrop: t('newDrop'),
    shop: t('shop'),
    collections: t('collections'),
    search: t('search'),
    searchPlaceholder: t('searchPlaceholder'),
  };

  return (
    <SiteHeader
      hero={hero}
      brands={brands}
      locale={locale}
      labels={labels}
      dropHref={dropSlug ? `/drop/${dropSlug}` : '/shop'}
    />
  );
}
