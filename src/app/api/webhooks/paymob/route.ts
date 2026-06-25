import { NextResponse } from 'next/server';
import { verifyHmac } from '@/lib/paymob';
import { markOrderPaid } from '@/lib/order-fulfill';

// Paymob "transaction processed" callback (server-to-server). Paymob POSTs the
// transaction here and includes an HMAC in the query string. We verify the
// signature, and ONLY on a successful, signed transaction do we fulfil the
// order. Inventory/piece-numbers are assigned here, never at add-to-cart.
export async function POST(req: Request) {
  const url = new URL(req.url);
  const hmac = url.searchParams.get('hmac') ?? '';

  const body = (await req.json().catch(() => null)) as
    | { type?: string; obj?: Record<string, unknown> }
    | null;
  const obj = body?.obj;
  if (!obj) return NextResponse.json({ error: 'bad_payload' }, { status: 400 });

  // 1) Verify the signature — reject anything we can't authenticate.
  if (!verifyHmac(obj, hmac)) {
    console.warn('[paymob] webhook HMAC mismatch — rejected');
    return NextResponse.json({ error: 'bad_signature' }, { status: 401 });
  }

  // 2) Only fulfil successful payments. Acknowledge the rest with 200 so
  //    Paymob doesn't retry (e.g. declined/voided/pending transactions).
  const success = obj.success === true;
  const pending = obj.pending === true;
  const orderObj = (obj.order ?? {}) as Record<string, unknown>;
  const orderId = String(orderObj.merchant_order_id ?? '');
  const txnId = String(obj.id ?? '');

  if (!success || pending) {
    return NextResponse.json({ ok: true, ignored: true });
  }
  if (!orderId) {
    return NextResponse.json({ ok: true, ignored: 'no_reference' });
  }

  // 3) Fulfil (idempotent — a retry on an already-paid order is a no-op).
  const result = await markOrderPaid(orderId, 'card', `paymob_${txnId}`);
  if (!result.ok) {
    console.error('[paymob] fulfilment failed for', orderId, result.error);
    return NextResponse.json({ error: result.error }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
