import { getLocale, getTranslations } from 'next-intl/server';
import { getAllActiveBrands } from '@/lib/brands';
import SiteHeader, { type HeaderLabels } from './SiteHeader';
import ClassicHeader from './ClassicHeader';

// Server wrapper: fetches the (cached) nav data. Hero pages (homepage, /jeddah)
// get the transparent->solid dual-state SiteHeader; every other page gets the
// classic multi-row header whose taxonomy row sticks on scroll.
export default async function Nav({ hero = false }: { hero?: boolean }) {
  const t = await getTranslations('Nav');
  const tb = await getTranslations('Brands');
  const locale = await getLocale();

  // Cached getter; catch so a transient DB blip just renders an emptier header.
  let brands: Awaited<ReturnType<typeof getAllActiveBrands>> = [];
  try {
    brands = await getAllActiveBrands();
  } catch {
    /* leave empty */
  }

  const labels: HeaderLabels = {
    menu: t('menu'),
    close: t('close'),
    freeShip: t('freeShip'),
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

  return hero ? (
    <SiteHeader hero brands={brands} locale={locale} labels={labels} />
  ) : (
    <ClassicHeader brands={brands} locale={locale} labels={labels} />
  );
}
