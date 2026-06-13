import { getTranslations, setRequestLocale } from 'next-intl/server';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/money';
import { Link } from '@/i18n/routing';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import Vault from '@/components/Vault';

export const dynamic = 'force-dynamic';

export default async function ConfirmationPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string };
  searchParams: { order?: string };
}) {
  setRequestLocale(locale);
  const t = await getTranslations('Confirmation');

  const orderId = searchParams.order;
  const order = orderId
    ? await prisma.order
        .findUnique({
          where: { id: orderId },
          include: { items: { include: { product: true } } },
        })
        .catch(() => null)
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />

      {!order ? (
        <div className="flex-1 px-6 py-24 text-center">
          <p className="text-[14px] text-coal/50 mb-6">{t('notFound')}</p>
          <Link
            href="/"
            className="font-mono text-[11px] tracking-wide uppercase text-coal border border-coal/30 px-5 py-2.5 inline-block hover:bg-coal hover:text-paper transition-colors"
          >
            {t('continue')}
          </Link>
        </div>
      ) : (
        <div className="flex-1 px-5 sm:px-6 py-16 max-w-xl mx-auto w-full text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-coal text-paper text-[20px] mb-5">
            ✓
          </div>
          <div className="font-mono text-[10px] tracking-[0.4em] text-coal/50 uppercase mb-4">
            {order.status === 'PAID' ? t('paid') : t('eyebrow')}
          </div>
          <h1 className="text-[clamp(32px,7vw,48px)] font-bold tracking-[-0.02em] leading-[1.02] mb-3">
            {t('title')}
          </h1>
          <p className="text-[13px] text-coal/55 mb-2">{t('subtitle')}</p>

          <div className="inline-flex items-center gap-2 font-mono text-[12px] text-coal/70 border border-coal/15 px-4 py-2 mt-4">
            <span className="text-coal/40 uppercase tracking-wide">{t('orderNumber')}</span>
            <span className="text-coal font-medium">AZ{order.id.slice(-6).toUpperCase()}</span>
          </div>

          <div className="mt-10 text-start">
            <div className="font-mono text-[10px] tracking-label uppercase text-coal/45 mb-4">
              {t('items')}
            </div>
            <div className="divide-y divide-coal/12 border-y border-coal/12">
              {order.items.map((it) => {
                const name = locale === 'ar' ? it.product.nameAr : it.product.nameEn;
                return (
                  <div key={it.id} className="flex items-center justify-between gap-3 py-3">
                    <div className="min-w-0">
                      <div className="text-[13px] font-medium truncate">{name}</div>
                      <div className="font-mono text-[10px] text-coal/45 mt-0.5">× {it.quantity}</div>
                    </div>
                    {/* The numbered piece — assigned on payment confirmation */}
                    <div className="font-mono text-[13px] text-coal whitespace-nowrap">
                      {it.pieceNumber
                        ? `${String(it.pieceNumber).padStart(2, '0')} / ${it.product.totalPieces}`
                        : `— / ${it.product.totalPieces}`}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="font-mono text-[9px] text-coal/35 mt-3 leading-relaxed">{t('pieceNote')}</p>

            <div className="flex justify-between font-mono text-[15px] text-coal mt-6 pt-4 border-t border-coal/12">
              <span>{order.status === 'PAID' ? t('total') : t('totalPending')}</span>
              <span>{formatPrice(order.total, locale)}</span>
            </div>
          </div>

          <div className="mt-14 pt-10 border-t border-coal/12">
            <h2 className="text-[18px] font-bold mb-5">{t('vaultTitle')}</h2>
            <Vault source="confirmation" light />
          </div>

          <Link
            href="/"
            className="inline-block mt-12 font-mono text-[11px] tracking-wide uppercase text-coal/50 hover:text-coal transition-colors"
          >
            {t('continue')}
          </Link>
        </div>
      )}

      <Footer />
    </div>
  );
}
