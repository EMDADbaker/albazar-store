'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/admin-auth';
import type { DropStatus, OrderStatus } from '@prisma/client';

function slugify(s: string) {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Ensure the slug is unique — append -2, -3… if the base is taken, so creating
// a drop never crashes on the unique constraint.
async function uniqueDropSlug(base: string): Promise<string> {
  const root = slugify(base) || 'drop';
  let candidate = root;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.drop.findUnique({ where: { slug: candidate } })) {
    candidate = `${root}-${n++}`;
  }
  return candidate;
}

/* ---------------------------------- Drops --------------------------------- */

const dropSchema = z.object({
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  slug: z.string().min(1).optional(),
  launchAt: z.string().min(1),
  status: z.enum(['TEASER', 'LIVE', 'SOLDOUT', 'ARCHIVED']),
});

export async function createDrop(formData: FormData) {
  await assertAdmin();
  const data = dropSchema.parse({
    nameEn: formData.get('nameEn'),
    nameAr: formData.get('nameAr'),
    slug: formData.get('slug') || undefined,
    launchAt: formData.get('launchAt'),
    status: formData.get('status'),
  });
  const slug = await uniqueDropSlug(data.slug || data.nameEn);
  await prisma.drop.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      slug,
      launchAt: new Date(data.launchAt),
      status: data.status as DropStatus,
    },
  });
  revalidatePath('/admin/drops');
  revalidatePath('/', 'layout');
}

export async function setDropStatus(id: string, status: DropStatus) {
  await assertAdmin();
  await prisma.drop.update({ where: { id }, data: { status } });
  // Homepage state lives in the DB and flips without a deploy (Hard rule 1).
  revalidatePath('/admin/drops');
  revalidatePath('/', 'layout');
}

export async function setDropLaunch(id: string, launchAt: string) {
  await assertAdmin();
  await prisma.drop.update({ where: { id }, data: { launchAt: new Date(launchAt) } });
  revalidatePath('/admin/drops');
  revalidatePath('/', 'layout');
}

export async function setDropPublished(id: string, published: boolean) {
  await assertAdmin();
  await prisma.drop.update({ where: { id }, data: { published } });
  revalidatePath('/admin/drops');
  revalidatePath('/', 'layout');
}

export async function updateDrop(id: string, formData: FormData) {
  await assertAdmin();
  const data = dropSchema.parse({
    nameEn: formData.get('nameEn'),
    nameAr: formData.get('nameAr'),
    slug: formData.get('slug') || undefined,
    launchAt: formData.get('launchAt'),
    status: formData.get('status'),
  });
  await prisma.drop.update({
    where: { id },
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      slug: data.slug ? slugify(data.slug) : undefined,
      launchAt: new Date(data.launchAt),
      status: data.status as DropStatus,
      published: formData.get('published') === 'on',
    },
  });
  revalidatePath('/admin/drops');
  revalidatePath('/', 'layout');
  redirect('/admin/drops');
}

export async function deleteDrop(id: string) {
  await assertAdmin();
  await prisma.drop.delete({ where: { id } }); // cascades to products + variants
  revalidatePath('/admin/drops');
  revalidatePath('/', 'layout');
}

/* -------------------------------- Products -------------------------------- */

const productSchema = z.object({
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  storyEn: z.string().optional(),
  storyAr: z.string().optional(),
  sku: z.string().min(1),
  priceSar: z.coerce.number().positive(), // entered in SAR excl VAT
  totalPieces: z.coerce.number().int().positive(),
  images: z.string().optional(), // comma/newline separated paths
  sizes: z.string().optional(), // e.g. "S:30,M:45,L:50"
});

