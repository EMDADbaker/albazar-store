import type { Metadata } from 'next';
import { spaceGrotesk, spaceMono, arabicFont } from '@/lib/fonts';
import '../globals.css';

export const metadata: Metadata = {
  title: 'ALBAZAR — Admin',
  robots: { index: false, follow: false },
};

// Admin is its own root layout (English-only control room, no i18n).
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      dir="ltr"
      className={`${spaceGrotesk.variable} ${spaceMono.variable} ${arabicFont.variable}`}
    >
      <body className="bg-bg text-ink antialiased">{children}</body>
    </html>
  );
}
