import { prisma } from './prisma';

export type Variant = { id: string; size: string; stock: number };

export type ProductView = {
  id: string;
  slug: string; // = sku, url-safe
  dropSlug: string;
  nameAr: string;
  nameEn: string;
  storyAr: string | null;
  storyEn: string | null;
  price: number; // EXCL VAT, halalas
  sku: string;
  totalPieces: number;
  images: string[];
  variants: Variant[];
};

// Demo catalogue so Drop/Product pages render before the DB is seeded.
const DEMO_PRODUCTS: ProductView[] = [
  {
    id: 'demo-1',
    slug: 'bazar-hoodie-black',
    dropSlug: 'drop-001',
    nameAr: 'هودي البازار — أسود',
    nameEn: 'Bazar Hoodie — Black',
    storyAr: 'هودي ثقيل بقصّة واسعة. مطبوع في الرياض. ١٥٠ قطعة بس.',
    storyEn: 'Heavyweight, boxy cut. Printed in Riyadh. 150 pieces only.',
    price: 34900, // 349 SAR excl VAT
    sku: 'AZ001-HOODIE-BLK',
    totalPieces: 150,
    images: ['/img/products/hoodie-black-1.jpg', '/img/products/hoodie-black-2.jpg'],
    variants: [
      { id: 'd1-s', size: 'S', stock: 30 },
      { id: 'd1-m', size: 'M', stock: 45 },
      { id: 'd1-l', size: 'L', stock: 50 },
      { id: 'd1-xl', size: 'XL', stock: 25 },
    ],
  },
  {
    id: 'demo-2',
    slug: 'souq-tee-bone',
    dropSlug: 'drop-001',
    nameAr: 'تيشيرت السوق — عظمي',
    nameEn: 'Souq Tee — Bone',
    storyAr: 'قطن مصري ٢٤٠ جرام. لون عظمي نادر. ما يتكرر.',
    storyEn: '240gsm Egyptian cotton. Rare bone wash. Never repeated.',
    price: 14900,
    sku: 'AZ001-TEE-BONE',
    totalPieces: 200,
    images: ['/img/products/tee-bone-1.jpg', '/img/products/tee-bone-2.jpg'],
    variants: [
      { id: 'd2-s', size: 'S', stock: 0 },
      { id: 'd2-m', size: 'M', stock: 60 },
      { id: 'd2-l', size: 'L', stock: 80 },
      { id: 'd2-xl', size: 'XL', stock: 40 },
    ],
  },
  {
    id: 'demo-3',
    slug: 'night-cargo-ash',
    dropSlug: 'drop-001',
    nameAr: 'كارقو الليل — رمادي',
    nameEn: 'Night Cargo — Ash',
    storyAr: 'كارقو بجيوب مخفية. خامة مقاومة. للشارع.',
    storyEn: 'Hidden-pocket cargo. Ripstop. Built for the street.',
    price: 44900,
    sku: 'AZ001-CARGO-ASH',
    totalPieces: 120,
    images: ['/img/products/cargo-ash-1.jpg', '/img/products/cargo-ash-2.jpg'],
    variants: [
      { id: 'd3-s', size: 'S', stock: 20 },
      { id: 'd3-m', size: 'M', stock: 35 },
      { id: 'd3-l', size: 'L', stock: 40 },
      { id: 'd3-xl', size: 'XL', stock: 25 },
    ],
  },
];

function remaining(p: ProductView): number {
  return p.variants.reduce((sum, v) => sum + v.stock, 0);
}

export function piecesLeft(p: ProductView): number {
  return remaining(p);
}

export async function getDropProducts(dropSlug: string): Promise<ProductView[]> {
  try {
    const products = await prisma.product.findMany({
      where: { drop: { slug: dropSlug }, isActive: true },
      include: { variants: { orderBy: { size: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    });
    if (products.length === 0) {
      return DEMO_PRODUCTS.filter((p) => p.dropSlug === dropSlug);
    }
    return products.map(toView);
  } catch {
    return DEMO_PRODUCTS.filter((p) => p.dropSlug === dropSlug);
  }
}

export async function getProductBySlug(slug: string): Promise<ProductView | null> {
  try {
    const product = await prisma.product.findFirst({
      where: { sku: slug, isActive: true },
      include: { variants: { orderBy: { size: 'asc' } }, drop: true },
    });
    if (!product) {
      return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
    }
    return toView(product);
  } catch {
    return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function toView(p: any): ProductView {
  return {
    id: p.id,
    slug: p.sku,
    dropSlug: p.drop?.slug ?? '',
    nameAr: p.nameAr,
    nameEn: p.nameEn,
    storyAr: p.storyAr,
    storyEn: p.storyEn,
    price: p.price,
    sku: p.sku,
    totalPieces: p.totalPieces,
    images: p.images ?? [],
    variants: p.variants.map((v: { id: string; size: string; stock: number }) => ({
      id: v.id,
      size: v.size,
      stock: v.stock,
    })),
  };
}
