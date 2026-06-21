import { PAYMENT_METHODS, getDisabledPaymentIds } from '@/lib/payment';
import PaymentMethodsManager from '@/components/admin/PaymentMethodsManager';

export const dynamic = 'force-dynamic';

export default async function PaymentsAdmin() {
  const disabled = await getDisabledPaymentIds();

  return (
    <div className="max-w-2xl">
      <h1 className="text-[22px] font-bold mb-1">Payment methods</h1>
      <p className="font-mono text-[11px] text-white/60 mb-8">
        Turn methods on or off for checkout. Disabled methods are hidden from
        customers and rejected server-side. Changes apply right away.
      </p>

      <PaymentMethodsManager
        methods={PAYMENT_METHODS.map((m) => ({ id: m.id, label: m.label }))}
        initialDisabled={disabled}
      />
    </div>
  );
}
