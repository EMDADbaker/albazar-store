// Money + VAT helpers.
// Source of truth: prices stored EXCL. VAT, in halalas (integers). 1 SAR = 100 halalas.

export const VAT_RATE = 0.15;

/** VAT amount (halalas) for a given excl-VAT amount (halalas). Rounded to nearest halala. */
export function vatOf(exclHalalas: number): number {
  return Math.round(exclHalalas * VAT_RATE);
}

/** Incl-VAT total (halalas) from excl-VAT amount (halalas). */
export function inclVat(exclHalalas: number): number {
  return exclHalalas + vatOf(exclHalalas);
}

/**
 * Format a halala amount (incl. VAT already applied if desired) for display.
 * locale 'ar' -> "٣٤٩ ر.س", locale 'en' -> "SAR 349".
 */
export function formatPrice(halalas: number, locale: string): string {
  const sar = halalas / 100;
  const hasFraction = halalas % 100 !== 0;
  const nf = new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-US', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  });
  const num = nf.format(sar);
  return locale === 'ar' ? `${num} ر.س` : `SAR ${num}`;
}