export async function createProduct(formData: FormData) {
  await assertAdmin();
  const data = productSchema.parse({
    brandId: formData.get('brandId') || undefined,
    categoryId: formData.get('categoryId') || undefined,
    nameEn: formData.get('nameEn'),
    nameAr: formData.get('nameAr'),
    storyEn: formData.get('storyEn') || undefined,
    storyAr: formData.get('storyAr') || undefined,
    sku: formData.get('sku'),
    priceSar: formData.get('priceSar'),
    totalPieces: formData.get('totalPieces'),
    images: formData.get('images') || undefined,
    sizes: formData.get('sizes') || undefined,
  });

  const images = (data.images ?? '')
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  const variants = (data.sizes ?? '')
    .split(',')
    .map((pair) => pair.trim())
    .filter(Boolean)
    .map((pair) => {
      const [size, stock] = pair.split(':');
      return { size: size.trim(), stock: parseInt(stock?.trim() ?? '0', 10) || 0 };
    });

  await prisma.product.create({
    data: {
      brandId: data.brandId || null,
      categoryId: data.categoryId || null,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      storyEn: data.storyEn,
      storyAr: data.storyAr,
      sku: data.sku,
      price: Math.round(data.priceSar * 100), // halalas, excl VAT
      totalPieces: data.totalPieces,
      images,
      variants: variants.length ? { create: variants } : undefined,
    },
  });
  revalidatePath('/admin/products');
  revalidatePath('/', 'layout');
  redirect('/admin/products?created=Product');
}

const productEditSchema = z.object({
  brandId: z.string().optional(),
  categoryId: z.string().optional(),
  nameEn: z.string().min(1),
  nameAr: z.string().min(1),
  storyEn: z.string().optional(),
  storyAr: z.string().optional(),
  sku: z.string().min(1),
  priceSar: z.coerce.number().positive(),
  totalPieces: z.coerce.number().int().positive(),
  images: z.string().optional(),
});

export async function updateProduct(id: string, formData: FormData) {
  await assertAdmin();
  const data = productEditSchema.parse({
    brandId: formData.get('brandId') || undefined,
    categoryId: formData.get('categoryId') || undefined,
    nameEn: formData.get('nameEn'),
    nameAr: formData.get('nameAr'),
    storyEn: formData.get('storyEn') || undefined,
    storyAr: formData.get('storyAr') || undefined,
    sku: formData.get('sku'),
    priceSar: formData.get('priceSar'),
    totalPieces: formData.get('totalPieces'),
    images: formData.get('images') || undefined,
  });
  const images = (data.images ?? '')
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);

  await prisma.product.update({
    where: { id },
    data: {
      brandId: data.brandId || null,
      categoryId: data.categoryId || null,
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      storyEn: data.storyEn,
      storyAr: data.storyAr,
      sku: data.sku,
      price: Math.round(data.priceSar * 100),
      totalPieces: data.totalPieces,
      images,
      isActive: formData.get('isActive') === 'on',
    },
  });
  revalidatePath('/admin/products');
  revalidatePath('/', 'layout');
  redirect('/admin/products');
}

export async function setVariantStock(variantId: string, stock: number) {
  await assertAdmin();
  await prisma.productVariant.update({
    where: { id: variantId },
    data: { stock: Math.max(0, stock) },
  });
  revalidatePath('/admin/products');
}

export async function toggleProductActive(id: string, isActive: boolean) {
  await assertAdmin();
  await prisma.product.update({ where: { id }, data: { isActive } });
  revalidatePath('/admin/products');
}

export async function deleteProduct(id: string) {
  await assertAdmin();
  await prisma.product.delete({ where: { id } });
  revalidatePath('/admin/products');
}

/* --------------------------------- Orders --------------------------------- */

export async function setOrderStatus(id: string, status: OrderStatus) {
  await assertAdmin();
  await prisma.order.update({ where: { id }, data: { status } });
  revalidatePath('/admin/orders');
}

/* ------------------------------- Hero slides ------------------------------ */

const heroSchema = z.object({
  image: z.string().min(1),
  titleEn: z.string().min(1),
  titleAr: z.string().min(1),
  subtitleEn: z.string().optional(),
  subtitleAr: z.string().optional(),
  sortOrder: z.coerce.number().int().default(0),
});

