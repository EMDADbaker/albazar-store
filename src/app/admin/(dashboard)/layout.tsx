import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import SignOutButton from '@/components/admin/SignOutButton';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/brands', label: 'Brands' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/members', label: 'Members' },
  { href: '/admin/vault', label: 'Vault' },
  { href: '/admin/hero', label: 'Hero' },
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
      <header className="flex items-center justify-between px-6 py-4 border-b border-white/12 bg-[#101013]">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-display font-bold text-[15px] tracking-[0.05em]">
            ALBAZAR<span className="text-accent">.</span>
            <span className="font-mono text-[9px] text-white/45 ms-2 tracking-label uppercase">
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

      {/* Mobile nav */}
      <nav className="md:hidden flex gap-4 px-6 py-3 border-b border-white/12 overflow-x-auto bg-[#101013]">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="font-mono text-[11px] tracking-wide uppercase text-white/70 hover:text-white whitespace-nowrap"
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
