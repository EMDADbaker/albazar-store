import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { spaceGrotesk, spaceMono, arabicFont } from '@/lib/fonts';
import { SITE_URL, SITE_NAME, DEFAULT_OG } from '@/lib/seo';
import { CartProvider } from '@/components/CartProvider';
import CartDrawer from '@/components/CartDrawer';
import AuthSessionProvider from '@/components/AuthSessionProvider';
import '../globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#080808',
};

export async function generateMetadata({
  params: { locale },
}: {
  params: { locale: string };
}): Promise<Metadata> {
  const t = await getTranslations({ locale, namespace: 'Meta' });
  const canonical = locale === 'en' ? `${SITE_URL}/en` : SITE_URL;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('title'), template: `%s | ${SITE_NAME}` },
    description: t('description'),
    applicationName: SITE_NAME,
    appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: 'black-translucent' },
    alternates: {
      canonical,
      languages: { ar: SITE_URL, en: `${SITE_URL}/en`, 'x-default': SITE_URL },
    },
    openGraph: {
      type: 'website',
      siteName: SITE_NAME,
      url: canonical,
      title: t('title'),
      description: t('description'),
      locale: locale === 'ar' ? 'ar_SA' : 'en_US',
      images: [DEFAULT_OG],
    },
    twitter: { card: 'summary_large_image', title: t('title'), description: t('description'), images: [DEFAULT_OG] },
  };
}

export default async function LocaleLayout({
  children,
  params: { locale },
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  if (!routing.locales.includes(locale as never)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  return (
    <html
      lang={locale}
      dir={dir}
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${arabicFont.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
      </head>
      <body className="bg-bg text-ink antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-BTYRN10CND"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){window.dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-BTYRN10CND');
          `}
        </Script>
        <NextIntlClientProvider messages={messages}>
          <AuthSessionProvider>
            <CartProvider>
              <main id="main-content">{children}</main>
              <CartDrawer />
            </CartProvider>
          </AuthSessionProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
