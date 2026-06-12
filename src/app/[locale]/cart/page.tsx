import { setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CartView from '@/components/CartView';

export default function CartPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />
      <CartView />
      <Footer />
    </div>
  );
}
