import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { getPublishedPosts } from '@/lib/journal';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import { pageMeta } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  return pageMeta({
    locale,
    path: '/journal',
    title: locale === 'ar' ? 'المجلة' : 'Journal',
    description:
      locale === 'ar'
        ? 'مجلة البازار — قصص البراندات اللي نحملها، ستايل، وثقافة الستريت وير في السعودية.'
        : 'The ALBAZAR Journal — brand spotlights, style, and Saudi streetwear culture.',
  });
}

export default async function JournalPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const ar = locale === 'ar';
  const posts = await getPublishedPosts();

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />

      <section className="px-5 sm:px-8 pt-12 pb-8 max-w-6xl mx-auto w-full">
        <div className="font-mono text-[10px] tracking-[0.35em] text-coal/45 uppercase mb-3">
          {ar ? 'المجلة' : 'Journal'}
        </div>
        <h1 className="text-[clamp(32px,6vw,52px)] font-bold tracking-[-0.02em] leading-none">
          {ar ? 'قصص البراندات' : 'Brand Spotlights'}
        </h1>
        <p className="text-[13px] text-coal/60 max-w-2xl mt-4 leading-relaxed">
          {ar
            ? 'حكايات البراندات اللي نحملها — ليش اخترناها، وكيف تلبسها. كل قصة معها قطعها.'
            : 'The labels we carry — why we picked them, and how to wear them. Every story shops out.'}
        </p>
      </section>

      <section className="flex-1 px-5 sm:px-8 pb-16 max-w-6xl mx-auto w-full">
        {posts.length === 0 ? (
          <p className="text-[14px] text-coal/55 py-16 text-center">
            {ar ? 'قريباً.' : 'Coming soon.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-5 gap-y-10">
            {posts.map((p) => {
              const title = ar ? p.titleAr : p.titleEn;
              const excerpt = ar ? p.excerptAr : p.excerptEn;
              return (
                <Link key={p.slug} href={`/journal/${p.slug}`} className="group block">
                  <div className="relative aspect-[4/3] overflow-hidden bg-coal/5 mb-4">
                    {p.coverImage && (
                      <Image
                        src={p.coverImage}
                        alt={title}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    )}
                  </div>
                  {p.brandNameEn && (
                    <div className="font-mono text-[10px] tracking-label uppercase text-coal/50 mb-1.5">
                      {p.brandNameEn}
                    </div>
                  )}
                  <h2 className="text-[18px] font-bold tracking-[-0.01em] leading-snug group-hover:text-accent transition-colors">
                    {title}
                  </h2>
                  {excerpt && <p className="text-[13px] text-coal/60 mt-2 leading-relaxed line-clamp-2">{excerpt}</p>}
                </Link>
              );
            })}
          </div>
        )}
      </section>

      <Footer />
    </div>
  );
}
