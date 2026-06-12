import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getActiveDrop } from '@/lib/drop';
import { getDropProducts } from '@/lib/products';
import ProductCard from '@/components/ProductCard';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import Countdown from '@/components/Countdown';
import Vault from '@/components/Vault';
import Teaser from '@/components/Teaser';
import Entrance from '@/components/Entrance';

export default async function Home({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const drop = await getActiveDrop();
  const live = drop.status === 'LIVE';

  return (
    <>
      <Entrance live={live} />
      <div className="animate-reveal min-h-screen flex flex-col">
        <Nav />
        {live ? (
          <LiveHero dropSlug={drop.slug} />
        ) : (
          <CountdownHero launchAtMs={new Date(drop.launchAt).getTime()} teaser={drop.teaserImage} />
        )}
        <Ticker />
        <LookbookStrip />
        <ArchiveTeaser />
        <Footer />
      </div>
    </>
  );
}

function CountdownHero({
  launchAtMs,
  teaser,
}: {
  launchAtMs: number;
  teaser: string | null;
}) {
  const t = useTranslations('Countdown');
  return (
    <section className="relative px-6 pt-14 pb-11 text-center flex-1 overflow-hidden">
      {/* Cinematic desert backdrop — heavily darkened so the gold/ink stays law */}
      <div
        className="absolute inset-0 bg-cover bg-center opacity-[0.16]"
        style={{ backgroundImage: "url('/img/campaign/desert-dune.jpg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-gradient-to-b from-bg/60 via-transparent to-bg" aria-hidden />

      <div className="relative">
        <div className="font-mono text-[10px] tracking-[0.4em] text-gold/90 uppercase mb-3.5">
          {t('eyebrow')}
        </div>
        <h1 className="text-[40px] font-bold tracking-[-0.02em] leading-[1.05] mb-2.5">
          {t('title')}
        </h1>
        <p className="text-[13px] text-ink/40 mb-9 max-w-md mx-auto">{t('subtitle')}</p>

        <Countdown launchAtMs={launchAtMs} />
        <Teaser image={teaser} />
        <Vault source="home" />
      </div>
    </section>
  );
}

async function LiveHero({ dropSlug }: { dropSlug: string }) {
  const t = await getTranslations('Live');
  const products = await getDropProducts(dropSlug);
  return (
    <section className="px-6 pt-14 pb-11 flex-1">
      <div className="text-center mb-10">
        <div className="font-mono text-[10px] tracking-[0.4em] text-gold/90 uppercase mb-3.5">
          {t('eyebrow')}
        </div>
        <h1 className="text-[40px] font-bold tracking-[-0.02em] leading-[1.05] mb-2.5">
          {t('title')}
        </h1>
        <p className="text-[13px] text-ink/40 max-w-md mx-auto">{t('subtitle')}</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 max-w-5xl mx-auto">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}

async function LookbookStrip() {
  const t = await getTranslations('Nav');
  const shots = [
    '/img/lookbook/tunnel-night.jpg',
    '/img/lookbook/neon-camo.jpg',
    '/img/lookbook/yellow-wall-duo.jpg',
    '/img/lookbook/ocean-duo.jpg',
  ];

  return (
    <section className="py-11">
      <div className="px-6 font-mono text-[11px] tracking-label uppercase text-ink/35 flex items-center gap-2.5 mb-[22px] before:content-[''] before:w-[22px] before:h-[0.5px] before:bg-gold/50">
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

async function ArchiveTeaser() {
  const t = await getTranslations('Archive');
  const pieces = [
    {
      image: '/img/archive/bw-supreme.jpg',
      name: t('claimed', { claimed: 150, total: 150 }),
      label: 'Bazar Hoodie — Black',
    },
    {
      image: '/img/archive/city-cap.jpg',
      name: t('claimed', { claimed: 200, total: 200 }),
      label: 'Souq Tee — Bone',
    },
    {
      image: '/img/archive/brick-duo.jpg',
      name: t('claimed', { claimed: 120, total: 120 }),
      label: 'Night Cargo — Ash',
    },
  ];

  return (
    <section className="px-6 py-11">
      <div className="flex items-baseline justify-between mb-[22px]">
        <div className="font-mono text-[11px] tracking-label uppercase text-ink/35 flex items-center gap-2.5 before:content-[''] before:w-[22px] before:h-[0.5px] before:bg-gold/50">
          {t('title')}
        </div>
        <div className="font-mono text-[9px] text-gold/60 tracking-[0.12em]">
          {t('meta')}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        {pieces.map((p, i) => (
          <div key={i}>
            <div className="aspect-square border border-ink/[0.06] relative mb-2 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.image}
                alt={p.label}
                className="w-full h-full object-cover grayscale-[60%] brightness-[0.8]"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[9px] tracking-label uppercase text-ink/80 border border-ink/50 px-3 py-1.5 -rotate-[8deg] bg-bg/65">
                  {t('soldOut')}
                </span>
              </div>
            </div>
            <div className="text-[12px] font-medium">{p.label}</div>
            <div className="font-mono text-[9px] text-gold/70 mt-0.5 tracking-[0.1em]">
              {p.name}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
