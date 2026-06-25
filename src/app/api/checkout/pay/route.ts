import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDisabledPaymentIds } from '@/lib/payment';
import { markOrderPaid } from '@/lib/order-fulfill';

const schema = z.object({
  orderId: z.string().min(1),
  method: z.string().min(1),
});

// Confirmation for non-gateway methods (e.g. cash on delivery). Real card
// payments go through Paymob (/api/checkout/paymob -> hosted checkout ->
// /api/webhooks/paymob), which calls the same markOrderPaid helper.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid' }, { status: 400 });
  }
  const { orderId, method } = parsed.data;

  // Reject methods the admin has switched off (don't trust the client).
  if ((await getDisabledPaymentIds()).includes(method)) {
    return NextResponse.json({ error: 'method_disabled' }, { status: 400 });
  }

  const result = await markOrderPaid(orderId, method, `demo_${Date.now().toString(36)}`);
  if (!result.ok) {
    const status = result.error === 'not_found' ? 404 : 500;
    return NextResponse.json({ error: result.error }, { status });
  }
  return NextResponse.json({ ok: true, alreadyPaid: result.alreadyPaid });
}
