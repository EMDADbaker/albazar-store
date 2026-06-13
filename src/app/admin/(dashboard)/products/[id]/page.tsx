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
  const product = await prisma.product.findUnique({
    where: { id },
    include: { drop: true },
  });
  if (!product) notFound();

  const save = updateProduct.bind(null, id);
  const priceSar = (product.price / 100).toString();

  return (
    <div className="max-w-2xl">
      <Link
        href="/admin/products"
        className="font-mono text-[10px] uppercase tracking-wide text-ink/40 hover:text-ink"
      >
        ← Products
      </Link>
      <h1 className="text-[22px] font-bold mt-3 mb-1">Edit {product.nameEn}</h1>
      <p className="font-mono text-[10px] text-ink/40 mb-6">
        {product.drop.nameEn} · stock is managed on the Products list.
      </p>

      <form action={save} className="grid sm:grid-cols-2 gap-3">
        <Input name="nameEn" label="Name (EN)" defaultValue={product.nameEn} required />
        <Input name="nameAr" label="Name (AR)" defaultValue={product.nameAr} required dir="rtl" />
        <Input name="sku" label="SKU" defaultValue={product.sku} required />
        <Input name="priceSar" label="Price SAR (excl VAT)" type="number" step="0.01" defaultValue={priceSar} required />
        <Input name="totalPieces" label="Total pieces" type="number" defaultValue={product.totalPieces} required />
        <label className="flex items-center gap-2.5 self-end pb-2 cursor-pointer">
          <input type="checkbox" name="isActive" defaultChecked={product.isActive} className="accent-accent w-4 h-4" />
          <span className="text-[12px] text-ink/70">Active (visible publicly)</span>
        </label>
        <div className="sm:col-span-2">
          <div className="font-mono text-[9px] uppercase tracking-wide text-ink/35 mb-1.5">
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
            className="font-mono text-[11px] uppercase tracking-wide text-ink/50 px-4 py-3 hover:text-ink"
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
