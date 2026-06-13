import { Link } from '@/i18n/routing';

type Crumb = { label: string; href?: string };

// Light-theme breadcrumbs for catalog pages.
export default function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Breadcrumb" className="font-mono text-[10px] tracking-wide uppercase text-coal/40 flex flex-wrap items-center gap-1.5">
      <Link href="/" className="hover:text-coal transition-colors">
        Home
      </Link>
      {items.map((c, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span className="text-coal/25">/</span>
          {c.href ? (
            <Link href={c.href} className="hover:text-coal transition-colors">
              {c.label}
            </Link>
          ) : (
            <span className="text-coal/70">{c.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
