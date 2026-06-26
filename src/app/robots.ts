import type { MetadataRoute } from 'next';

const BASE = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://albazars.com').replace(/\/$/, '');

// Block private/transactional routes (both the ar default and /en variants),
// the API, and admin. Everything else is crawlable.
const PRIVATE = ['account', 'cart', 'checkout', 'login', 'register', 'forgot-password'];

export default function robots(): MetadataRoute.Robots {
  const disallow = [
    '/api/',
    '/admin',
    ...PRIVATE.map((p) => `/${p}`),
    ...PRIVATE.map((p) => `/en/${p}`),
  ];
  return {
    rules: { userAgent: '*', allow: '/', disallow },
    sitemap: `${BASE}/sitemap.xml`,
    host: BASE,
  };
}
