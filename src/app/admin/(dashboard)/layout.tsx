import Link from 'next/link';
import { requireAdmin } from '@/lib/admin-auth';
import SignOutButton from '@/components/admin/SignOutButton';

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/drops', label: 'Drops' },
  { href: '/admin/products', label: 'Products' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/vault', label: 'Vault' },
  { href: '/admin/members', label: 'Members' },
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
    <div className="min-h-screen flex flex-col">
      <header className="flex items-center justify-between px-6 py-4 border-b border-ink/[0.08]">
        <div className="flex items-center gap-8">
          <Link href="/admin" className="font-display font-bold text-[15px] tracking-[0.05em]">
            ALBAZAR<span className="text-accent">.</span>
            <span className="font-mono text-[9px] text-ink/30 ms-2 tracking-label uppercase">
              Admin
            </span>
          </Link>
          <nav className="hidden sm:flex gap-5">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="font-mono text-[11px] tracking-wide uppercase text-ink/50 hover:text-ink transition-colors"
              >
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
        <SignOutButton />
      </header>

      {/* Mobile nav */}
      <nav className="sm:hidden flex gap-4 px-6 py-3 border-b border-ink/[0.08] overflow-x-auto">
        {NAV.map((n) => (
          <Link
            key={n.href}
            href={n.href}
            className="font-mono text-[11px] tracking-wide uppercase text-ink/50 hover:text-ink whitespace-nowrap"
          >
            {n.label}
          </Link>
        ))}
      </nav>

      <main className="flex-1 px-6 py-8 max-w-5xl mx-auto w-full">{children}</main>
    </div>
  );
}
