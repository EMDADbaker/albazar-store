// Email verification + password-reset codes. A 6-digit code is hashed and
// stored with a 10-minute expiry; we keep only the latest code per (email,type)
// by deleting older ones on each request. Lightweight rate-limit: refuse a new
// code if one was issued less than 30s ago.

import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

export type CodePurpose = 'EMAIL_VERIFY' | 'PASSWORD_RESET';

const TTL_MS = 10 * 60 * 1000;
const RESEND_COOLDOWN_MS = 30 * 1000;

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000)); // 6 digits
}

// Create + persist a fresh code. Returns the plain code (to email) or null if
// the caller is requesting too frequently.
export async function issueCode(
  email: string,
  purpose: CodePurpose,
): Promise<string | null> {
  const recent = await prisma.verificationCode.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: 'desc' },
  });
  if (recent && Date.now() - recent.createdAt.getTime() < RESEND_COOLDOWN_MS) {
    return null;
  }

  await prisma.verificationCode.deleteMany({ where: { email, purpose } });

  const code = generateCode();
  const codeHash = await bcrypt.hash(code, 10);
  await prisma.verificationCode.create({
    data: { email, purpose, codeHash, expiresAt: new Date(Date.now() + TTL_MS) },
  });
  return code;
}

// Verify a submitted code. On success the code is consumed (deleted).
export async function verifyCode(
  email: string,
  purpose: CodePurpose,
  code: string,
): Promise<boolean> {
  const row = await prisma.verificationCode.findFirst({
    where: { email, purpose },
    orderBy: { createdAt: 'desc' },
  });
  if (!row) return false;
  if (row.expiresAt.getTime() < Date.now()) {
    await prisma.verificationCode.deleteMany({ where: { email, purpose } });
    return false;
  }
  const ok = await bcrypt.compare(code, row.codeHash);
  if (ok) {
    await prisma.verificationCode.deleteMany({ where: { email, purpose } });
  }
  return ok;
}
