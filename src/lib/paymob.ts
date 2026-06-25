import crypto from 'crypto';

// Paymob (KSA) Unified Checkout. All secrets come from the environment; nothing
// is hardcoded. Until the keys are set the flow is considered "not live".
const BASE = process.env.PAYMOB_BASE_URL ?? 'https://ksa.paymob.com';
const SECRET = process.env.PAYMOB_SECRET_KEY;
const PUBLIC = process.env.PAYMOB_PUBLIC_KEY;
const HMAC_SECRET = process.env.PAYMOB_HMAC_SECRET;
const INTEGRATION_ID = Number(process.env.PAYMOB_INTEGRATION_ID ?? '0');

export const paymobLive = Boolean(SECRET && PUBLIC && HMAC_SECRET && INTEGRATION_ID);

export type IntentionInput = {
  /** Smallest currency unit (halalas). Matches how we store prices. */
  amount: number;
  orderId: string;
  notificationUrl: string;
  redirectionUrl: string;
  billing: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
    city: string;
    street: string;
  };
  items: { name: string; amount: number; quantity: number }[];
};

// Creates a payment intention and returns the client_secret used to open the
// hosted checkout. Returns null on any failure (caller surfaces an error).
export async function createIntention(
  input: IntentionInput,
): Promise<{ clientSecret: string } | null> {
  if (!paymobLive) return null;
  try {
    const res = await fetch(`${BASE}/v1/intention/`, {
      method: 'POST',
      headers: {
        Authorization: `Token ${SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: input.amount,
        currency: 'SAR',
        payment_methods: [INTEGRATION_ID],
        items: input.items,
        special_reference: input.orderId,
        notification_url: input.notificationUrl,
        redirection_url: input.redirectionUrl,
        billing_data: {
          first_name: input.billing.firstName || 'Customer',
          last_name: input.billing.lastName || '-',
          phone_number: input.billing.phone,
          email: input.billing.email || 'no-reply@albazars.com',
          country: 'SAU',
          city: input.billing.city || 'NA',
          street: input.billing.street || 'NA',
          building: 'NA',
          floor: 'NA',
          apartment: 'NA',
        },
      }),
    });
    if (!res.ok) {
      console.error('[paymob] intention failed', res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { client_secret?: string };
    return data.client_secret ? { clientSecret: data.client_secret } : null;
  } catch (e) {
    console.error('[paymob] intention error', e);
    return null;
  }
}

// Hosted checkout URL the customer is redirected to.
export function checkoutUrl(clientSecret: string): string {
  return `${BASE}/unifiedcheckout/?publicKey=${PUBLIC}&clientSecret=${clientSecret}`;
}

// Verifies a callback's HMAC. Paymob concatenates a FIXED, ordered set of
// fields from the transaction object and signs them with HMAC-SHA512. We
// recompute and compare in constant time.
export function verifyHmac(obj: Record<string, unknown>, received: string): boolean {
  if (!HMAC_SECRET || !received) return false;
  const orderId =
    obj.order && typeof obj.order === 'object'
      ? (obj.order as Record<string, unknown>).id
      : obj.order;
  const src = (obj.source_data ?? {}) as Record<string, unknown>;
  const ordered = [
    obj.amount_cents,
    obj.created_at,
    obj.currency,
    obj.error_occured,
    obj.has_parent_transaction,
    obj.id,
    obj.integration_id,
    obj.is_3d_secure,
    obj.is_auth,
    obj.is_capture,
    obj.is_refunded,
    obj.is_standalone_payment,
    obj.is_voided,
    orderId,
    obj.owner,
    obj.pending,
    src.pan,
    src.sub_type,
    src.type,
    obj.success,
  ]
    .map((v) => String(v))
    .join('');
  const expected = crypto.createHmac('sha512', HMAC_SECRET).update(ordered).digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(expected),
      Buffer.from(received.toLowerCase()),
    );
  } catch {
    return false;
  }
}
