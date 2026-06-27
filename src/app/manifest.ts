import type { MetadataRoute } from 'next';

// PWA manifest — lets the storefront be added to a phone home screen and gives
// Android/Chrome richer install + theming. Brand tokens: bg #080808.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ALBAZAR — Saudi Streetwear',
    short_name: 'ALBAZAR',
    description: 'Saudi streetwear. Limited drops, no restocks.',
    start_url: '/',
    display: 'standalone',
    background_color: '#080808',
    theme_color: '#080808',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
