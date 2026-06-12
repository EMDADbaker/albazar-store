// Saudi phone validation. Accepts forms: 5XXXXXXXX, 05XXXXXXXX, +9665XXXXXXXX, 9665XXXXXXXX.
// Normalizes to E.164: +9665XXXXXXXX.

const SAUDI_MOBILE = /^(?:\+?966|0)?5\d{8}$/;

export function isValidSaudiPhone(raw: string): boolean {
  return SAUDI_MOBILE.test(raw.replace(/[\s-]/g, ''));
}

export function normalizeSaudiPhone(raw: string): string | null {
  const cleaned = raw.replace(/[\s-]/g, '');
  if (!SAUDI_MOBILE.test(cleaned)) return null;
  const digits = cleaned.replace(/^\+?966/, '').replace(/^0/, '');
  return `+966${digits}`;
}
