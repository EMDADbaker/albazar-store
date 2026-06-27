import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = false;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMeta({
    locale,
    path: '/lookbook/denim',
    title: locale === 'ar' ? 'كن البازار — افتتاحية الدنيم' : 'Be My ALBAZAR — Denim Editorial',
    description:
      locale === 'ar'
        ? 'افتتاحية الدنيم من البازار — أقواس ذهبية وتصوير الشارع لموسم صيف ٢٠٢٦.'
        : 'The ALBAZAR denim editorial — gold arches and street photography for SS/2026.',
    images: ['/img/lookbook/texas-purple.jpg'],
  });
}

// Gold "arch" frame — the signature shape, adapted from the neon arch concept.
const ARCH = 'relative overflow-hidden border-[5px] sm:border-[7px] border-accent';

function Arch({ src, className = '', radius = 'rounded-[5rem] sm:rounded-[11em]' }: { src: string; className?: string; radius?: string }) {
  return (
    <div className={`${ARCH} ${radius} ${className}`}>
      <Image src={src} alt="" fill sizes="(max-width: 1024px) 100vw, 33vw" className="object-cover" />
    </div>
  );
}

export default function DenimLookbook({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const ar = locale === 'ar';
  const pills = ar ? ['دنيم', 'الموسم', 'صيف/٢٦'] : ['Denim', 'Season', 'SS/2026'];

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink">
      <Nav />

      {/* Force LTR geometry so the arch layout reads the same in both languages. */}
      <main dir="ltr" className="overflow-x-hidden pb-10">
        {/* ── Hero: big composited-style slogan over a full-bleed shot ── */}
        <section className="relative aspect-[16/11] sm:aspect-[16/8] w-full overflow-hidden">
          <Image src="/img/lookbook/texas-purple.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/15 to-bg/60" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <div className="font-mono text-[11px] sm:text-[13px] tracking-[0.5em] text-accent uppercase mb-1 drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {ar ? 'كن' : 'be my'}
            </div>
            <div className="font-display font-bold text-accent leading-[0.82] text-[clamp(54px,16vw,190px)] drop-shadow-[0_6px_34px_rgba(0,0,0,0.75)]">
              {ar ? 'البازار' : 'ALBAZAR'}
            </div>
          </div>
        </section>

        {/* ── Tag pills ── */}
        <section className="flex flex-wrap justify-center gap-3 px-6 py-9">
          {pills.map((p) => (
            <span key={p} className="border border-accent/70 text-accent font-mono text-[11px] tracking-[0.2em] uppercase rounded-full px-5 py-2">
              {p}
            </span>
          ))}
        </section>

        {/* ── Three arch columns + year ── */}
        <section className="px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 max-w-6xl mx-auto">
          <Arch src="/img/lookbook/trappers-tee.jpg" className="aspect-[3/4]" />
          <Arch src="/img/lookbook/neon-camo.jpg" className="aspect-[3/4]" />
          <Arch src="/img/lookbook/pink-shutter.jpg" className="aspect-[3/4]" />
        </section>
        <div className="text-center font-display font-bold text-accent/90 text-[clamp(64px,18vw,200px)] leading-none py-8 tracking-tighter">
          2026
        </div>

        {/* ── Split half-arch portal ── */}
        <section className="px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-0 max-w-6xl mx-auto">
          <Arch src="/img/lookbook/classic-car.jpg" className="aspect-[4/5]" radius="rounded-[5rem] sm:rounded-s-[11em] sm:rounded-e-none sm:border-e-0" />
          <Arch src="/img/lookbook/bad-vibes-wall.jpg" className="aspect-[4/5]" radius="rounded-[5rem] sm:rounded-e-[11em] sm:rounded-s-none sm:border-s-0" />
        </section>

        {/* ── Wording + feature image ── */}
        <section className="px-5 sm:px-8 grid grid-cols-1 sm:grid-cols-2 items-center gap-8 max-w-6xl mx-auto py-14">
          <div className="text-center sm:text-start">
            <div className="font-display font-bold text-accent leading-[0.9] text-[clamp(40px,8vw,90px)]">
              {ar ? (
                <>اِلبس<br />للحظة</>
              ) : (
                <>DRESS<br />FOR THE<br />MOMENT</>
              )}
            </div>
          </div>
          <Arch src="/img/lookbook/yellow-wall-duo.jpg" className="aspect-[16/11]" radius="rounded-[4rem] sm:rounded-[6em]" />
        </section>

        {/* ── Full-width stadium + three arches ── */}
        <section className="px-5 sm:px-8 max-w-6xl mx-auto space-y-6 sm:space-y-8">
          <Arch src="/img/lookbook/tunnel-night.jpg" className="aspect-[16/9]" radius="rounded-[4rem] sm:rounded-[6em]" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8">
            <Arch src="/img/lookbook/warehouse-smile.jpg" className="aspect-[3/4]" />
            <Arch src="/img/lookbook/white-kicks.jpg" className="aspect-[3/4]" />
            <Arch src="/img/lookbook/ocean-duo.jpg" className="aspect-[3/4]" />
          </div>
        </section>

        {/* ── Footer copy + CTA ── */}
        <section className="text-center max-w-2xl mx-auto px-6 pt-16 pb-8">
          <h2 className="text-[clamp(20px,4vw,30px)] font-bold mb-4">
            {ar ? 'اكتشف قطع الدنيم من البازار' : 'Discover the Denim Pieces from ALBAZAR'}
          </h2>
          <p className="text-[13px] text-ink/55 leading-relaxed mb-8">
            {ar
              ? 'الدنيم في البازار مو مجرد قماش — هو موقف. قصّات واسعة، غسلات نادرة، وتفاصيل ما تتكرر. كل قطعة محدودة، وكل موسم يروح ما يرجع. هذي افتتاحية صيف ٢٠٢٦.'
              : 'Denim at ALBAZAR is a stance, not a fabric. Boxy cuts, rare washes, details that never repeat. Every piece is limited and every season is gone for good. This is the SS/2026 editorial.'}
          </p>
          <Link
            href="/shop"
            className="inline-block border-2 border-accent text-accent font-bold text-[13px] tracking-[0.18em] uppercase px-8 py-4 rounded-[1em] hover:bg-accent hover:text-bg transition-colors"
          >
            {ar ? 'تسوّق الدروب' : 'Shop the drop'}
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
