import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Admin user — override via ADMIN_EMAIL / ADMIN_PASSWORD env at seed time.
  const email = (process.env.ADMIN_EMAIL ?? 'admin@albazar.sa').toLowerCase();
  const password = process.env.ADMIN_PASSWORD ?? 'albazar-admin';
  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.adminUser.upsert({
    where: { email },
    create: { email, passwordHash, role: 'admin' },
    update: { passwordHash },
  });
  console.log(`✓ Admin: ${email} / ${password}`);

  // Drop 001 (TEASER) — countdown ~3 days out.
  const drop = await prisma.drop.upsert({
    where: { slug: 'drop-001' },
    update: {},
    create: {
      slug: 'drop-001',
      nameEn: 'Drop 001',
      nameAr: 'دروب ٠٠١',
      status: 'TEASER',
      launchAt: new Date(Date.now() + 3 * 86400000),
      teaserImage: '/img/campaign/king-01.jpg',
      heroImage: '/img/campaign/desert-dune.jpg',
    },
  });

  const products = [
    {
      sku: 'AZ001-HOODIE-BLK',
      nameEn: 'Bazar Hoodie — Black',
      nameAr: 'هودي البازار — أسود',
      storyEn: 'Heavyweight, boxy cut. Printed in Riyadh. 150 pieces only.',
      storyAr: 'هودي ثقيل بقصّة واسعة. مطبوع في الرياض. ١٥٠ قطعة بس.',
      price: 34900,
      totalPieces: 150,
      images: ['/img/products/hoodie-black-1.jpg', '/img/products/hoodie-black-2.jpg'],
      sizes: [['S', 30], ['M', 45], ['L', 50], ['XL', 25]] as [string, number][],
    },
    {
      sku: 'AZ001-TEE-BONE',
      nameEn: 'Souq Tee — Bone',
      nameAr: 'تيشيرت السوق — عظمي',
      storyEn: '240gsm Egyptian cotton. Rare bone wash. Never repeated.',
      storyAr: 'قطن مصري ٢٤٠ جرام. لون عظمي نادر. ما يتكرر.',
      price: 14900,
      totalPieces: 200,
      images: ['/img/products/tee-bone-1.jpg', '/img/products/tee-bone-2.jpg'],
      sizes: [['S', 0], ['M', 60], ['L', 80], ['XL', 40]] as [string, number][],
    },
    {
      sku: 'AZ001-CARGO-ASH',
      nameEn: 'Night Cargo — Ash',
      nameAr: 'كارقو الليل — رمادي',
      storyEn: 'Hidden-pocket cargo. Ripstop. Built for the street.',
      storyAr: 'كارقو بجيوب مخفية. خامة مقاومة. للشارع.',
      price: 44900,
      totalPieces: 120,
      images: ['/img/products/cargo-ash-1.jpg', '/img/products/cargo-ash-2.jpg'],
      sizes: [['S', 20], ['M', 35], ['L', 40], ['XL', 25]] as [string, number][],
    },
  ];

  for (const p of products) {
    const existing = await prisma.product.findUnique({ where: { sku: p.sku } });
    if (existing) continue;
    await prisma.product.create({
      data: {
        dropId: drop.id,
        sku: p.sku,
        nameEn: p.nameEn,
        nameAr: p.nameAr,
        storyEn: p.storyEn,
        storyAr: p.storyAr,
        price: p.price,
        totalPieces: p.totalPieces,
        images: p.images,
        variants: { create: p.sizes.map(([size, stock]) => ({ size, stock })) },
      },
    });
  }
  console.log(`✓ Drop 001 + ${products.length} products`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
