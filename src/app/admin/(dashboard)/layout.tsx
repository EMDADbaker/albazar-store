import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import SignOutButton from '@/components/admin/SignOutButton';
import AdminFlash from '@/components/admin/AdminFlash';
import AdminMobileNav from '@/components/admin/AdminMobileNav';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/customize', label: 'Customize' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/brands', label: 'Brands' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/payments', label: 'Payments' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/vault', label: 'Vault' },
  { href: '/admin/hero', label: 'Hero' },
  { href: '/admin/journal', label: 'Journal' },
];

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Server-side session check on every admin page (Hard rule 10).
  await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col bg-[#0c0c0e] text-white">
      <header className="flex items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-white/12 bg-[#101013]">
        <div className="flex items-center gap-3 md:gap-8">
          <AdminMobileNav items={NAV} />
          <Link href="/admin" className="font-display font-bold text-[14px] sm:text-[15px] tracking-[0.05em]">
            ALBAZAR<span className="text-accent">.</span>
            <span className="hidden sm:inline font-mono text-[9px] text-white/45 ms-2 tracking-label uppercase">
              Admin
            </span>
          </Link>
          <nav className="hidden md:flex gap-5">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="font-mono text-[11px] tracking-wide uppercase text-white/70 hover:text-white transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/"
            className="font-mono text-[10px] tracking-wide uppercase text-white/60 border border-white/20 px-3 py-1.5 hover:bg-white hover:text-black transition-colors"
          >
            View store ↗
          </a>
          <SignOutButton />
        </div>
      </header>

      <main className="flex-1 px-4 sm:px-6 py-6 sm:py-8 max-w-5xl mx-auto w-full">{children}</main>
      <AdminFlash />
    </div>
  );
}
