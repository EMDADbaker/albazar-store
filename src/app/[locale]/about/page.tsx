import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import Vault from '@/components/Vault';

export default function AboutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <AboutBody />
      <Ticker />
      <Footer />
    </div>
  );
}

function AboutBody() {
  const t = useTranslations('About');
  const values = t.raw('values') as string[];

  return (
    <>
      {/* Cinematic Saudi opener */}
      <section className="relative h-[60vh] min-h-[380px] flex items-end overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/img/campaign/riyadh-arch.jpg')" }}
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-bg/20" aria-hidden />
        <div className="relative px-6 pb-10 max-w-3xl">
          <div className="font-mono text-[10px] tracking-[0.4em] text-accent/90 uppercase mb-3">
            {t('eyebrow')}
          </div>
          <h1 className="text-[clamp(36px,8vw,64px)] font-bold tracking-[-0.02em] leading-[1]">
            {t('title')}
          </h1>
        </div>
      </section>

      {/* Lead + story */}
      <section className="px-6 py-14 max-w-2xl mx-auto">
        <p className="text-[18px] sm:text-[20px] text-ink leading-snug mb-8 font-medium">
          {t('lead')}
        </p>
        <p className="text-[14px] text-ink/55 leading-relaxed mb-5">{t('body1')}</p>
        <p className="text-[14px] text-ink/55 leading-relaxed">{t('body2')}</p>
      </section>

      {/* The rules — split with heritage portrait */}
      <section className="grid md:grid-cols-2 border-y border-ink/[0.08]">
        <div className="aspect-[4/5] md:aspect-auto overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/img/campaign/saudi-heritage.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="px-6 py-12 md:py-16 flex flex-col justify-center">
          <div className="font-mono text-[11px] tracking-label uppercase text-accent/80 mb-6">
            {t('valuesTitle')}
          </div>
          <ul className="space-y-4">
            {values.map((v, i) => (
              <li key={i} className="flex items-baseline gap-3">
                <span className="font-mono text-[11px] text-accent/70 tabular-nums">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="text-[15px] text-ink/80">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Vault CTA */}
      <section className="px-6 py-16 text-center">
        <h2 className="text-[24px] font-bold mb-2">{t('ctaTitle')}</h2>
        <p className="text-[12px] text-ink/40 mb-7">{t('ctaSub')}</p>
        <Vault source="about" />
      </section>
    </>
  );
}
