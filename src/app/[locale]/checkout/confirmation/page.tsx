import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import ConfirmationView from '@/components/ConfirmationView';

export default function ConfirmationPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />
      <Suspense fallback={<div className="flex-1" />}>
        <ConfirmationView />
      </Suspense>
      <Footer />
    </div>
  );
}
