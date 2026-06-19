import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getNewArrivals } from '@/lib/catalog';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';
import JeddahExpandText from '@/components/JeddahExpandText';

// "OLD JEDDAH × STREETWEAR" editorial special — an art-directed collage page
// reached from the STREET WEAR hero slide. Static/ISR like the other browse
// pages. Monochrome + gold adaptation of an editorial festival layout.
export const revalidate = 60;

// Tiny gold spark used as scattered decoration (the "star" overlay pattern).
function Spark({ className = '' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`absolute pointer-events-none text-accent/70 ${className}`}
      fill="currentColor"
    >
      <path d="M12 0c.6 5.6 5.8 10.8 12 12-6.2 1.2-11.4 6.4-12 12-.6-5.6-5.8-10.8-12-12C6.2 10.8 11.4 5.6 12 0z" />
    </svg>
  );
}

export default async function JeddahEditorial({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Jeddah');
  const products = await getNewArrivals(6);

  return (
    <div className="relative min-h-screen flex flex-col bg-bg text-ink overflow-x-hidden">
      <div id="hero-sentinel" className="absolute top-0 inset-x-0 h-[100px] pointer-events-none" aria-hidden />
      <Nav hero />

      {/* ── Section 0 — Hero opener ───────────────────────────────────────── */}
      <section className="relative h-[88vh] min-h-[520px] flex flex-col items-center justify-center text-center px-6 overflow-hidden">
        <Image
          src="/img/campaign/saudi-heritage.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.28]"
          aria-hidden
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/70 via-bg/40 to-bg" aria-hidden />
        <Spark className="w-7 h-7 top-[18%] left-[14%]" />
        <Spark className="w-4 h-4 top-[26%] right-[18%]" />
        <Spark className="w-5 h-5 bottom-[20%] left-[22%]" />

        <div className="relative max-w-3xl">
          <div className="font-mono text-[10px] tracking-[0.4em] text-accent/90 uppercase mb-4">
            {t('eyebrow')}
          </div>
          <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/45 mb-3">
            {t('kicker')}
          </div>
          <h1 className="font-display font-bold tracking-[-0.02em] leading-[0.92]">
            <span className="block text-[clamp(44px,12vw,120px)]">{t('title')}</span>
            <span className="block text-[clamp(20px,5vw,44px)] text-accent mt-1">{t('titleAccent')}</span>
          </h1>
          <p className="text-[14px] sm:text-[15px] text-ink/55 max-w-xl mx-auto mt-6 leading-relaxed">
            {t('lede')}
          </p>
        </div>
        <span className="absolute bottom-7 font-mono text-[18px] text-ink/40 animate-bounce" aria-hidden>↓</span>
      </section>

      {/* ── Section 1 — collage grid + circular portrait ──────────────────── */}
      <section className="relative">
        <div className="flex flex-wrap">
          <div className="relative w-1/2 aspect-[3/4]">
            <Image src="/img/lookbook/warehouse-smile.jpg" alt="" fill sizes="50vw" className="object-cover" />
          </div>
          <div className="relative w-1/2 aspect-[3/4]">
            <Image src="/img/lookbook/classic-car.jpg" alt="" fill sizes="50vw" className="object-cover" />
          </div>
        </div>
        {/* Centered circular portrait with a pure-CSS vignette ring + gold edge */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[44%] max-w-[340px] aspect-square rounded-full overflow-hidden border-2 border-accent/40 shadow-[0_0_60px_rgba(0,0,0,0.6)]">
          <Image src="/img/lookbook/trappers-tee.jpg" alt="" fill sizes="40vw" className="object-cover" />
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle, transparent 31%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.85) 70%, #080808 98%)',
            }}
            aria-hidden
          />
        </div>
        <Spark className="w-6 h-6 top-[8%] left-[44%] z-10" />
        <Spark className="w-4 h-4 bottom-[12%] right-[30%] z-10" />
      </section>

      {/* ── Section 2 — full-bleed cinematic quote ────────────────────────── */}
      <section className="relative h-[70vh] min-h-[420px] flex items-center justify-center text-center px-6 overflow-hidden">
        <Image src="/img/campaign/riyadh-arch.jpg" alt="" fill sizes="100vw" className="object-cover opacity-40" aria-hidden />
        <div className="absolute inset-0 bg-bg/55" aria-hidden />
        <blockquote className="relative max-w-2xl">
          <p className="font-display text-[clamp(24px,5vw,46px)] font-bold leading-[1.1] tracking-[-0.01em]">
            “{t('quote')}”
          </p>
          <footer className="font-mono text-[10px] tracking-[0.25em] uppercase text-accent/80 mt-5">
            {t('quoteCredit')}
          </footer>
        </blockquote>
      </section>

      {/* ── Section 3 — Shop the edit (real products) ─────────────────────── */}
      {products.length > 0 && (
        <section className="bg-paper text-coal">
          <div className="max-w-6xl mx-auto px-5 sm:px-8 py-16">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <div className="font-mono text-[10px] tracking-[0.3em] uppercase text-coal/45 mb-2">
                  {t('editTag')}
                </div>
                <h2 className="text-[clamp(24px,4vw,38px)] font-bold tracking-[-0.02em]">{t('editTitle')}</h2>
                <p className="text-[13px] text-coal/60 mt-1">{t('editSub')}</p>
              </div>
              <Link href="/shop" className="font-mono text-[10px] tracking-wide uppercase text-coal/65 hover:text-coal border-b border-coal/30 pb-0.5 whitespace-nowrap">
                {t('cta')} →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-9">
              {products.map((p) => (
                <ShopProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Section 4 — heritage split (circle bleeds off the edge) ────────── */}
      <section className="relative grid md:grid-cols-2 items-stretch border-y border-ink/[0.08]">
        <div className="relative aspect-[4/5] md:aspect-auto md:min-h-[460px] overflow-hidden">
          <Image src="/img/campaign/oasis.jpg" alt="" fill sizes="(max-width:768px) 100vw, 50vw" className="object-cover" />
          {/* circle bleeding off the left edge */}
          <div className="hidden md:block absolute top-1/2 -translate-y-1/2 -left-[12%] w-[42%] aspect-square rounded-full overflow-hidden border-2 border-accent/40">
            <Image src="/img/lookbook/pink-shutter.jpg" alt="" fill sizes="25vw" className="object-cover" />
            <div className="absolute inset-0" style={{ background: 'radial-gradient(circle, transparent 35%, rgba(0,0,0,0.7) 75%, #080808 99%)' }} aria-hidden />
          </div>
        </div>
        <div className="px-6 sm:px-10 py-14 md:py-20 flex flex-col justify-center">
          <div className="font-mono text-[11px] tracking-[0.25em] uppercase text-accent/80 mb-4">{t('heritageTag')}</div>
          <h2 className="text-[clamp(24px,4vw,40px)] font-bold tracking-[-0.02em] leading-[1.05] mb-5">{t('heritageTitle')}</h2>
          <p className="text-[14px] text-ink/55 leading-relaxed">{t('heritageBody')}</p>
        </div>
      </section>

      {/* ── Section 5 — footer CTA with expand text + glowing pill ─────────── */}
      <section className="relative text-center px-6 py-20 overflow-hidden">
        <Spark className="w-5 h-5 top-[14%] right-[26%]" />
        <h2 className="font-display text-[clamp(26px,5vw,48px)] font-bold tracking-[-0.02em] mb-6">{t('footerTitle')}</h2>
        <JeddahExpandText text={t('footerBody')} expandLabel={t('expand')} collapseLabel={t('collapse')} />
        <Link
          href="/shop"
          className="mt-9 inline-block font-mono text-[12px] font-bold tracking-[0.18em] uppercase border-2 border-accent text-accent rounded-full px-8 py-3 transition-all duration-200 hover:bg-accent hover:text-bg hover:shadow-[0_0_18px_rgba(200,160,80,0.5)]"
        >
          {t('cta')}
        </Link>
      </section>

      <Footer />
    </div>
  );
}
