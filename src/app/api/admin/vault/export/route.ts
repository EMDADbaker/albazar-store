import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { assertAdmin } from '@/lib/admin-auth';

export async function GET() {
  await assertAdmin(); // server-side session check (Hard rule 10)

  const members = await prisma.vaultMember.findMany({
    orderBy: { joinedAt: 'desc' },
  });

  const header = 'phone,email,whatsappOptIn,source,joinedAt';
  const rows = members.map((m) =>
    [
      m.phone,
      m.email ?? '',
      m.whatsappOptIn ? 'yes' : 'no',
      m.source ?? '',
      m.joinedAt.toISOString(),
    ].join(','),
  );
  const csv = [header, ...rows].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="albazar-vault-${Date.now()}.csv"`,
    },
  });
}
