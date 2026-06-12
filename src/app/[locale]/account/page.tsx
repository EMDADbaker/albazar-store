import { getTranslations, setRequestLocale } from 'next-intl/server';
import { requireUser } from '@/lib/admin-auth';
import { prisma } from '@/lib/prisma';
import { formatPrice, inclVat } from '@/lib/money';
import { Link } from '@/i18n/routing';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import LogoutButton from '@/components/account/LogoutButton';
import VaultToggle from '@/components/account/VaultToggle';
import WishlistRemove from '@/components/account/WishlistRemove';
import { updateProfile } from '@/app/account/actions';

export const dynamic = 'force-dynamic';

export default async function AccountPage({
  params: { locale },
}: {
  params: { locale: string };
}) {
  setRequestLocale(locale);
  const sessionUser = await requireUser();
  const t = await getTranslations('Account');

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      orders: { orderBy: { createdAt: 'desc' }, include: { items: true } },
      wishlist: { include: { product: true }, orderBy: { createdAt: 'desc' } },
    },
  });
  if (!user) return null;

  const addr = (user.addressJson as Record<string, string> | null) ?? {};
  const phoneLocal = (user.phone ?? '').replace(/^\+?966/, '');

  return (
    <div className="min-h-screen flex flex-col bg-paper text-coal">
      <Nav />

      <div className="flex-1 max-w-3xl mx-auto w-full px-5 sm:px-6 py-12">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-[26px] font-bold">{t('title')}</h1>
            <p className="font-mono text-[11px] text-coal/50 mt-1">
              {t('greeting', { name: user.name ?? user.email })}
            </p>
          </div>
          <LogoutButton />
        </div>

        {/* Orders */}
        <Section title={t('tabsOrders')}>
          {user.orders.length === 0 ? (
            <div className="text-[13px] text-coal/50">
              {t('noOrders')}{' '}
              <Link href="/" className="text-coal underline">
                {t('shopNow')}
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-coal/12 border-y border-coal/12">
              {user.orders.map((o) => (
                <div key={o.id} className="flex items-center justify-between gap-3 py-3">
                  <div>
                    <div className="font-mono text-[12px] text-coal">
                      AZ{o.id.slice(-6).toUpperCase()}
                    </div>
                    <div className="font-mono text-[10px] text-coal/45 mt-0.5">
                      {new Date(o.createdAt).toLocaleDateString('en-GB')} ·{' '}
                      {t('orderItems', { count: o.items.length })}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="font-mono text-[10px] uppercase tracking-wide text-coal/60">
                      {o.status}
                    </div>
                    <div className="font-mono text-[12px]">
                      {formatPrice(o.total, locale)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Section>

        {/* Profile + address */}
        <Section title={t('tabsProfile')}>
          <form action={updateProfile} className="grid sm:grid-cols-2 gap-3">
            <Field name="name" label={t('profileName')} defaultValue={user.name ?? ''} />
            <div>
              <Lbl>{t('profilePhone')}</Lbl>
              <div className="flex gap-2">
                <div className="font-mono text-[13px] text-coal/50 border border-coal/15 flex items-center px-3 bg-paper-2">
                  +966
                </div>
                <input
                  dir="ltr"
                  name="phone"
                  defaultValue={phoneLocal}
                  maxLength={9}
                  className="flex-1 bg-paper-2 border border-coal/15 focus:border-coal text-coal font-mono text-[13px] p-2.5 outline-none"
                />
              </div>
            </div>
            <div className="sm:col-span-2 font-mono text-[10px] uppercase tracking-wide text-coal/40 mt-2">
              {t('address')}
            </div>
            <Field name="city" label={t('city')} defaultValue={addr.city ?? ''} />
            <Field name="district" label={t('district')} defaultValue={addr.district ?? ''} />
            <Field name="street" label={t('street')} defaultValue={addr.street ?? ''} />
            <div className="grid grid-cols-2 gap-3">
              <Field name="building" label={t('building')} defaultValue={addr.building ?? ''} />
              <Field name="postalCode" label={t('postal')} defaultValue={addr.postalCode ?? ''} />
            </div>
            <div className="sm:col-span-2">
              <button className="bg-coal text-paper font-bold text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:opacity-90 transition-opacity">
                {t('saveProfile')}
              </button>
            </div>
          </form>
        </Section>

        {/* Vault */}
        <Section title={t('tabsVault')}>
          <VaultToggle optIn={user.vaultOptIn} />
        </Section>

        {/* Wishlist */}
        <Section title={t('tabsWishlist')}>
          {user.wishlist.length === 0 ? (
            <div className="text-[13px] text-coal/50">{t('wishlistEmpty')}</div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-6">
              {user.wishlist.map((w) => {
                const name = locale === 'ar' ? w.product.nameAr : w.product.nameEn;
                return (
                  <div key={w.id}>
                    <Link href={`/product/${w.product.sku}`} className="group block">
                      <div className="aspect-[4/5] bg-paper-2 overflow-hidden mb-2">
                        {w.product.images[0] && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={w.product.images[0]}
                            alt={name}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        )}
                      </div>
                      <div className="text-[12px] font-medium">{name}</div>
                      <div className="font-mono text-[11px] text-coal/60">
                        {formatPrice(inclVat(w.product.price), locale)}
                      </div>
                    </Link>
                    <WishlistRemove productId={w.productId} />
                  </div>
                );
              })}
            </div>
          )}
        </Section>
      </div>

      <Footer />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-10">
      <div className="font-mono text-[11px] tracking-label uppercase text-coal/50 mb-4 flex items-center gap-2.5 before:content-[''] before:w-[22px] before:h-[0.5px] before:bg-coal/40">
        {title}
      </div>
      {children}
    </section>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[9px] uppercase tracking-wide text-coal/40 mb-1.5">
      {children}
    </div>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue: string }) {
  return (
    <div>
      <Lbl>{label}</Lbl>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full bg-paper-2 border border-coal/15 focus:border-coal text-coal text-[13px] p-2.5 outline-none transition-colors"
      />
    </div>
  );
}
