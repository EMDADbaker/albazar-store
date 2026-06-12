import { PrismaClient, DropStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ----- Categories (Urbn-Lot-style top nav) -----
const CATEGORIES = [
  { slug: 'hoodies', nameEn: 'Hoodies', nameAr: 'هوديهات' },
  { slug: 'tees', nameEn: 'Tees', nameAr: 'تيشيرتات' },
  { slug: 'bottoms', nameEn: 'Bottoms', nameAr: 'بناطيل' },
  { slug: 'outerwear', nameEn: 'Outerwear', nameAr: 'جواكيت' },
  { slug: 'headwear', nameEn: 'Headwear', nameAr: 'كابات' },
  { slug: 'footwear', nameEn: 'Footwear', nameAr: 'أحذية' },
  { slug: 'accessories', nameEn: 'Accessories', nameAr: 'إكسسوارات' },
];

const APPAREL = ['S', 'M', 'L', 'XL'];
const SHOE = ['40', '41', '42', '43', '44'];
const ONE = ['OS'];

// ----- Product templates: 14 distinct pieces, reused across drops -----
type Tpl = {
  key: string;
  cat: string;
  nameEn: string;
  nameAr: string;
  storyEn: string;
  storyAr: string;
  price: number; // excl VAT, halalas
  images: string[];
  sizes: string[];
};

const TEMPLATES: Tpl[] = [
  { key: 'HOODIE-BLK', cat: 'hoodies', nameEn: 'Bazar Hoodie — Black', nameAr: 'هودي البازار — أسود', storyEn: 'Heavyweight, boxy cut. Printed in Riyadh.', storyAr: 'هودي ثقيل بقصّة واسعة. مطبوع في الرياض.', price: 34900, images: ['/img/products/hoodie-black-1.jpg', '/img/products/hoodie-black-2.jpg'], sizes: APPAREL },
  { key: 'HOODIE-CAMO', cat: 'hoodies', nameEn: 'Camo Hoodie — Olive', nameAr: 'هودي كامو — زيتي', storyEn: 'Brushed fleece, neon-camo print. Loud and limited.', storyAr: 'صوف منعّم بطبعة كامو نيون. صاخب ومحدود.', price: 37900, images: ['/img/lookbook/neon-camo.jpg'], sizes: APPAREL },
  { key: 'HOODIE-ORIGIN', cat: 'hoodies', nameEn: 'Origin Hoodie — Washed', nameAr: 'هودي الأصل — مغسول', storyEn: 'Stone-washed black. The one that started it.', storyAr: 'أسود مغسول بالحجر. القطعة اللي بدأت كل شي.', price: 32900, images: ['/img/archive/bw-supreme.jpg'], sizes: APPAREL },
  { key: 'TEE-BONE', cat: 'tees', nameEn: 'Souq Tee — Bone', nameAr: 'تيشيرت السوق — عظمي', storyEn: '240gsm Egyptian cotton. Rare bone wash.', storyAr: 'قطن مصري ٢٤٠ جرام. لون عظمي نادر.', price: 14900, images: ['/img/products/tee-bone-1.jpg', '/img/products/tee-bone-2.jpg'], sizes: APPAREL },
  { key: 'TEE-TRAP', cat: 'tees', nameEn: 'Trapper Tee — White', nameAr: 'تيشيرت الترابر — أبيض', storyEn: 'Oversized boxy tee, flame graphic.', storyAr: 'تيشيرت واسع بطبعة لهب.', price: 16900, images: ['/img/lookbook/trappers-tee.jpg'], sizes: APPAREL },
  { key: 'TEE-BRICK', cat: 'tees', nameEn: 'Brick Tee — Rust', nameAr: 'تيشيرت بريك — صدئ', storyEn: 'Garment-dyed rust. Soft, heavy, honest.', storyAr: 'مصبوغ بلون الصدأ. ناعم وثقيل.', price: 15900, images: ['/img/archive/brick-duo.jpg'], sizes: APPAREL },
  { key: 'CARGO-ASH', cat: 'bottoms', nameEn: 'Night Cargo — Ash', nameAr: 'كارقو الليل — رمادي', storyEn: 'Hidden-pocket ripstop cargo. Built for the street.', storyAr: 'كارقو بجيوب مخفية. للشارع.', price: 44900, images: ['/img/products/cargo-ash-1.jpg', '/img/products/cargo-ash-2.jpg'], sizes: APPAREL },
  { key: 'PUFFER-PURP', cat: 'outerwear', nameEn: 'Riyadh Puffer — Purple', nameAr: 'بفر الرياض — بنفسجي', storyEn: 'Cropped puffer, matte shell. Cold-night armor.', storyAr: 'بفر قصير بقماش مطفي. درع ليالي البرد.', price: 59900, images: ['/img/lookbook/texas-purple.jpg'], sizes: APPAREL },
  { key: 'JACKET-SHUT', cat: 'outerwear', nameEn: 'Shutter Jacket — Pink', nameAr: 'جاكيت الشتر — وردي', storyEn: 'Coach jacket, snap front, bold wash.', storyAr: 'جاكيت كوتش بأزرار، غسلة جريئة.', price: 54900, images: ['/img/lookbook/pink-shutter.jpg'], sizes: APPAREL },
  { key: 'CAP-CITY', cat: 'headwear', nameEn: 'City Cap — Black', nameAr: 'كاب المدينة — أسود', storyEn: 'Unstructured 6-panel, woven tag.', storyAr: 'كاب ٦ بنل، تاق محبوك.', price: 11900, images: ['/img/archive/city-cap.jpg'], sizes: ONE },
  { key: 'CAP-KING', cat: 'headwear', nameEn: 'King Cap — Sand', nameAr: 'كاب الملك — رملي', storyEn: 'Numbered back panel. Wear your number.', storyAr: 'رقم على الخلف. البس رقمك.', price: 12900, images: ['/img/campaign/king-01.jpg'], sizes: ONE },
  { key: 'SHOE-COURT', cat: 'footwear', nameEn: 'Court Lows — Bone', nameAr: 'كورت لوز — عظمي', storyEn: 'Canvas low-top. Gold lace detail.', storyAr: 'حذاء كانفاس منخفض. ديتيل ذهبي.', price: 49900, images: ['/img/archive/stussy-af1.jpg'], sizes: SHOE },
  { key: 'SHOE-STREET', cat: 'footwear', nameEn: 'Street Lows — White', nameAr: 'ستريت لوز — أبيض', storyEn: 'Clean white leather low. Everyday weapon.', storyAr: 'جلد أبيض نظيف. سلاحك اليومي.', price: 52900, images: ['/img/lookbook/white-kicks.jpg'], sizes: SHOE },
  { key: 'TOTE-VAULT', cat: 'accessories', nameEn: 'Vault Tote — Black', nameAr: 'شنطة الخزنة — أسود', storyEn: 'Heavy canvas tote, screen-printed.', storyAr: 'شنطة كانفاس ثقيلة مطبوعة.', price: 9900, images: ['/img/lookbook/tunnel-night.jpg'], sizes: ONE },
];

// ----- Drops: live, upcoming, sold out, archived -----
const DROPS = [
  { slug: 'drop-004', nameEn: 'Drop 004', nameAr: 'دروب ٠٠٤', status: 'LIVE' as DropStatus, days: 0, sold: false, sort: 40, hero: '/img/campaign/orange-sky.jpg' },
  { slug: 'drop-003', nameEn: 'Drop 003', nameAr: 'دروب ٠٠٣', status: 'TEASER' as DropStatus, days: 5, sold: false, sort: 30, hero: '/img/campaign/desert-dune.jpg' },
  { slug: 'drop-002', nameEn: 'Drop 002', nameAr: 'دروب ٠٠٢', status: 'SOLDOUT' as DropStatus, days: -20, sold: true, sort: 20, hero: '/img/campaign/oasis.jpg' },
  { slug: 'drop-001', nameEn: 'Drop 001', nameAr: 'دروب ٠٠١', status: 'ARCHIVED' as DropStatus, days: -60, sold: true, sort: 10, hero: '/img/campaign/riyadh-arch.jpg' },
];

function stockFor(sold: boolean, i: number): number {
  if (sold) return 0;
  // Vary stock so some sizes look low/out for realism on live drops.
  const base = [12, 30, 40, 18, 9];
  return base[i % base.length];
}

async function main() {
  // Admin
  const email = (process.env.ADMIN_EMAIL ?? 'admin@albazar.sa').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'albazar-admin';
  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, role: 'admin' },
    update: { passwordHash },
  });
  console.log(`✓ Admin: ${email} / ${password}`);

  // Clean slate (demo): remove orders → products → drops → categories.
  await prisma.order.deleteMany({});
  await prisma.inventoryHold.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.drop.deleteMany({});
  await prisma.category.deleteMany({});

  // Categories
  const catBySlug: Record<string, string> = {};
  for (let i = 0; i < CATEGORIES.length; i++) {
    const c = CATEGORIES[i];
    const created = await prisma.category.create({
      data: { ...c, sortOrder: i },
    });
    catBySlug[c.slug] = created.id;
  }
  console.log(`✓ ${CATEGORIES.length} categories`);

  // Drops + products
  let productCount = 0;
  for (const d of DROPS) {
    const drop = await prisma.drop.create({
      data: {
        slug: d.slug,
        nameEn: d.nameEn,
        nameAr: d.nameAr,
        status: d.status,
        published: true,
        sortOrder: d.sort,
        launchAt: new Date(Date.now() + d.days * 86400000),
        heroImage: d.hero,
      },
    });

    // All 14 templates per drop → 56 products, every category populated.
    const tpls = TEMPLATES;
    for (let i = 0; i < tpls.length; i++) {
      const tpl = tpls[i];
      const dropNo = d.slug.replace('drop-', '');
      await prisma.product.create({
        data: {
          dropId: drop.id,
          categoryId: catBySlug[tpl.cat],
          sku: `AZ${dropNo}-${tpl.key}`,
          nameEn: tpl.nameEn,
          nameAr: tpl.nameAr,
          storyEn: tpl.storyEn,
          storyAr: tpl.storyAr,
          price: tpl.price,
          totalPieces: 100 + i * 10,
          images: tpl.images,
          variants: {
            create: tpl.sizes.map((size, si) => ({
              size,
              stock: stockFor(d.sold, si),
            })),
          },
        },
      });
      productCount++;
    }
  }
  console.log(`✓ ${DROPS.length} drops + ${productCount} products`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
