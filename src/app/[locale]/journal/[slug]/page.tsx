import Image from 'next/image';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { getPostBySlug } from '@/lib/journal';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ShopProductCard from '@/components/ShopProductCard';
import JsonLd from '@/components/JsonLd';
import { articleSchema, breadcrumbSchema } from '@/lib/jsonld';
import { pageMeta, clamp } from '@/lib/seo';
import type { Metadata } from 'next';

export const revalidate = 60;

export async function generateMetadata({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}): Promise<Metadata> {
  const post = await getPostBySlug(slug);
  if (!post) return {};
  const title = locale === 'ar' ? post.titleAr : post.titleEn;
  const excerpt = locale === 'ar' ? post.excerptAr : post.excerptEn;
  const body = locale === 'ar' ? post.bodyAr : post.bodyEn;
  return pageMeta({
    locale,
    path: `/journal/${post.slug}`,
    title,
    description: clamp(excerpt || body),
    images: post.coverImage ? [post.coverImage] : undefined,
  });
}

export default async function JournalPostPage({
  params: { locale, slug },
}: {
  params: { locale: string; slug: string };
}) {
  setRequestLocale(locale);
  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const ar = locale === 'ar';
  const title = ar ? post.titleAr : post.titleEn;
  const body = ar ? post.bodyAr : post.bodyEn;
  const excerpt = ar ? post.excerptAr : post.excerptEn;
  const paras = body.split(/\n{2,}|\n/).map((s) => s.trim()).filter(Boolean);
  // unstable_cache serialises Dates to strings — coerce before formatting.
  const publishedAt = post.publishedAt ? new Date(post.publishedAt) : null;
  const modifiedAt = new Date(post.updatedAt);
  const dateFmt = publishedAt
    ? new Intl.DateTimeFormat(ar ? 'ar-SA' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' }).format(publishedAt)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <JsonLd
        data={[
          articleSchema({
            locale,
            slug: post.slug,
            headline: title,
            description: clamp(excerpt || body),
            image: post.coverImage,
            published: publishedAt,
            modified: modifiedAt,
          }),
          breadcrumbSchema(locale, [
            { name: 'ALBAZAR', path: '/' },
            { name: ar ? 'المجلة' : 'Journal', path: '/journal' },
            { name: title, path: `/journal/${post.slug}` },
          ]),
        ]}
      />
      <Nav />

      <article className="flex-1 w-full">
        <header className="px-5 sm:px-8 pt-12 pb-6 max-w-3xl mx-auto w-full text-center">
          {post.brandNameEn && (
            <Link
              href={post.brandSlug ? `/brand/${post.brandSlug}` : '/brands'}
              className="font-mono text-[10px] tracking-[0.3em] uppercase text-accent hover:text-coal transition-colors"
            >
              {post.brandNameEn}
            </Link>
          )}
          <h1 className="text-[clamp(28px,6vw,46px)] font-bold tracking-[-0.02em] leading-[1.05] mt-3">
            {title}
          </h1>
          {dateFmt && <div className="font-mono text-[10px] text-coal/45 mt-4">{dateFmt}</div>}
        </header>

        {post.coverImage && (
          <div className="relative aspect-[16/9] w-full max-w-4xl mx-auto overflow-hidden bg-coal/5 my-4">
            <Image src={post.coverImage} alt={title} fill sizes="(max-width: 1024px) 100vw, 1024px" priority className="object-cover" />
          </div>
        )}

        <div className="px-5 sm:px-8 py-8 max-w-2xl mx-auto w-full">
          {excerpt && <p className="text-[16px] text-coal/80 leading-relaxed mb-6 font-medium">{excerpt}</p>}
          {paras.map((p, i) => (
            <p key={i} className="text-[15px] text-coal/75 leading-[1.8] mb-5">
              {p}
            </p>
          ))}
        </div>

        {/* Shop the story */}
        {post.products.length > 0 && (
          <section className="bg-paper-2 text-coal mt-6">
            <div className="px-5 sm:px-8 py-14 max-w-6xl mx-auto w-full">
              <div className="font-mono text-[11px] tracking-label uppercase text-coal/50 mb-7 flex items-center gap-2.5 before:content-[''] before:w-[22px] before:h-[0.5px] before:bg-coal/40">
                {ar ? 'تسوّق القصة' : 'Shop the story'}
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-9">
                {post.products.map((p) => (
                  <ShopProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </section>
        )}
      </article>

      <Footer />
    </div>
  );
}
