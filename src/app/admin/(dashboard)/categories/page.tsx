import { prisma } from '@/lib/prisma';
import { toggleCategoryActive } from '@/app/admin/actions';
import HideToggle from '@/components/admin/HideToggle';

export const dynamic = 'force-dynamic';

export default async function CategoriesAdmin() {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Categories</h1>
      <p className="font-mono text-[11px] text-white/40 mb-8">
        The top-nav categories. Hide one to remove it from the store nav and
        homepage without deleting its products.
      </p>

      <div className="space-y-2">
        {cats.map((c) => (
          <div
            key={c.id}
            className={`flex items-center justify-between gap-4 border px-4 py-3 ${c.active ? 'border-white/10' : 'border-white/10 opacity-50'}`}
          >
            <div>
              <div className="text-[14px] font-medium">{c.nameEn}</div>
              <div className="font-mono text-[10px] text-white/40">
                {c.nameAr} · /{c.slug} · {c._count.products} products
              </div>
            </div>
            <HideToggle active={c.active} action={toggleCategoryActive.bind(null, c.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}
