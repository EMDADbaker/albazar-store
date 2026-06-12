import { getTranslations, setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import { getArchivedDrops } from '@/lib/archive';

export default async function ArchivePage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('ArchivePage');
  const drops = await getArchivedDrops();

  const dateFmt = new Intl.DateTimeFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    year: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <section className="px-6 pt-14 pb-10 text-center">
        <div className="font-mono text-[10px] tracking-[0.4em] text-gold/90 uppercase mb-3.5">
          {t('eyebrow')}
        </div>
        <h1 className="text-[clamp(34px,7vw,56px)] font-bold tracking-[-0.02em] leading-[1.02] mb-3">
          {t('title')}
        </h1>
        <p className="text-[13px] text-ink/40 max-w-md mx-auto">{t('subtitle')}</p>
      </section>

      <div className="flex-1">
        {drops.map((drop) => {
          const name = locale === 'ar' ? drop.nameAr : drop.nameEn;
          return (
            <section key={drop.slug} className="px-6 pb-16">
              <div className="flex items-baseline justify-between border-b border-ink/[0.08] pb-4 mb-6">
                <div>
                  <h2 className="text-[22px] font-bold">{name}</h2>
                  <div className="font-mono text-[9px] text-ink/35 mt-1 tracking-[0.12em] uppercase">
                    {dateFmt.format(new Date(drop.droppedAt))}
                  </div>
                </div>
                <div className="font-mono text-[10px] text-gold/70 tracking-[0.12em] text-right">
                  {t('soldIn', { days: drop.soldOutDays })}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
                {drop.pieces.map((p, i) => {
                  const pname = locale === 'ar' ? p.nameAr : p.nameEn;
                  return (
                    <div key={i}>
                      <div className="aspect-square border border-ink/[0.06] relative mb-2 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.image}
                          alt={pname}
                          className="w-full h-full object-cover grayscale-[60%] brightness-[0.8] transition-all duration-700 hover:grayscale-0 hover:brightness-100"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="font-mono text-[9px] tracking-label uppercase text-ink/80 border border-ink/50 px-3 py-1.5 -rotate-[8deg] bg-bg/65">
                            {t('soldOut')}
                          </span>
                        </div>
                      </div>
                      <div className="text-[12px] font-medium">{pname}</div>
                      <div className="font-mono text-[9px] text-gold/70 mt-0.5 tracking-[0.1em]">
                        {t('claimed', { total: p.total })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <Ticker />
      <Footer />
    </div>
  );
}
