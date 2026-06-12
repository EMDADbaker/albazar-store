'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/admin-auth';
import { normalizeSaudiPhone } from '@/lib/phone';

export async function updateProfile(formData: FormData) {
  const u = await requireUser();
  const name = String(formData.get('name') ?? '').trim();
  const rawPhone = String(formData.get('phone') ?? '').trim();
  const phone = rawPhone ? normalizeSaudiPhone(`+966${rawPhone.replace(/^\+?966/, '')}`) : null;

  const address = {
    city: String(formData.get('city') ?? ''),
    district: String(formData.get('district') ?? ''),
    street: String(formData.get('street') ?? ''),
    building: String(formData.get('building') ?? ''),
    postalCode: String(formData.get('postalCode') ?? ''),
  };
  const hasAddress = Object.values(address).some(Boolean);

  await prisma.user.update({
    where: { id: u.id },
    data: {
      name: name || undefined,
      phone: phone ?? undefined,
      addressJson: hasAddress ? address : undefined,
    },
  });
  revalidatePath('/account');
}

export async function setVault(optIn: boolean) {
  const u = await requireUser();
  await prisma.user.update({ where: { id: u.id }, data: { vaultOptIn: optIn } });
  revalidatePath('/account');
}

export async function addToWishlist(productId: string) {
  const u = await requireUser();
  await prisma.wishlistItem.upsert({
    where: { userId_productId: { userId: u.id!, productId } },
    create: { userId: u.id!, productId },
    update: {},
  });
  revalidatePath('/account');
}

export async function removeFromWishlist(productId: string) {
  const u = await requireUser();
  await prisma.wishlistItem.deleteMany({ where: { userId: u.id!, productId } });
  revalidatePath('/account');
}
