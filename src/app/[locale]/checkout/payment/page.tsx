import { setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PaymentView from '@/components/PaymentView';
import { getActivePaymentMethods } from '@/lib/payment';

// Reads the admin-controlled active methods on every visit.
export const dynamic = 'force-dynamic';

export default async function PaymentPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const methods = await getActivePaymentMethods();
  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />
      <PaymentView methods={methods} />
      <Footer />
    </div>
  );
}
