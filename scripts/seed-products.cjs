/* Additive catalog seed: nav-taxonomy categories + ~100 demo products from the
   images in public/img + a STREET WEAR hero slide (slide3.jpg).
   Idempotent: products keyed by SKU (skipped if present); categories upserted.
   Run: node scripts/seed-products.cjs   */
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const prisma = new PrismaClient();

// slug -> labels + kind (kind drives the size set)
const CATS = [
  { slug: 'tops', en: 'Tops', ar: 'علوي', kind: 'apparel' },
  { slug: 't-shirts', en: 'T-Shirts', ar: 'تيشيرتات', kind: 'apparel' },
  { slug: 'crewnecks-hoodies', en: 'Crewnecks & Hoodies', ar: 'كروينك وهوديز', kind: 'apparel' },
  { slug: 'button-ups-vests', en: 'Button-Ups / Vests', ar: 'قمصان وصدريات', kind: 'apparel' },
  { slug: 'jackets', en: 'Jackets', ar: 'جواكيت', kind: 'apparel' },
  { slug: 'tanks', en: 'Tanks', ar: 'فانيلات', kind: 'apparel' },
  { slug: 'bottoms', en: 'Bottoms', ar: 'سفلي', kind: 'apparel' },
  { slug: 'pants-jeans', en: 'Pants & Jeans', ar: 'بناطيل وجينز', kind: 'apparel' },
  { slug: 'shorts', en: 'Shorts', ar: 'شورتات', kind: 'apparel' },
  { slug: 'swim-shorts', en: 'Swim Shorts', ar: 'شورتات سباحة', kind: 'apparel' },
  { slug: 'headwear', en: 'Headwear', ar: 'أغطية الرأس', kind: 'os' },
  { slug: 'footwear', en: 'Footwear', ar: 'أحذية', kind: 'shoe' },
  { slug: 'accessories', en: 'Accessories', ar: 'إكسسوارات', kind: 'os' },
  { slug: 'bags', en: 'Bags', ar: 'شنط', kind: 'os' },
  { slug: 'bracelets', en: 'Bracelets', ar: 'أساور', kind: 'os' },
  { slug: 'chains', en: 'Chains', ar: 'سلاسل', kind: 'os' },
  { slug: 'collectibles', en: 'Collectibles', ar: 'مقتنيات', kind: 'os' },
  { slug: 'keychains', en: 'Keychains', ar: 'ميداليات', kind: 'os' },
  { slug: 'masks', en: 'Masks', ar: 'كمامات', kind: 'os' },
  { slug: 'necklaces', en: 'Necklaces', ar: 'قلائد', kind: 'os' },
  { slug: 'pins-patches', en: 'Pins & Patches', ar: 'دبابيس ورقع', kind: 'os' },
  { slug: 'rings', en: 'Rings', ar: 'خواتم', kind: 'os' },
  { slug: 'rugs-mats-blankets', en: 'Rugs, Mats & Blankets', ar: 'سجاد ودعّاسات وبطانيات', kind: 'os' },
  { slug: 'socks', en: 'Socks', ar: 'جوارب', kind: 'os' },
  { slug: 'stickers', en: 'Stickers', ar: 'ستيكرات', kind: 'os' },
  { slug: 'sunglasses', en: 'Sunglasses', ar: 'نظارات', kind: 'os' },
];

const SIZES = {
  apparel: ['S', 'M', 'L', 'XL'],
  shoe: ['40', '41', '42', '43', '44'],
  os: ['OS'],
};

const COLORS = [
  { en: 'Black', ar: 'أسود' }, { en: 'Bone', ar: 'عظمي' }, { en: 'Ash', ar: 'رمادي' },
  { en: 'Olive', ar: 'زيتي' }, { en: 'Navy', ar: 'كحلي' }, { en: 'Cream', ar: 'كريمي' },
  { en: 'Washed Grey', ar: 'رمادي مغسول' }, { en: 'Sand', ar: 'رملي' }, { en: 'Forest', ar: 'أخضر غامق' },
];

