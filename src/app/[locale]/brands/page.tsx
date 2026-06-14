import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getAllActiveBrands } from '@/lib/brands';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';

export const dynamic = 'force-dynamic';

export default async function BrandsPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Brands');
  const brands = await getAllActiveBrands();

  // Group A–Z by first letter.
  const groups: Record<string, typeof brands> = {};
  for (const b of brands) {
    const letter = /[a-z]/i.test(b.nameEn[0]) ? b.nameEn[0].toUpperCase() : '#';
    (groups[letter] ??= []).push(b);
  }
  const letters = Object.keys(groups).sort();

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />

      <section className="px-5 sm:px-8 pt-12 pb-6 max-w-6xl mx-auto w-full">
        <div className="font-mono text-[10px] tracking-[0.35em] text-coal/45 uppercase mb-3">
          {t('eyebrow')}
        </div>
        <h1 className="text-[clamp(32px,6vw,52px)] font-bold tracking-[-0.02em] leading-none mb-4">
          {t('title')}
        </h1>
        {/* Letter jump bar */}
        <div className="flex flex-wrap gap-1.5">
          {letters.map((l) => (
            <a
              key={l}
              href={`#${l}`}
              className="font-mono text-[11px] text-coal/50 hover:text-coal hover:bg-coal/10 w-6 h-6 flex items-center justify-center transition-colors"
            >
              {l}
            </a>
          ))}
        </div>
      </section>

      <section className="flex-1 px-5 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        {brands.length === 0 && (
          <p className="text-[14px] text-coal/50 py-10">{t('empty')}</p>
        )}
        {letters.map((l) => (
          <div key={l} id={l} className="scroll-mt-28 mb-8">
            <div className="font-mono text-[13px] font-bold text-coal/30 border-b border-coal/12 pb-1 mb-3">
              {l}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-2">
              {groups[l].map((b) => (
                <Link
                  key={b.slug}
                  href={`/brand/${b.slug}`}
                  className="text-[14px] text-coal/80 hover:text-coal hover:underline py-1"
                >
                  {b.nameEn}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <Footer />
    </div>
  );
}
