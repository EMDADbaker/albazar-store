'use server';

import { revalidatePath } from 'next/cache';
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
  await prisma.drop.create({
    data: {
      nameEn: data.nameEn,
      nameAr: data.nameAr,
      slug: data.slug ? slugify(data.slug) : slugify(data.nameEn),
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

/* -------------------------------- Products -------------------------------- */

const productSchema = z.object({
  dropId: z.string().min(1),
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
    dropId: formData.get('dropId'),
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
      dropId: data.dropId,
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
