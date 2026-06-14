import Link from 'next/link';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// Unified control center — one place to reach every manager for big edits.
// Quick actions (hide/delete/stock) still live inline on each list page.
export default async function CustomizeHub() {
  const [products, brands, categories, hero, hidden] = await Promise.all([
    prisma.product.count(),
    prisma.brand.count(),
    prisma.category.count(),
    prisma.heroSlide.count(),
    prisma.product.count({ where: { isActive: false } }),
  ]);

  const cards = [
    { href: '/admin/products', title: 'Products', desc: 'Add, edit, price, stock, images, hide.', meta: `${products} total · ${hidden} hidden` },
    { href: '/admin/brands', title: 'Brands', desc: 'Add, logo, rename, hide, delete.', meta: `${brands} brands` },
    { href: '/admin/categories', title: 'Categories', desc: 'Add, rename, hide, delete.', meta: `${categories} categories` },
    { href: '/admin/hero', title: 'Hero slides', desc: 'Cover carousel — image + copy, order, hide.', meta: `${hero} slides` },
    { href: '/admin/orders', title: 'Orders', desc: 'Status flow, items, piece numbers, address.', meta: '' },
    { href: '/admin/members', title: 'Members', desc: 'Clients, carts, wishlists, full history.', meta: '' },
  ];

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Customize</h1>
      <p className="font-mono text-[11px] text-white/40 mb-8">
        The full control center. Each section also has quick inline controls on
        its own page.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {cards.map((c) => (
          <Link key={c.href} href={c.href} className="border border-white/12 p-5 hover:border-white/35 hover:bg-white/[0.03] transition-colors">
            <div className="text-[15px] font-bold mb-1">{c.title}</div>
            <div className="text-[12px] text-white/55 leading-relaxed mb-3">{c.desc}</div>
            {c.meta && <div className="font-mono text-[10px] text-white/35">{c.meta}</div>}
          </Link>
        ))}
      </div>
    </div>
  );
}
