import { prisma } from '@/lib/prisma';
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryActive,
} from '@/app/admin/actions';
import HideToggle from '@/components/admin/HideToggle';
import DeleteButton from '@/components/admin/DeleteButton';

export const dynamic = 'force-dynamic';

const input = 'bg-white/[0.04] border border-white/15 text-white text-[13px] p-2.5 outline-none focus:border-white/50';

export default async function CategoriesAdmin() {
  const cats = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: true } } },
  });

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Categories</h1>
      <p className="font-mono text-[11px] text-white/40 mb-8">
        The top-nav categories. Add, rename, hide, or delete (deleting unlinks
        products, never deletes them).
      </p>

      <details className="mb-8 group">
        <summary className="cursor-pointer list-none font-mono text-[11px] tracking-wide uppercase text-white border border-white/30 px-4 py-2.5 inline-flex items-center gap-2 hover:bg-white/10 transition-colors">
          <span className="group-open:hidden">+ New category</span>
          <span className="hidden group-open:inline">− Close</span>
        </summary>
        <form action={createCategory} className="border border-white/10 p-4 mt-3 flex flex-wrap gap-2 items-end">
          <input name="nameEn" placeholder="Name (EN)" required className={`${input} flex-1 min-w-[140px]`} />
          <input name="nameAr" placeholder="الاسم (AR)" dir="rtl" required className={`${input} flex-1 min-w-[140px]`} />
          <button className="bg-white text-black font-bold text-[11px] tracking-[0.18em] uppercase px-5 py-2.5 hover:bg-white/90">Add</button>
        </form>
      </details>

      <div className="space-y-2">
        {cats.map((c) => (
          <details key={c.id} className={`border ${c.active ? 'border-white/10' : 'border-white/10 opacity-50'}`}>
            <summary className="flex items-center justify-between gap-4 px-4 py-3 cursor-pointer list-none">
              <div>
                <div className="text-[14px] font-medium">{c.nameEn}</div>
                <div className="font-mono text-[10px] text-white/40">{c.nameAr} · /{c.slug} · {c._count.products} products</div>
              </div>
              <div className="flex items-center gap-2">
                <HideToggle active={c.active} action={toggleCategoryActive.bind(null, c.id)} />
                <DeleteButton action={deleteCategory.bind(null, c.id)} />
              </div>
            </summary>
            <form action={updateCategory.bind(null, c.id)} className="flex flex-wrap gap-2 items-end px-4 pb-4">
              <input name="nameEn" defaultValue={c.nameEn} className={`${input} flex-1 min-w-[140px]`} />
              <input name="nameAr" defaultValue={c.nameAr} dir="rtl" className={`${input} flex-1 min-w-[140px]`} />
              <button className="font-mono text-[10px] uppercase tracking-wide border border-white/30 px-4 py-2.5 hover:bg-white hover:text-black">Save</button>
            </form>
          </details>
        ))}
      </div>
    </div>
  );
}
