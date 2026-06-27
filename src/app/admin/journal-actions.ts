'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/admin-auth';

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

async function uniquePostSlug(base: string, exceptId?: string): Promise<string> {
  const root = slugify(base) || 'post';
  let candidate = root;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (true) {
    const hit = await prisma.post.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!hit || hit.id === exceptId) return candidate;
    candidate = `${root}-${n++}`;
  }
}

function bump(paths: string[]) {
  paths.forEach((p) => revalidatePath(p));
  revalidateTag('journal');
}

export async function savePost(formData: FormData) {
  await assertAdmin();
  const id = String(formData.get('id') || '');
  const titleEn = String(formData.get('titleEn') || '').trim();
  const titleAr = String(formData.get('titleAr') || '').trim();
  const bodyEn = String(formData.get('bodyEn') || '').trim();
  const bodyAr = String(formData.get('bodyAr') || '').trim();
  if (!titleEn || !titleAr || !bodyEn || !bodyAr) {
    throw new Error('Title and body are required in both languages.');
  }
  const published = formData.get('published') === 'on';
  const brandId = String(formData.get('brandId') || '') || null;
  const coverImage = String(formData.get('coverImage') || '').trim() || null;
  const excerptEn = String(formData.get('excerptEn') || '').trim() || null;
  const excerptAr = String(formData.get('excerptAr') || '').trim() || null;
  const productIds = formData.getAll('productIds').map(String).filter(Boolean);
  const slugInput = String(formData.get('slug') || '') || titleEn;

  const existing = id
    ? await prisma.post.findUnique({ where: { id }, select: { publishedAt: true } })
    : null;
  // Stamp publishedAt the first time it goes live; clear it when unpublished.
  const publishedAt = published ? existing?.publishedAt ?? new Date() : null;

  const base = {
    titleEn, titleAr, excerptEn, excerptAr, bodyEn, bodyAr, coverImage,
    brandId, published, publishedAt,
  };
  const connect = productIds.map((pid) => ({ id: pid }));

  if (id) {
    await prisma.post.update({ where: { id }, data: { ...base, products: { set: connect } } });
  } else {
    const slug = await uniquePostSlug(slugInput);
    await prisma.post.create({ data: { ...base, slug, products: { connect } } });
  }

  bump(['/admin/journal', '/journal', '/']);
  redirect('/admin/journal');
}

export async function deletePost(id: string) {
  await assertAdmin();
  await prisma.post.delete({ where: { id } });
  bump(['/admin/journal', '/journal']);
}
