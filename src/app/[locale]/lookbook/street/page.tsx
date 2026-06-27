import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Ticker from '@/components/Ticker';
import Footer from '@/components/Footer';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMeta({
    locale,
    path: '/lookbook/street',
    title: locale === 'ar' ? 'لوك بوك — الشارع' : 'Lookbook — Street',
    description:
      locale === 'ar'
        ? 'تصوير الشارع والستايل من البازار — القطع على أرض الواقع.'
        : 'Street photography and styling from ALBAZAR — the pieces in the wild.',
    images: ['/img/lookbook/tunnel-night.jpg'],
  });
}

// Editorial grid: a few hero-scale frames broken up by tighter pairs.
const SHOTS: { src: string; span: string; ratio: string }[] = [
  { src: '/img/lookbook/tunnel-night.jpg', span: 'sm:col-span-2 sm:row-span-2', ratio: 'aspect-[4/5] sm:aspect-auto' },
  { src: '/img/lookbook/trappers-tee.jpg', span: '', ratio: 'aspect-[4/5]' },
  { src: '/img/lookbook/pink-shutter.jpg', span: '', ratio: 'aspect-[4/5]' },
  { src: '/img/lookbook/texas-purple.jpg', span: 'sm:col-span-2', ratio: 'aspect-[16/10]' },
  { src: '/img/lookbook/neon-camo.jpg', span: '', ratio: 'aspect-[4/5]' },
  { src: '/img/lookbook/bad-vibes-wall.jpg', span: '', ratio: 'aspect-[4/5]' },
  { src: '/img/lookbook/ocean-duo.jpg', span: 'sm:row-span-2', ratio: 'aspect-[4/5] sm:aspect-auto' },
  { src: '/img/lookbook/warehouse-smile.jpg', span: '', ratio: 'aspect-square' },
  { src: '/img/lookbook/white-kicks.jpg', span: '', ratio: 'aspect-square' },
  { src: '/img/lookbook/yellow-wall-duo.jpg', span: 'sm:col-span-2', ratio: 'aspect-[16/10]' },
  { src: '/img/lookbook/classic-car.jpg', span: '', ratio: 'aspect-[4/5]' },
];

export default function StreetLookbook({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <Hero />
      <section className="px-3 sm:px-4 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 auto-rows-[1fr]">
          {SHOTS.map((s, i) => (
            <figure key={i} className={`group relative overflow-hidden bg-ink/[0.04] ${s.span} ${s.ratio}`}>
              <Image
                src={s.src}
                alt=""
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-[1.05]"
              />
              <div className="absolute inset-0 ring-1 ring-inset ring-ink/[0.06]" />
            </figure>
          ))}
        </div>
      </section>
      <Ticker />
      <Footer />
    </div>
  );
}

function Hero() {
  const t = useTranslations('Lookbook');
  return (
    <section className="px-6 pt-14 pb-10 text-center">
      <div className="font-mono text-[10px] tracking-[0.4em] text-accent/90 uppercase mb-3.5">{t('eyebrow')}</div>
      <h1 className="text-[clamp(34px,7vw,56px)] font-bold tracking-[-0.02em] leading-[1.02] mb-3">{t('title')}</h1>
      <p className="text-[13px] text-ink/40 max-w-md mx-auto">{t('subtitle')}</p>
    </section>
  );
}
