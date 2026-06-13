import { setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import PaymentView from '@/components/PaymentView';

export default function PaymentPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />
      <PaymentView />
      <Footer />
    </div>
  );
}
