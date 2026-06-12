import { NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { resolveVariants, type ResolvedVariant } from '@/lib/products';
import { getCurrentUser } from '@/lib/admin-auth';
import { normalizeSaudiPhone } from '@/lib/phone';
import { vatOf } from '@/lib/money';
import { shippingFor } from '@/lib/shipping';

const lineSchema = z.object({
  variantId: z.string(),
  qty: z.number().int().positive().max(10),
});

const addressSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string(),
  email: z.string().email().optional().or(z.literal('')),
  city: z.string().min(1),
  district: z.string().min(1),
  street: z.string().min(1),
  building: z.string().min(1),
  postalCode: z.string().regex(/^\d{5}$/),
});

const schema = z.object({
  address: addressSchema,
  lines: z.array(lineSchema).min(1),
  whatsappOptIn: z.boolean().optional(),
});

const HOLD_MINUTES = 10;

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid', issues: parsed.error.flatten() }, { status: 400 });
  }

  const { address, lines } = parsed.data;
  const phone = normalizeSaudiPhone(address.phone);
  if (!phone) {
    return NextResponse.json({ error: 'invalid_phone' }, { status: 400 });
  }

  // Authoritative pricing — never trust client amounts.
  const resolved = await resolveVariants(lines.map((l) => l.variantId));
  const items: { resolved: ResolvedVariant; qty: number; unitPrice: number }[] = [];
  let subtotal = 0;
  for (const line of lines) {
    const v = resolved.get(line.variantId);
    if (!v) {
      return NextResponse.json({ error: 'unknown_variant', variantId: line.variantId }, { status: 400 });
    }
    if (v.stock < line.qty) {
      return NextResponse.json({ error: 'insufficient_stock', variantId: line.variantId }, { status: 409 });
    }
    subtotal += v.price * line.qty;
    items.push({ resolved: v, qty: line.qty, unitPrice: v.price });
  }

  const shippingCost = shippingFor(subtotal);
  const vatAmount = vatOf(subtotal);
  const total = subtotal + vatAmount + shippingCost;
  const orderNumber = `AZ${Date.now().toString(36).toUpperCase()}`;

  // Try to persist (PENDING). Inventory is soft-held, not decremented — stock
  // only drops and piece numbers only assign on the payment webhook (parked).
  let orderId = orderNumber;
  let persisted = false;
  try {
    const expiresAt = new Date(Date.now() + HOLD_MINUTES * 60_000);
    const sessionUser = await getCurrentUser();
    const order = await prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId: sessionUser?.id ?? null,
          phone,
          email: address.email || null,
          status: 'PENDING',
          subtotal,
          shippingCost,
          vatAmount,
          total,
          paymentStatus: 'INITIATED',
          addressJson: address,
          items: {
            create: items.map((it) => ({
              productId: it.resolved.productId,
              variantId: it.resolved.variantId,
              quantity: it.qty,
              unitPrice: it.unitPrice,
            })),
          },
        },
      });
      await tx.inventoryHold.createMany({
        data: items.map((it) => ({
          variantId: it.resolved.variantId,
          quantity: it.qty,
          expiresAt,
          checkoutSessionId: created.id,
        })),
      });
      return created;
    });
    orderId = order.id;
    persisted = true;
  } catch {
    // DB not connected yet — return an ephemeral order so the flow still works.
  }

  return NextResponse.json({
    ok: true,
    persisted,
    orderId,
    orderNumber,
    summary: {
      subtotal,
      vatAmount,
      shippingCost,
      total,
      phone,
      items: items.map((it) => ({
        productSlug: it.resolved.productSlug,
        nameAr: it.resolved.nameAr,
        nameEn: it.resolved.nameEn,
        size: it.resolved.size,
        qty: it.qty,
        unitPrice: it.unitPrice,
      })),
    },
  });
}
