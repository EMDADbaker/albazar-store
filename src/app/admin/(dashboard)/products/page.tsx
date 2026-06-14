import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice, inclVat } from '@/lib/money';
import { createProduct, deleteProduct } from '@/app/admin/actions';
import VariantStockControl from '@/components/admin/VariantStockControl';
import DeleteButton from '@/components/admin/DeleteButton';
import ImageUpload from '@/components/admin/ImageUpload';

export const dynamic = 'force-dynamic';

export default async function ProductsAdmin() {
  const [brands, categories, products] = await Promise.all([
    prisma.brand.findMany({ orderBy: { nameEn: 'asc' } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: { orderBy: { size: 'asc' } }, brand: true, category: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Products</h1>
      <p className="font-mono text-[11px] text-ink/40 mb-8">
        Prices entered excl. VAT in SAR; displayed incl. 15% VAT.
      </p>

      {/* Create */}
      <details className="mb-10 group">
        <summary className="cursor-pointer list-none font-mono text-[11px] tracking-wide uppercase text-accent border border-accent/30 px-4 py-2.5 inline-flex items-center gap-2 hover:bg-accent/10 transition-colors">
          <span className="group-open:hidden">+ New product</span>
          <span className="hidden group-open:inline">− Close</span>
        </summary>
        <form
          action={createProduct}
          className="border border-ink/[0.08] p-5 mt-3 grid sm:grid-cols-2 gap-3"
        >
        <div>
          <Label>Brand</Label>
          <select
            name="brandId"
            className="w-full bg-ink/[0.04] border border-ink/[0.12] text-ink text-[13px] p-2.5 outline-none focus:border-accent/50"
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
            className="w-full bg-ink/[0.04] border border-ink/[0.12] text-ink text-[13px] p-2.5 outline-none focus:border-accent/50"
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
          <div className="font-mono text-[9px] uppercase tracking-wide text-ink/35 mb-1.5">
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
          <p className="text-[13px] text-ink/40">No products yet.</p>
        )}
        {products.map((p) => (
          <div key={p.id} className="border border-ink/[0.08] p-4">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <div className="text-[14px] font-medium">{p.nameEn}</div>
                <div className="font-mono text-[10px] text-ink/40 mt-0.5">
                  {p.sku} · {p.brand?.nameEn ?? '—'} · {p.category?.nameEn ?? '—'} · {formatPrice(inclVat(p.price), 'en')} incl VAT
                  {!p.isActive && <span className="text-red-400/70"> · hidden</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/admin/products/${p.id}`}
                  className="font-mono text-[9px] uppercase tracking-wide text-ink/40 border border-ink/15 px-2 py-1 hover:text-ink hover:border-ink/30 transition-colors"
                >
                  Edit
                </Link>
                <DeleteButton action={deleteProduct.bind(null, p.id)} />
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-3 border-t border-ink/[0.06]">
              {p.variants.map((v) => (
                <VariantStockControl
                  key={v.id}
                  variantId={v.id}
                  size={v.size}
                  stock={v.stock}
                />
              ))}
              {p.variants.length === 0 && (
                <span className="font-mono text-[10px] text-ink/30">No sizes</span>
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
    <div className="font-mono text-[9px] uppercase tracking-wide text-ink/35 mb-1.5">
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
        className="w-full bg-ink/[0.04] border border-ink/[0.12] text-ink text-[13px] p-2.5 outline-none focus:border-accent/50 transition-colors"
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
        className="w-full bg-ink/[0.04] border border-ink/[0.12] text-ink text-[13px] p-2.5 outline-none focus:border-accent/50 transition-colors resize-y"
      />
    </div>
  );
}
