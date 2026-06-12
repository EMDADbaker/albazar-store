import { prisma } from '@/lib/prisma';
import { formatPrice, inclVat } from '@/lib/money';
import { createProduct } from '@/app/admin/actions';
import VariantStockControl from '@/components/admin/VariantStockControl';

export const dynamic = 'force-dynamic';

export default async function ProductsAdmin() {
  const [drops, products] = await Promise.all([
    prisma.drop.findMany({ orderBy: { launchAt: 'desc' } }),
    prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      include: { variants: { orderBy: { size: 'asc' } }, drop: true },
    }),
  ]);

  return (
    <div>
      <h1 className="text-[22px] font-bold mb-1">Products</h1>
      <p className="font-mono text-[11px] text-ink/40 mb-8">
        Prices entered excl. VAT in SAR; displayed incl. 15% VAT.
      </p>

      {/* Create */}
      <form
        action={createProduct}
        className="border border-ink/[0.08] p-5 mb-10 grid sm:grid-cols-2 gap-3"
      >
        <div className="sm:col-span-2">
          <Label>Drop</Label>
          <select
            name="dropId"
            required
            className="w-full bg-ink/[0.04] border border-ink/[0.12] text-ink text-[13px] p-2.5 outline-none focus:border-accent/50"
          >
            {drops.length === 0 && <option value="">Create a drop first</option>}
            {drops.map((d) => (
              <option key={d.id} value={d.id} className="bg-bg">
                {d.nameEn} (/{d.slug})
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
          <Input name="images" label="Image paths (comma separated)" placeholder="/img/products/tee-1.jpg, /img/products/tee-2.jpg" />
        </div>
        <Textarea name="storyEn" label="Story (EN)" />
        <Textarea name="storyAr" label="Story (AR)" dir="rtl" />
        <div className="sm:col-span-2">
          <button className="bg-accent text-bg font-bold text-[11px] tracking-[0.18em] uppercase px-6 py-3 hover:bg-accent-bright transition-colors">
            Create product
          </button>
        </div>
      </form>

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
                  {p.sku} · {p.drop.nameEn} · {formatPrice(inclVat(p.price), 'en')} incl VAT
                  {!p.isActive && <span className="text-red-400/70"> · hidden</span>}
                </div>
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
