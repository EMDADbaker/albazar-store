import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminJournal() {
  const posts = await prisma.post.findMany({
    orderBy: [{ published: 'desc' }, { updatedAt: 'desc' }],
    select: { id: true, titleEn: true, slug: true, published: true, publishedAt: true, brand: { select: { nameEn: true } } },
  });

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold">Journal</h1>
        <Link href="/admin/journal/new" className="bg-accent text-bg font-bold text-[11px] tracking-[0.15em] uppercase px-4 py-2.5 hover:bg-accent-bright transition-colors">
          + New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="text-[13px] text-ink/50 py-10">No posts yet. Create your first brand spotlight.</p>
      ) : (
        <div className="border border-ink/10 divide-y divide-ink/10">
          {posts.map((p) => (
            <Link key={p.id} href={`/admin/journal/${p.id}`} className="flex items-center justify-between gap-4 px-4 py-3 hover:bg-ink/[0.04] transition-colors">
              <div className="min-w-0">
                <div className="text-[13px] font-medium truncate">{p.titleEn}</div>
                <div className="font-mono text-[10px] text-ink/40 truncate">
                  {p.brand?.nameEn ? `${p.brand.nameEn} · ` : ''}/journal/{p.slug}
                </div>
              </div>
              <span className={`shrink-0 font-mono text-[9px] uppercase tracking-wide px-2 py-1 ${p.published ? 'bg-accent/15 text-accent' : 'bg-ink/10 text-ink/50'}`}>
                {p.published ? 'Published' : 'Draft'}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
