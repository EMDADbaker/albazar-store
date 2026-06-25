import { Space_Grotesk, Space_Mono, Tajawal } from 'next/font/google';

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

// Tajawal — geometric Arabic face. Reads noticeably heavier and clearer than
// Cairo on the dark background. 500 is the default body weight (see globals);
// 700/800 carry headings and labels.
export const arabicFont = Tajawal({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700', '800'],
  variable: '--font-arabic',
  display: 'swap',
});
