import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Nav from '@/components/Nav';
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
    path: '/lookbook',
    title: locale === 'ar' ? 'لوك بوك' : 'Lookbook',
    description:
      locale === 'ar'
        ? 'لوك بوكات البازار — افتتاحيات مصوّرة من جدة القديمة للدنيم والشارع.'
        : 'The ALBAZAR lookbooks — photo editorials from Old Jeddah to denim and the street.',
    images: ['/img/lookbook/tunnel-night.jpg'],
  });
}

// Each edition is its own art-directed page. Add new ones here.
const EDITIONS: { href: string; cover: string; en: string; ar: string; tagEn: string; tagAr: string }[] = [
  {
    href: '/jeddah',
    cover: '/img/campaign/saudi-heritage.jpg',
    en: 'Old Jeddah × Streetwear',
    ar: 'جدة القديمة × ستريت وير',
    tagEn: 'Heritage',
    tagAr: 'تراث',
  },
  {
    href: '/lookbook/denim',
    cover: '/img/lookbook/classic-car.jpg',
    en: 'Be My ALBAZAR',
    ar: 'كن البازار',
    tagEn: 'Denim · SS/2026',
    tagAr: 'دنيم · صيف ٢٦',
  },
  {
    href: '/lookbook/street',
    cover: '/img/lookbook/tunnel-night.jpg',
    en: 'Street',
    ar: 'الشارع',
    tagEn: 'Photo grid',
    tagAr: 'تصوير الشارع',
  },
];

export default function LookbookIndex({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const ar = locale === 'ar';

  return (
    <div className="min-h-screen flex flex-col">
      <Nav />

      <section className="px-6 pt-14 pb-10 text-center">
        <div className="font-mono text-[10px] tracking-[0.4em] text-accent/90 uppercase mb-3.5">
          {ar ? 'لوك بوك' : 'Lookbook'}
        </div>
        <h1 className="text-[clamp(34px,7vw,56px)] font-bold tracking-[-0.02em] leading-[1.02] mb-3">
          {ar ? 'الافتتاحيات' : 'The Editions'}
        </h1>
        <p className="text-[13px] text-ink/40 max-w-md mx-auto">
          {ar ? 'كل افتتاحية لها مزاجها الخاص. اختر وادخل.' : 'Each edition, its own mood. Pick one and step in.'}
        </p>
      </section>

      <section className="flex-1 px-4 sm:px-6 pb-16 max-w-6xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {EDITIONS.map((e) => (
            <Link key={e.href} href={e.href} className="group relative block aspect-[3/4] overflow-hidden bg-ink/[0.05]">
              <Image
                src={e.cover}
                alt={ar ? e.ar : e.en}
                fill
                sizes="(max-width: 640px) 100vw, 33vw"
                className="object-cover transition-transform duration-[900ms] ease-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/20 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5">
                <div className="font-mono text-[9px] tracking-[0.3em] uppercase text-accent mb-1.5">
                  {ar ? e.tagAr : e.tagEn}
                </div>
                <div className="text-[20px] font-bold tracking-[-0.01em] leading-tight">{ar ? e.ar : e.en}</div>
                <div className="font-mono text-[10px] uppercase tracking-wide text-ink/60 mt-2 group-hover:text-accent transition-colors">
                  {ar ? 'ادخل →' : 'Enter →'}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
