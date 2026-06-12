import { useTranslations } from 'next-intl';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { getActiveDrop } from '@/lib/drop';
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
          <LiveHero />
        ) : (
          <CountdownHero launchAtMs={new Date(drop.launchAt).getTime()} teaser={drop.teaserImage} />
        )}
        <Ticker />
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
    <section className="px-6 pt-14 pb-11 text-center flex-1">
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
    </section>
  );
}

function LiveHero() {
  const t = useTranslations('Live');
  return (
    <section className="px-6 pt-14 pb-11 text-center flex-1">
      <div className="font-mono text-[10px] tracking-[0.4em] text-gold/90 uppercase mb-3.5">
        {t('eyebrow')}
      </div>
      <h1 className="text-[40px] font-bold tracking-[-0.02em] leading-[1.05] mb-2.5">
        {t('title')}
      </h1>
      <p className="text-[13px] text-ink/40 mb-9 max-w-md mx-auto">{t('subtitle')}</p>
      {/* Product grid wired in the Drop page step. */}
    </section>
  );
}

async function ArchiveTeaser() {
  const t = await getTranslations('Archive');
  const pieces = [
    { name: t('claimed', { claimed: 150, total: 150 }), label: 'Bazar Hoodie — Black' },
    { name: t('claimed', { claimed: 200, total: 200 }), label: 'Souq Tee — Bone' },
    { name: t('claimed', { claimed: 120, total: 120 }), label: 'Night Cargo — Ash' },
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
            <div className="aspect-square bg-ink/[0.035] border border-ink/[0.06] flex items-center justify-center relative mb-2">
              <div className="w-[58%] h-[62%] bg-ink/[0.05] border border-ink/[0.08]" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="font-mono text-[9px] tracking-label uppercase text-ink/65 border border-ink/40 px-3 py-1.5 -rotate-[8deg] bg-bg/55">
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
