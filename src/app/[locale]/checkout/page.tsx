import { setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { getCurrentUser } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CheckoutView, { type Prefill } from '@/components/CheckoutView';

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);

  // Force registration — only members can check out.
  const sessionUser = await getCurrentUser();
  if (!sessionUser) redirect({ href: '/register?next=/checkout', locale });

  // Prefill the form from the member's saved profile + address.
  const user = await prisma.user.findUnique({
    where: { id: sessionUser!.id },
    select: { name: true, phone: true, email: true, addressJson: true },
  });
  const addr = (user?.addressJson as Record<string, string> | null) ?? {};
  const prefill: Prefill = {
    fullName: user?.name ?? '',
    phone: (user?.phone ?? '').replace(/^\+?966/, ''),
    email: user?.email ?? '',
    city: addr.city ?? '',
    district: addr.district ?? '',
    street: addr.street ?? '',
    building: addr.building ?? '',
    postalCode: addr.postalCode ?? '',
  };

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />
      <CheckoutView prefill={prefill} />
      <Footer />
    </div>
  );
}