const pick = (a, i) => a[i % a.length];
const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  // 1) Categories (upsert so the new header taxonomy resolves to real pages)
  for (let i = 0; i < CATS.length; i++) {
    const c = CATS[i];
    await prisma.category.upsert({
      where: { slug: c.slug },
      update: { nameEn: c.en, nameAr: c.ar, active: true },
      create: { slug: c.slug, nameEn: c.en, nameAr: c.ar, active: true, sortOrder: i },
    });
  }
  console.log(`Categories upserted: ${CATS.length}`);

  // 2) Image pool from public/img (exclude logos/favicons/slides/campaign/lookbook)
  const dir = path.join(process.cwd(), 'public', 'img');
  const images = fs
    .readdirSync(dir)
    .filter((f) => /\.(jpg|jpeg|webp|png)$/i.test(f))
    .filter((f) => !/logo|favicon|icon|slide/i.test(f))
    .map((f) => `/img/${f}`);
  console.log(`Image pool: ${images.length}`);

  const brands = await prisma.brand.findMany({ where: { active: true }, orderBy: { nameEn: 'asc' } });
  const cats = await prisma.category.findMany();
  const catBySlug = Object.fromEntries(cats.map((c) => [c.slug, c]));

  // 3) ~100 products spread across every category
  const COUNT = 100;
  let created = 0;
  for (let i = 0; i < COUNT; i++) {
    const meta = CATS[i % CATS.length];
    const cat = catBySlug[meta.slug];
    const brand = pick(brands, i * 7 + 3); // stride so brands vary
    const color = pick(COLORS, i * 3 + 1);
    const sku = `AZ-CAT-${String(i + 1).padStart(3, '0')}`;

    const exists = await prisma.product.findUnique({ where: { sku } });
    if (exists) continue;

    const nameEn = `${brand.nameEn} ${meta.en.replace(/ &.*| \/.*|s$/, '')} — ${color.en}`;
    const nameAr = `${meta.ar} ${brand.nameEn} — ${color.ar}`;
    const imgs = [pick(images, i), pick(images, i + 1)];
    const sizes = SIZES[meta.kind];
    const total = rnd(60, 240);

    await prisma.product.create({
      data: {
        nameEn,
        nameAr,
        storyEn: `${brand.nameEn} ${meta.en.toLowerCase()} in ${color.en.toLowerCase()}. Curated in Jeddah. Limited run.`,
        storyAr: `${meta.ar} من ${brand.nameEn} بلون ${color.ar}. مختار في جدة. كمية محدودة.`,
        price: rnd(99, 599) * 100, // halalas, excl VAT
        sku,
        totalPieces: total,
        images: imgs,
        isActive: true,
        brandId: brand.id,
        categoryId: cat.id,
        variants: {
          create: sizes.map((s) => ({ size: s, stock: rnd(0, 18) })),
        },
      },
    });
    created++;
  }
  console.log(`Products created: ${created}`);

  // 4) STREET WEAR hero slide (slide3.jpg), featured first
  const slideImg = '/img/slide3.jpg';
  const hasSlide = await prisma.heroSlide.findFirst({ where: { image: slideImg } });
  if (!hasSlide) {
    // push existing slides back so this one leads
    await prisma.heroSlide.updateMany({ data: { sortOrder: { increment: 1 } } });
    await prisma.heroSlide.create({
      data: {
        image: slideImg,
        titleEn: 'STREET WEAR',
        titleAr: 'ستريت وير',
        subtitleEn: 'Curated labels. Jeddah to the world.',
        subtitleAr: 'براندات مختارة. من جدة إلى العالم.',
        active: true,
        sortOrder: 0,
      },
    });
    console.log('Hero slide added: STREET WEAR (slide3.jpg)');
  } else {
    console.log('Hero slide for slide3.jpg already exists — skipped');
  }
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error('SEED ERROR:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
