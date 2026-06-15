import { Space_Grotesk, Space_Mono, Cairo } from 'next/font/google';

export const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export const spaceMono = Space_Mono({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-space-mono',
  display: 'swap',
});

export const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  // 900 dropped — no font-black in use; trims the Arabic font payload.
  weight: ['400', '700'],
  variable: '--font-cairo',
  display: 'swap',
});
