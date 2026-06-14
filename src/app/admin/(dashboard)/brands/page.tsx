import { prisma } from '@/lib/prisma';
import { createBrand, deleteBrand, toggleBrandActive } from '@/app/admin/actions';
import HideToggle from '@/components/admin/HideToggle';
import DeleteButton from '@/components/admin/DeleteButton';
import ImageUpload from '@/components/admin/ImageUpload';

export const dynamic = 'force-dynamic';

const input =
  'w-full bg-white/[0.04] border border-white/15 text-white text-[13px] p-2.5 outline-none focus:border-white/50 transition-colors';

export default async function BrandsAdmin() {
  const brands = await prisma.brand.findMany({
    orderBy: { nameEn: 'asc' },
    include: { _count: { select: { products: true } } },
  });
  const withProducts = brands.filter((b) => b._count.products > 0);

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Brands</h1>
      <p className="font-mono text-[11px] text-white/40 mb-8">
        {brands.length} brands · {withProducts.length} carry products. Hidden
        brands disappear from the store but keep their products.
      </p>

      <details className="mb-10 group">
        <summary className="cursor-pointer list-none font-mono text-[11px] tracking-wide uppercase text-white border border-white/30 px-4 py-2.5 inline-flex items-center gap-2 hover:bg-white/10 transition-colors">
          <span className="group-open:hidden">+ New brand</span>
          <span className="hidden group-open:inline">− Close</span>
        </summary>
        <form action={createBrand} className="border border-white/10 p-5 mt-3 grid sm:grid-cols-2 gap-3">
          <div>
            <Lbl>Name (EN)</Lbl>
            <input name="nameEn" required className={input} />
          </div>
          <div>
            <Lbl>Name (AR, optional)</Lbl>
            <input name="nameAr" dir="rtl" className={input} />
          </div>
          <div className="sm:col-span-2">
            <Lbl>Logo (optional)</Lbl>
            <ImageUpload name="logo" />
          </div>
          <div className="sm:col-span-2">
            <button className="bg-white text-black font-bold text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-white/90 transition-colors">
              Create brand
            </button>
          </div>
        </form>
      </details>

      <div className="space-y-2">
        {brands.map((b) => (
          <div
            key={b.id}
            className={`flex items-center gap-4 border px-3 py-2.5 ${b.active ? 'border-white/10' : 'border-white/10 opacity-50'}`}
          >
            <div className="w-10 h-10 bg-white/5 border border-white/10 shrink-0 flex items-center justify-center overflow-hidden">
              {b.logo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={b.logo} alt="" className="w-full h-full object-contain" />
              ) : (
                <span className="font-mono text-[10px] text-white/30">{b.nameEn[0]}</span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-medium truncate">{b.nameEn}</div>
              <div className="font-mono text-[10px] text-white/40">
                /{b.slug} · {b._count.products} products
              </div>
            </div>
            <HideToggle active={b.active} action={toggleBrandActive.bind(null, b.id)} />
            <DeleteButton action={deleteBrand.bind(null, b.id)} />
          </div>
        ))}
      </div>
    </div>
  );
}

function Lbl({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[9px] uppercase tracking-wide text-white/35 mb-1.5">{children}</div>
  );
}
