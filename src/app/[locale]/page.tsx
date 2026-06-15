import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getHeroSlides } from '@/lib/hero';
import { getNewArrivals, getCategoryCards } from '@/lib/catalog';
import HeroCarousel, { type Slide } from '@/components/HeroCarousel';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import Vault from '@/components/Vault';
import Entrance from '@/components/Entrance';
import ShopProductCard from '@/components/ShopProductCard';
import { Link } from '@/i18n/routing';

export const dynamic = 'force-dynamic';

export default async function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const [heroSlides, newArrivals, categories] = await Promise.all([
    getHeroSlides(),
    getNewArrivals(8),
    getCategoryCards(),
  ]);
  const slides: Slide[] = heroSlides.map((s) => ({
    image: s.image,
    title: locale === 'ar' ? s.titleAr : s.titleEn,
    subtitle: locale === 'ar' ? s.subtitleAr : s.subtitleEn,
  }));

  return (
    <>
      <Entrance live={false} />
      <div className="animate-reveal min-h-screen flex flex-col">
        <Nav />

        <Hero slides={slides} />
        <Ticker />

        <NewArrivals products={newArrivals} />
        <ShopByCategory categories={categories} locale={locale} />

        <LookbookStrip />
        <VaultBand />
        <Footer />
      </div>
    </>
  );
}

/* --------------------------------- Hero ----------------------------------- */

function Hero({ slides }: { slides: Slide[] }) {
  const t = useTranslations('Storefront');
  const effective: Slide[] =
    slides.length > 0
      ? slides
      : [
          {
            image: '/img/campaign/desert-dune.jpg',
            title: 'ALBAZAR',
            subtitle: t('shopSubtitle'),
          },
        ];
  return (
    <HeroCarousel slides={effective} eyebrow="ALBAZAR · البازار">
      <a
        href="#shop"
        className="inline-flex flex-col items-center gap-2 mt-3 font-mono text-[10px] tracking-[0.3em] uppercase text-ink/50 hover:text-accent transition-colors"
      >
        {t('shopTitle')}
        <span className="animate-bounce">↓</span>
      </a>
    </HeroCarousel>
  );
}

/* ----------------------------- New Arrivals ------------------------------- */

function NewArrivals({
  products,
}: {
  products: Awaited<ReturnType<typeof getNewArrivals>>;
}) {
  const t = useTranslations('Storefront');
  if (products.length === 0) {
    return (
      <section id="shop" className="bg-paper text-coal scroll-mt-28">
        <div className="max-w-6xl mx-auto px-6 py-20 text-center text-[14px] text-coal/50">
          {t('empty')}
        </div>
      </section>
    );
  }
  return (
    <section id="shop" className="bg-paper text-coal scroll-mt-28">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <SectionHead title={t('newArrivals')} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
          {products.map((p) => (
            <ShopProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* --------------------------- Shop by Category ----------------------------- */

function ShopByCategory({
  categories,
  locale,
}: {
  categories: Awaited<ReturnType<typeof getCategoryCards>>;
  locale: string;
}) {
  const t = useTranslations('Storefront');
  if (categories.length === 0) return null;
  return (
    <section className="bg-paper-2 text-coal">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
        <SectionHead title={t('shopByCategory')} />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map((c) => (
            <Link key={c.slug} href={`/category/${c.slug}`} className="group relative block aspect-[4/3] overflow-hidden bg-coal/5">
              {c.image && (
                <Image
                  src={c.image}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-coal/40 group-hover:bg-coal/30 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-display font-bold text-[clamp(18px,3vw,24px)] tracking-[0.04em] uppercase text-paper text-center px-2">
                  {locale === 'ar' ? c.nameAr : c.nameEn}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionHead({ title, href, linkLabel }: { title: string; href?: string; linkLabel?: string }) {
  return (
    <div className="flex items-end justify-between mb-7">
      <h2 className="text-[clamp(22px,4vw,34px)] font-bold tracking-[-0.02em]">{title}</h2>
      {href && linkLabel && (
        <Link
          href={href}
          className="font-mono text-[10px] tracking-wide uppercase text-coal/50 hover:text-coal border-b border-coal/30 pb-0.5"
        >
          {linkLabel} →
        </Link>
      )}
    </div>
  );
}

/* ------------------------------ Dark closers ------------------------------ */

async function LookbookStrip() {
  const t = await getTranslations('Nav');
  const shots = [
    '/img/lookbook/tunnel-night.jpg',
    '/img/lookbook/neon-camo.jpg',
    '/img/lookbook/yellow-wall-duo.jpg',
    '/img/lookbook/ocean-duo.jpg',
  ];
  return (
    <section className="bg-bg py-11">
      <div className="px-6 font-mono text-[11px] tracking-label uppercase text-ink/35 flex items-center gap-2.5 mb-[22px] before:content-[''] before:w-[22px] before:h-[0.5px] before:bg-accent/50">
        {t('lookbook')}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4">
        {shots.map((src, i) => (
          <div key={i} className="relative aspect-[4/5] overflow-hidden group">
            <Image
              src={src}
              alt=""
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover grayscale-[35%] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.04]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}

function VaultBand() {
  const t = useTranslations('About');
  return (
    <section className="bg-bg px-6 py-16 text-center border-t border-ink/[0.06]">
      <h2 className="text-[24px] font-bold mb-2">{t('ctaTitle')}</h2>
      <p className="text-[12px] text-ink/40 mb-7">{t('ctaSub')}</p>
      <Vault source="home-foot" />
    </section>
  );
}