export async function createHeroSlide(formData: FormData) {
  await assertAdmin();
  const data = heroSchema.parse({
    image: formData.get('image'),
    titleEn: formData.get('titleEn'),
    titleAr: formData.get('titleAr'),
    subtitleEn: formData.get('subtitleEn') || undefined,
    subtitleAr: formData.get('subtitleAr') || undefined,
    sortOrder: formData.get('sortOrder') || 0,
  });
  await prisma.heroSlide.create({ data });
  revalidatePath('/admin/hero');
  revalidatePath('/', 'layout');
  redirect('/admin/hero?created=Slide');
}

export async function toggleHeroSlide(id: string, active: boolean) {
  await assertAdmin();
  await prisma.heroSlide.update({ where: { id }, data: { active } });
  revalidatePath('/admin/hero');
  revalidatePath('/', 'layout');
}

export async function deleteHeroSlide(id: string) {
  await assertAdmin();
  await prisma.heroSlide.delete({ where: { id } });
  revalidatePath('/admin/hero');
  revalidatePath('/', 'layout');
}

/* --------------------------------- Brands --------------------------------- */

function slugifyBrand(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-');
}

export async function createBrand(formData: FormData) {
  await assertAdmin();
  const nameEn = String(formData.get('nameEn') ?? '').trim();
  if (!nameEn) return;
  const nameAr = String(formData.get('nameAr') ?? '').trim() || null;
  const logo = String(formData.get('logo') ?? '').trim() || null;
  let base = slugifyBrand(nameEn) || 'brand';
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.brand.findUnique({ where: { slug } })) slug = `${base}-${n++}`;
  await prisma.brand.create({ data: { nameEn, nameAr, logo, slug } });
  revalidatePath('/admin/brands');
  revalidatePath('/', 'layout');
  redirect('/admin/brands?created=Brand');
}

export async function updateBrand(id: string, formData: FormData) {
  await assertAdmin();
  await prisma.brand.update({
    where: { id },
    data: {
      nameEn: String(formData.get('nameEn') ?? '').trim(),
      nameAr: String(formData.get('nameAr') ?? '').trim() || null,
      logo: String(formData.get('logo') ?? '').trim() || null,
    },
  });
  revalidatePath('/admin/brands');
  revalidatePath('/', 'layout');
}

export async function toggleBrandActive(id: string, active: boolean) {
  await assertAdmin();
  await prisma.brand.update({ where: { id }, data: { active } });
  revalidatePath('/admin/brands');
  revalidatePath('/', 'layout');
}

export async function deleteBrand(id: string) {
  await assertAdmin();
  // Unlink products first (don't delete the products).
  await prisma.product.updateMany({ where: { brandId: id }, data: { brandId: null } });
  await prisma.brand.delete({ where: { id } });
  revalidatePath('/admin/brands');
  revalidatePath('/', 'layout');
}

/* ------------------------------- Categories ------------------------------- */

export async function toggleCategoryActive(id: string, active: boolean) {
  await assertAdmin();
  await prisma.category.update({ where: { id }, data: { active } });
  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
}

export async function createCategory(formData: FormData) {
  await assertAdmin();
  const nameEn = String(formData.get('nameEn') ?? '').trim();
  const nameAr = String(formData.get('nameAr') ?? '').trim();
  if (!nameEn || !nameAr) return;
  let base = slugify(nameEn) || 'category';
  let slug = base;
  let n = 2;
  // eslint-disable-next-line no-await-in-loop
  while (await prisma.category.findUnique({ where: { slug } })) slug = `${base}-${n++}`;
  const count = await prisma.category.count();
  await prisma.category.create({ data: { nameEn, nameAr, slug, sortOrder: count } });
  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
  redirect('/admin/categories?created=Category');
}

export async function updateCategory(id: string, formData: FormData) {
  await assertAdmin();
  await prisma.category.update({
    where: { id },
    data: {
      nameEn: String(formData.get('nameEn') ?? '').trim(),
      nameAr: String(formData.get('nameAr') ?? '').trim(),
    },
  });
  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
}

export async function deleteCategory(id: string) {
  await assertAdmin();
  // Unlink products, don't delete them.
  await prisma.product.updateMany({ where: { categoryId: id }, data: { categoryId: null } });
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
  revalidatePath('/', 'layout');
}
