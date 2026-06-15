import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, inclVat } from '@/lib/money';
import { createProduct, deleteProduct, toggleProductActive } from '@/app/admin/actions';
import HideToggle from '@/components/admin/HideToggle';
import VariantStockControl from '@/components/admin/VariantStockControl';
import DeleteButton from '@/components/admin/DeleteButton';
import ImageUpload from '@/components/admin/ImageUpload';

export const dynamic = 'force-dynamic';

export default async function ProductsAdmin({
  searchParams,
}: {
  searchParams: { brand?: string; cat?: string; vis?: string; q?: string };
}) {
  const { brand, cat, vis, q } = searchParams;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};
  if (brand) where.brandId = brand;
  if (cat) where.categoryId = cat;
  if (vis === 'hidden') where.isActive = false;
  if (vis === 'visible') where.isActive = true;
  if (q) where.OR = [{ nameEn: { contains: q, mode: 'insensitive' } }, { sku: { contains: q, mode: 'insensitive' } }];

  const [brands, categories, products] = await Promise.all([
    prisma.brand.findMany({ orderBy: { nameEn: 'asc' } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { variants: { orderBy: { size: 'asc' } }, brand: true, category: true },
    }),
  ]);

  const sel = 'bg-white/[0.06] border border-white/20 text-white text-[11px] p-2 outline-none focus:border-white/50';

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Products</h1>
      <p className="font-mono text-[11px] text-white/60 mb-6">
        {products.length} shown · prices excl. VAT, displayed incl. 15%.
      </p>

      {/* Filters */}
      <form className="flex flex-wrap gap-2 mb-8" action="/admin/products">
        <input name="q" defaultValue={q ?? ''} placeholder="Search name / SKU" className={`${sel} flex-1 min-w-[160px]`} />
        <select name="brand" defaultValue={brand ?? ''} className={sel}>
          <option value="">All brands</option>
          {brands.map((b) => <option key={b.id} value={b.id} className="bg-bg">{b.nameEn}</option>)}
        </select>
        <select name="cat" defaultValue={cat ?? ''} className={sel}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id} className="bg-bg">{c.nameEn}</option>)}
        </select>
        <select name="vis" defaultValue={vis ?? ''} className={sel}>
          <option value="">Visible + hidden</option>
          <option value="visible" className="bg-bg">Visible only</option>
          <option value="hidden" className="bg-bg">Hidden only</option>
        </select>
        <button className="font-mono text-[10px] uppercase tracking-wide bg-accent text-bg px-4 py-2.5 hover:bg-accent-bright">Filter</button>
      </form>

      {/* Create */}
      <details className="mb-10 group">
        <summary className="cursor-pointer list-none font-mono text-[11px] tracking-wide uppercase text-accent border border-accent/30 px-4 py-2.5 inline-flex items-center gap-2 hover:bg-accent/10 transition-colors">
          <span className="group-open:hidden">+ New product</span>
          <span className="hidden group-open:inline">− Close</span>
        </summary>
        <form
          action={createProduct}
          className="border border-white/12 p-5 mt-3 grid sm:grid-cols-2 gap-3"
        >
        <div>
          <Label>Brand</Label>
          <select
            name="brandId"
            className="w-full bg-white/[0.06] border border-white/20 text-white text-[13px] p-2.5 outline-none focus:border-white/50"
          >
            <option value="">— No brand —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id} className="bg-bg">
                {b.nameEn}
              </option>
            ))}
          </select>
        </div>
        <div>
          <Label>Category</Label>
          <select
            name="categoryId"
            className="w-full bg-white/[0.06] border border-white/20 text-white text-[13px] p-2.5 outline-none focus:border-white/50"
          >
            <option value="">— No category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-bg">
                {c.nameEn}
              </option>
            ))}
          </select>
        </div>
        <Input name="nameEn" label="Name (EN)" required />
        <Input name="nameAr" label="Name (AR)" required dir="rtl" />
        <Input name="sku" label="SKU" required placeholder="AZ001-TEE-BLK" />
        <Input name="priceSar" label="Price SAR (excl VAT)" type="number" step="0.01" required />
        <Input name="totalPieces" label="Total pieces" type="number" required />
        <Input name="sizes" label="Sizes  (S:30,M:45,L:50)" placeholder="S:30,M:45,L:50" />
        <div className="sm:col-span-2">
          <div className="font-mono text-[9px] uppercase tracking-wide text-white/55 mb-1.5">
            Images
          </div>
          <ImageUpload name="images" multiple />
        </div>
        <Textarea name="storyEn" label="Story (EN)" />
        <Textarea name="storyAr" label="Story (AR)" dir="rtl" />
        <div className="sm:col-span-2">
          <button className="bg-accent text-bg font-bold text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-accent-bright transition-colors">
            Create product
          </button>
        </div>
        </form>
      </details>

      {/* List */}
      <div className="space-y-4">
        {products.length === 0 && (
          <p className="text-[13px] text-white/60">No products yet.</p>
        )}
        {products.map((p) => (
          <div key={p.id} className="border border-white/12 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
              <div className="min-w-0">
                <div className="text-[14px] font-medium">{p.nameEn}</div>
                <div className="font-mono text-[10px] text-white/60 mt-0.5">
                  {p.sku} · {p.brand?.nameEn ?? '—'} · {p.category?.nameEn ?? '—'} · {formatPrice(inclVat(p.price), 'en')} incl VAT
                  {!p.isActive && <span className="text-red-400/70"> · hidden</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <HideToggle active={p.isActive} action={toggleProductActive.bind(null, p.id)} />
                <Link
                  href={`/admin/products/${p.id}`}
                  className="font-mono text-[9px] uppercase tracking-wide text-white/60 border border-white/20 px-2 py-1 hover:text-white hover:border-white/30 transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton action={deleteProduct.bind(null, p.id)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-3 border-t border-white/10">
              {p.variants.map((v) => (
                <VariantStockControl
                  key={v.id}
                  variantId={v.id}
                  size={v.size}
                  stock={v.stock}
                />
              ))}
              {p.variants.length === 0 && (
                <span className="font-mono text-[10px] text-white/50">No sizes</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-mono text-[9px] uppercase tracking-wide text-white/55 mb-1.5">
      {children}
    </div>
  );
}

function Input({ name, label, ...rest }: { name: string; label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        name={name}
        {...rest}
        className="w-full bg-white/[0.06] border border-white/20 text-white text-[13px] p-2.5 outline-none focus:border-white/50 transition-colors"
      />
    </div>
  );
}

function Textarea({ name, label, ...rest }: { name: string; label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        name={name}
        rows={2}
        {...rest}
        className="w-full bg-white/[0.06] border border-white/20 text-white text-[13px] p-2.5 outline-none focus:border-white/50 transition-colors resize-y"
      />
    </div>
  );
}
