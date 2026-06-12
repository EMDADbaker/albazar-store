import { setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CheckoutView from '@/components/CheckoutView';

export default function CheckoutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <CheckoutView />
      <Footer />
    </div>
  );
}
