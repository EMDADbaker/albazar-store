import { unstable_cache } from 'next/cache';
import { prisma } from './prisma';

export type PaymentMethod = { id: string; label: string; card: boolean };

// The full catalogue of methods the storefront can offer. Which ones are
// actually shown at checkout is controlled by the admin (stored in Setting).
export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: 'mada', label: 'Mada', card: true },
  { id: 'visa', label: 'Visa / Mastercard', card: true },
  { id: 'applepay', label: 'Apple Pay', card: false },
  { id: 'stcpay', label: 'STC Pay', card: false },
  { id: 'tabby', label: 'Tabby — 4 payments', card: false },
  { id: 'tamara', label: 'Tamara — split in 3', card: false },
  { id: 'cash', label: 'Cash on delivery', card: false },
];

export const PAYMENT_DISABLED_KEY = 'payment_disabled';

// Ids of methods the admin has switched off. Cached so checkout doesn't pay a
// DB round-trip every time; admin mutations revalidateTag('payments').
export const getDisabledPaymentIds = unstable_cache(
  async (): Promise<string[]> => {
    try {
      const s = await prisma.setting.findUnique({ where: { key: PAYMENT_DISABLED_KEY } });
      const v = s?.value as { disabled?: string[] } | null;
      return Array.isArray(v?.disabled) ? v!.disabled! : [];
    } catch {
      return [];
    }
  },
  ['payment-disabled'],
  { revalidate: 60, tags: ['payments'] },
);

export async function getActivePaymentMethods(): Promise<PaymentMethod[]> {
  const disabled = await getDisabledPaymentIds();
  return PAYMENT_METHODS.filter((m) => !disabled.includes(m.id));
}
