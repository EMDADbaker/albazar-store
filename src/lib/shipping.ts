// Manual flat-rate shipping at launch (Aramex/SMSA API comes in Phase 4).
// Amounts in halalas. The free-shipping threshold is checked against the
// VAT-INCLUSIVE total (what the customer actually sees), so 500 = "500 SAR
// incl. VAT". These will move into the Setting model later.
import { inclVat } from './money';

export const FLAT_SHIPPING = 2500; // 25 SAR
export const FREE_SHIPPING_THRESHOLD = 50000; // free over 500 SAR (incl VAT)

export function shippingFor(subtotalExclVat: number): number {
  if (subtotalExclVat <= 0) return 0;
  // Compare the incl-VAT amount so it matches the displayed (incl-VAT) prices.
  return inclVat(subtotalExclVat) >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING;
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
