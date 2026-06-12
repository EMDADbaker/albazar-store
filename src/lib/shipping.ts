// Manual flat-rate shipping at launch (Aramex/SMSA API comes in Phase 4).
// Amounts in halalas, computed on the EXCL-VAT subtotal. These will move into
// the Setting model so the owner can edit them without a deploy.

export const FLAT_SHIPPING = 2500; // 25 SAR
export const FREE_SHIPPING_THRESHOLD = 50000; // free over 500 SAR (excl VAT)

export function shippingFor(subtotalExclVat: number): number {
  if (subtotalExclVat <= 0) return 0;
  return subtotalExclVat >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
}

// Saudi regions for the address form's city grouping (kept simple for launch).
export const SAUDI_CITIES = [
  'Riyadh',
  'Jeddah',
  'Mecca',
  'Medina',
  'Dammam',
  'Khobar',
  'Dhahran',
  'Taif',
  'Tabuk',
  'Abha',
  'Other',
] as const;
