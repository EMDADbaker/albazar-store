'use client';

import Link from 'next/link';
import { savePost, deletePost } from '@/app/admin/journal-actions';

type PostData = {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string | null;
  excerptAr: string | null;
  bodyEn: string;
  bodyAr: string;
  coverImage: string | null;
  brandId: string | null;
  published: boolean;
  productIds: string[];
};

const field =
  'w-full bg-ink/[0.04] border border-ink/15 focus:border-accent text-ink text-[13px] p-2.5 outline-none transition-colors';
const label = 'block font-mono text-[10px] tracking-label uppercase text-ink/55 mb-1.5';

export default function PostEditor({
  post,
  brands,
  products,
}: {
  post: PostData | null;
  brands: { id: string; nameEn: string }[];
  products: { id: string; label: string }[];
}) {
  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[20px] font-bold">{post ? 'Edit post' : 'New post'}</h1>
        <Link href="/admin/journal" className="font-mono text-[10px] uppercase tracking-wide text-ink/50 hover:text-accent">
          ← Back
        </Link>
      </div>

      <form action={savePost} className="space-y-5">
        {post && <input type="hidden" name="id" value={post.id} />}

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Title (EN)</label>
            <input name="titleEn" defaultValue={post?.titleEn} required className={field} />
          </div>
          <div dir="rtl">
            <label className={label}>العنوان (AR)</label>
            <input name="titleAr" defaultValue={post?.titleAr} required className={field} />
          </div>
        </div>

        <div>
          <label className={label}>Slug (optional — auto from title)</label>
          <input name="slug" defaultValue={post?.slug} placeholder="brand-spotlight-…" className={field} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Excerpt (EN)</label>
            <input name="excerptEn" defaultValue={post?.excerptEn ?? ''} className={field} />
          </div>
          <div dir="rtl">
            <label className={label}>المقتطف (AR)</label>
            <input name="excerptAr" defaultValue={post?.excerptAr ?? ''} className={field} />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className={label}>Body (EN)</label>
            <textarea name="bodyEn" defaultValue={post?.bodyEn} required rows={10} className={`${field} resize-y leading-relaxed`} />
          </div>
          <div dir="rtl">
            <label className={label}>النص (AR)</label>
            <textarea name="bodyAr" defaultValue={post?.bodyAr} required rows={10} className={`${field} resize-y leading-relaxed`} />
          </div>
        </div>

        <div>
          <label className={label}>Cover image URL</label>
          <input name="coverImage" defaultValue={post?.coverImage ?? ''} placeholder="/img/… or https://…" className={field} />
        </div>

        <div>
          <label className={label}>Brand spotlight</label>
          <select name="brandId" defaultValue={post?.brandId ?? ''} className={field}>
            <option value="">— none —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nameEn}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={label}>Shop the story — featured products (ctrl/cmd-click to multi-select)</label>
          <select name="productIds" multiple defaultValue={post?.productIds ?? []} className={`${field} h-44`}>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <label className="flex items-center gap-2 text-[13px] text-ink/80 cursor-pointer">
          <input type="checkbox" name="published" defaultChecked={post?.published} className="accent-accent" />
          Published (visible on the site + sitemap)
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button type="submit" className="bg-accent text-bg font-bold text-[12px] tracking-[0.15em] uppercase px-6 py-3 hover:bg-accent-bright transition-colors">
            Save post
          </button>
        </div>
      </form>

      {post && (
        <form action={deletePost.bind(null, post.id)} className="mt-8 pt-6 border-t border-ink/10">
          <button type="submit" className="font-mono text-[10px] uppercase tracking-wide text-red-400/80 hover:text-red-400">
            Delete this post
          </button>
        </form>
      )}
    </div>
  );
}
