import { Space_Grotesk, Space_Mono, IBM_Plex_Sans_Arabic } from 'next/font/google';

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

// IBM Plex Sans Arabic — high legibility with a large x-height, so Arabic reads
// clearly even at the small label sizes used in the admin dashboard. Heavier
// and crisper than Tajawal/Cairo on the dark background. 500 is the default
// body weight (see globals); 600/700 carry headings and labels.
export const arabicFont = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-arabic',
  display: 'swap',
});
