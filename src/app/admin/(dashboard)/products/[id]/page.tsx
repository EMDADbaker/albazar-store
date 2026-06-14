import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { updateProduct } from '@/app/admin/actions';
import ImageUpload from '@/components/admin/ImageUpload';

export const dynamic = 'force-dynamic';

export default async function EditProduct({
  params: { id },
}: {
  params: { id: string };
}) {
  const [product, brands, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { brand: true, category: true } }),
    prisma.brand.findMany({ orderBy: { nameEn: 'asc' } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } }),
  ]);
  if (!product) notFound();

  const save = updateProduct.bind(null, id);
  const priceSar = (product.price / 100).toString();
  const selClass =
    'w-full bg-white/[0.06] border border-white/20 text-white text-[13px] p-2.5 outline-none focus:border-white/50';

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/products"
        className="font-mono text-[10px] uppercase tracking-wide text-white/60 hover:text-white"
      >
        ← Products
      </Link>
      <h1 className="text-[22px] font-bold mt-3 mb-1">Edit {product.nameEn}</h1>
      <p className="font-mono text-[10px] text-white/60 mb-6">
        {product.brand?.nameEn ?? '—'} · {product.category?.nameEn ?? '—'} · stock is managed on the Products list.
      </p>

      <form action={save} className="grid sm:grid-cols-2 gap-3">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wide text-white/55 mb-1.5">Brand</div>
          <select name="brandId" defaultValue={product.brandId ?? ''} className={selClass}>
            <option value="">— No brand —</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id} className="bg-bg">{b.nameEn}</option>
            ))}
          </select>
        </div>
        <div>
          <div className="font-mono text-[9px] uppercase tracking-wide text-white/55 mb-1.5">Category</div>
          <select name="categoryId" defaultValue={product.categoryId ?? ''} className={selClass}>
            <option value="">— No category —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id} className="bg-bg">{c.nameEn}</option>
            ))}
          </select>
        </div>
        <Input name="nameEn" label="Name (EN)" defaultValue={product.nameEn} required />
        <Input name="nameAr" label="Name (AR)" defaultValue={product.nameAr} required dir="rtl" />
        <Input name="sku" label="SKU" defaultValue={product.sku} required />
        <Input name="priceSar" label="Price SAR (excl VAT)" type="number" step="0.01" defaultValue={priceSar} required />
        <Input name="totalPieces" label="Total pieces" type="number" defaultValue={product.totalPieces} required />
        <label className="flex items-center gap-2.5 self-end pb-2 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="accent-accent w-4 h-4" />
          <span className="text-[12px] text-white/80">Active (visible publicly)</span>
        </label>
        <div className="sm:col-span-2">
          <div className="font-mono text-[9px] uppercase tracking-wide text-white/55 mb-1.5">
            Images
          </div>
          <ImageUpload name="images" multiple defaultValue={product.images.join(', ')} />
        </div>
        <Textarea name="storyEn" label="Story (EN)" defaultValue={product.storyEn ?? ''} />
        <Textarea name="storyAr" label="Story (AR)" defaultValue={product.storyAr ?? ''} dir="rtl" />
        <div className="sm:col-span-2 flex gap-3 mt-2">
          <button className="bg-accent text-bg font-bold text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-accent-bright transition-colors">
            Save changes
          </button>
          <Link
            href="/admin/products"
            className="font-mono text-[11px] uppercase tracking-wide text-white/65 px-4 py-3 hover:text-white"
          >
            Cancel
          </Link>
        </div>
      </form>
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
