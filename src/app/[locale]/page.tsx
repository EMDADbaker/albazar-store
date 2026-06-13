import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getActiveDrop } from '@/lib/drop';
import { getStorefrontDrops } from '@/lib/storefront';
import { getHeroSlides } from '@/lib/hero';
import HeroCarousel, { type Slide } from '@/components/HeroCarousel';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import Countdown from '@/components/Countdown';
import Vault from '@/components/Vault';
import Entrance from '@/components/Entrance';
import DropSection from '@/components/DropSection';

export default async function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const [drop, drops, heroSlides] = await Promise.all([
    getActiveDrop(),
    getStorefrontDrops(),
    getHeroSlides(),
  ]);
  const live = drop.status === 'LIVE';
  const slides: Slide[] = heroSlides.map((s) => ({
    image: s.image,
    title: locale === 'ar' ? s.titleAr : s.titleEn,
    subtitle: locale === 'ar' ? s.subtitleAr : s.subtitleEn,
  }));

  return (
    <>
      <Entrance live={live} />
      <div className="animate-reveal min-h-screen flex flex-col">
        <Nav />

        {/* DARK cinematic hero */}
        {live ? (
          <LiveHero name={locale === 'ar' ? drop.nameAr : drop.nameEn} slides={slides} />
        ) : (
          <CountdownHero
            launchAtMs={new Date(drop.launchAt).getTime()}
            name={locale === 'ar' ? drop.nameAr : drop.nameEn}
            slides={slides}
          />
        )}

        <Ticker />

        {/* WHITE storefront — all published drops, clearly separated */}
        <StorefrontIntro />
        {drops.length === 0 ? (
          <EmptyStore />
        ) : (
          drops.map((d, i) => (
            <div key={d.id}>
              {i > 0 && <DarkStrip />}
              <DropSection drop={d} band={i % 2 === 1} locale={locale} />
            </div>
          ))
        )}

        {/* DARK closers */}
        <DarkStrip />
        <LookbookStrip />
        <VaultBand />
        <Footer />
      </div>
    </>
  );
}

/* ------------------------------- Dark hero -------------------------------- */

function CountdownHero({
  launchAtMs,
  name,
  slides,
}: {
  launchAtMs: number;
  name: string;
  slides: Slide[];
}) {
  const t = useTranslations('Countdown');
  const ts = useTranslations('Storefront');
  // Owner-managed slides; sensible default if none are published.
  const effective: Slide[] =
    slides.length > 0
      ? slides
      : [
          {
            image: '/img/campaign/desert-dune.jpg',
            title: t('title'),
            subtitle: t('subtitle'),
          },
        ];

  return (
    <HeroCarousel slides={effective} eyebrow={`${name} — ${t('eyebrow')}`}>
      <Countdown launchAtMs={launchAtMs} />
      <a
        href="#shop"
        className="inline-flex flex-col items-center gap-2 mt-2 font-mono text-[10px] tracking-[0.3em] uppercase text-ink/50 hover:text-accent transition-colors"
      >
        {ts('shopTitle')}
        <span className="animate-bounce">↓</span>
      </a>
    </HeroCarousel>
  );
}

function LiveHero({ name, slides }: { name: string; slides: Slide[] }) {
  const t = useTranslations('Live');
  const ts = useTranslations('Storefront');
  // Owner slides drive the cover; fall back to the live copy if none are set.
  const effective: Slide[] =
    slides.length > 0
      ? slides
      : [{ image: '/img/campaign/desert-dune.jpg', title: t('title'), subtitle: t('subtitle') }];

  return (
    <HeroCarousel slides={effective} eyebrow={`${name} — ${t('eyebrow')}`}>
      <a
        href="#shop"
        className="inline-flex flex-col items-center gap-2 mt-4 font-mono text-[10px] tracking-[0.3em] uppercase text-ink/50 hover:text-accent transition-colors"
      >
        {ts('shopTitle')}
        <span className="animate-bounce">↓</span>
      </a>
    </HeroCarousel>
  );
}

/* ----------------------------- Storefront --------------------------------- */

function StorefrontIntro() {
  const t = useTranslations('Storefront');
  return (
    <section id="shop" className="bg-paper text-coal scroll-mt-16">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-2 text-center">
        <h2 className="text-[clamp(26px,5vw,40px)] font-bold tracking-[-0.02em] mb-2">
          {t('shopTitle')}
        </h2>
        <p className="font-mono text-[11px] text-coal/50 tracking-wide uppercase">
          {t('shopSubtitle')}
        </p>
      </div>
    </section>
  );
}

function EmptyStore() {
  const t = useTranslations('Storefront');
  return (
    <section className="bg-paper text-coal">
      <div className="max-w-6xl mx-auto px-6 py-20 text-center">
        <p className="text-[14px] text-coal/50">{t('empty')}</p>
      </div>
    </section>
  );
}

// Slim dark band that separates the cinematic hero and each white drop.
function DarkStrip() {
  return (
    <div className="bg-bg py-3 flex items-center justify-center">
      <span className="w-1 h-1 rounded-full bg-accent/50" />
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
          <div key={i} className="aspect-[4/5] overflow-hidden group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="w-full h-full object-cover grayscale-[35%] transition-all duration-700 group-hover:grayscale-0 group-hover:scale-[1.04]"
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
