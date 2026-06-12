import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import ShopProductCard from './ShopProductCard';
import type { StorefrontDrop } from '@/lib/storefront';

// One clearly-separated drop on the white storefront: a bold header with a
// status badge, the date/piece count, then its product grid. The `band` flag
// alternates white / off-white so consecutive drops read as distinct.
export default async function DropSection({
  drop,
  band,
  locale,
}: {
  drop: StorefrontDrop;
  band: boolean;
  locale: string;
}) {
  const t = await getTranslations('DropBadge');
  const ts = await getTranslations('Storefront');
  const name = locale === 'ar' ? drop.nameAr : drop.nameEn;

  const badge = {
    LIVE: { label: t('live'), cls: 'bg-coal text-paper', dot: true },
    TEASER: { label: t('teaser'), cls: 'border border-coal/30 text-coal', dot: false },
    SOLDOUT: { label: t('soldout'), cls: 'border border-coal/20 text-coal/50', dot: false },
    ARCHIVED: { label: t('archived'), cls: 'border border-coal/20 text-coal/50', dot: false },
  }[drop.status];

  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <section className={band ? 'bg-paper-2 text-coal' : 'bg-paper text-coal'}>
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        {/* Header */}
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8 pb-5 border-b border-coal/15">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide uppercase px-2.5 py-1 ${badge.cls}`}
              >
                {badge.dot && (
                  <span className="w-1.5 h-1.5 rounded-full bg-paper animate-pulse" />
                )}
                {badge.label}
              </span>
              <span className="font-mono text-[10px] text-coal/40 uppercase tracking-wide">
                {dateFmt.format(new Date(drop.launchAt))}
              </span>
            </div>
            <h2 className="text-[clamp(28px,5vw,44px)] font-bold tracking-[-0.02em] leading-none">
              {name}
            </h2>
          </div>
          <div className="font-mono text-[11px] text-coal/50">
            {ts('pieces', { count: drop.products.length })}
          </div>
        </div>

        {/* Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
          {drop.products.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>

        {drop.status === 'LIVE' && (
          <div className="mt-9">
            <Link
              href={`/drop/${drop.slug}`}
              className="inline-block font-mono text-[11px] tracking-wide uppercase text-coal border border-coal/30 px-6 py-3 hover:bg-coal hover:text-paper transition-colors"
            >
              {ts('viewDrop')} →
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
