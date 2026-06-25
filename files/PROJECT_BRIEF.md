# 🖤 ALBAZAR — Project Brief v2 (The Drop Machine)

## What This Is
ALBAZAR (البازار) is a bilingual (Arabic/English) streetwear e-commerce site for the Saudi market, targeting Gen Z (18–28). This is a store that houses worldwide brands & Saudi local brands. The owner has full ownership of code, data, and infrastructure.

Brand positioning: **exclusive, elevated, Riyadh & Jeddah-coded.** The visitor should feel like they discovered something, not like they walked into a mall.

---

## 🔁 The Core Loop (everything serves this)

```
TEASE → COUNTDOWN → DROP → SELL OUT → ARCHIVE → repeat
```

- Between drops: homepage = cinematic countdown + teaser. No product grid.
- During a drop: homepage = live collection, stock counters, buy fast.
- After sellout: pieces move to The Archive with SOLD OUT stamps. Demand becomes marketing.

---

## 🧱 Tech Stack (own everything — updated 2026-06-24)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + React + TypeScript (strict) |
| Styling | Tailwind CSS (+ RTL) |
| Animations | Framer Motion (entrance, scroll reveals, countdown) |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Supabase, region `ap-southeast-2` Sydney) |
| ORM | Prisma |
| Auth | NextAuth.js — **admin AND customer accounts** (credentials: email or phone + password) |
| Payments | **Paymob (KSA) Unified Checkout** — `ksa.paymob.com`, hosted checkout + HMAC webhook. (Was Moyasar in v2 plan.) |
| Transactional email | **Resend** — verification codes + password reset, from `baker@albazars.com` |
| Notifications | WhatsApp = primary customer channel; **email (Resend) = account/verification channel** |
| Images | Cloudinary (catalogue) + local `/public/img` |
| Hosting | **Netlify** (`albazar-sa.netlify.app`) + Supabase |
| i18n | next-intl (ar default no-prefix, en `/en`, full RTL) |

---

## 🎬 Signature Feature 1 — The Entrance

A cinematic gate before the site. Full black screen, slow gold pulse, brand name large, one line: "Scroll to enter / اسحب للدخول".

Rules (these matter — theater must never cost sales):
- Shows on **first visit only** (set localStorage flag). Returning visitors skip it.
- **Auto-skipped entirely during a live drop** — never put a wall between a buyer and the buy button.
- Skippable by any scroll/tap/key within 0.5s. Max duration if untouched: 4 seconds, then auto-dissolve into the site.
- Mobile-first: must run at 60fps on a mid-range phone. If using video, ≤2MB, muted, autoplay, no audio dependency.
- Build with Framer Motion + CSS. No heavy WebGL on mobile.

## 🔐 Signature Feature 2 — The Vault (waitlist)

- A single elegant capture: phone number + WhatsApp opt-in (+966 validation). Email optional.
- Vault members get the drop link 1 hour before public, via WhatsApp.
- Position it as membership, not a newsletter: "Join the Vault. Early access. No spam. / انضم للخزنة"
- Capture points: entrance screen footer, post-sellout pages ("Missed it? Don't miss the next one"), order confirmation.
- Admin can export the list and trigger a drop announcement broadcast.

## 🔢 Signature Feature 3 — Numbered Pieces

- Every unit in a drop is numbered: "07 / 150".
- Shown on the product page (live remaining count), the order confirmation, and the PDF invoice.
- DB: each OrderItem is assigned a piece number at payment-confirmation time (not add-to-cart — avoid reserving numbers for abandoned carts).

## 🗄️ Signature Feature 4 — The Archive

- Past drops live forever on /archive with SOLD OUT stamps and original drop dates.
- Each archived drop shows: campaign images, piece count, time-to-sellout ("Sold out in 3 days").
- This page is marketing. Make it beautiful.

## ⏱️ Signature Feature 5 — Drop Countdown

- Server-driven countdown (never trust client clock) to the next drop's `launchAt`.
- At T-0 the homepage flips automatically from countdown mode to shop mode. No deploy needed — it's a DB state.
- Optional "drop is live" WhatsApp blast to Vault members.

---

## 📄 Pages (lean — cut from 12 to what matters)

### Public
1. **Entrance** (first visit overlay, not a route)
2. **Home** — countdown mode OR live-drop mode (state-driven)
3. **Drop page** — current collection grid (this replaces a generic "shop" page)
4. **Product page** — images, story of the piece, size selector + size guide, live stock + piece numbering, Add to Cart
5. **The Archive** — past drops
6. **Lookbook** — full-bleed campaign imagery, shoppable tags
7. **Cart + Checkout** — guest or logged-in checkout, Saudi address form, Paymob hosted payment
8. **Order confirmation** — order number, piece number(s), invoice download, WhatsApp updates opt-in
9. **Customer accounts** *(built — no longer cut)* — register (email-primary + email verification code; phone optional), login (email **or** phone), forgot/reset password, account dashboard (orders, wishlist, saved address)
10. **Editorial — /jeddah** — Old Jeddah × Streetwear full-bleed editorial page (transparent scroll header)
11. **Info pages** — About (brand story), Contact (WhatsApp-first), Terms / Privacy / Returns (placeholders, owner fills later — **needed before payment-gateway approval**)

### Admin (NextAuth-protected)
1. **Drops manager** — create a drop: name, launchAt, teaser image, pieces, quantities. One button: "Schedule drop."
2. **Products manager** — pieces belong to drops; images via Cloudinary; sizes as variants with per-size stock
3. **Orders manager** — list, status flow (paid → packed → shipped → delivered), invoice regeneration
4. **Vault manager** — waitlist list, export, broadcast announcement
5. **Settings** — store identity, shipping rates per region, free-shipping threshold

Still cut: coupons (no discounts — exclusivity), reviews (social proof comes from Instagram/TikTok embeds instead). **Customer accounts are now built** (email-verified registration, login by email or phone, password reset) — guest checkout still supported alongside.

---

## 🌐 Bilingual & RTL (unchanged from v1, still strict)
- next-intl, /messages/ar.json + /messages/en.json, zero hardcoded strings.
- Arabic default + full RTL; language switch in nav.
- Prices: `٣٤٩ ر.س` (ar) / `SAR 349` (en), VAT-inclusive display with "شامل ضريبة القيمة المضافة 15%".
- Brand voice in Arabic should be street, not formal — write ar.json copy like Riyadh Gen Z talks, not like a bank.

## 💳 Payments — Paymob KSA (updated 2026-06-24; replaces Moyasar)
- **Unified Checkout** on `ksa.paymob.com`: server creates a payment *intention* (`/v1/intention/`, `Authorization: Token <secret_key>`) → customer is redirected to Paymob's hosted checkout (`/unifiedcheckout/?publicKey=…&clientSecret=…`). **Card data never touches our page** (PCI-safe).
- **Webhook** `/api/webhooks/paymob`: HMAC-SHA512 signature verified before any fulfilment. On a verified success it calls the shared `markOrderPaid` helper.
- Admin can enable/disable individual payment methods (stored in `Setting`). Cash-on-delivery is confirmed directly (no gateway).
- Env: `PAYMOB_BASE_URL`, `PAYMOB_SECRET_KEY`, `PAYMOB_PUBLIC_KEY`, `PAYMOB_HMAC_SECRET`, `PAYMOB_INTEGRATION_ID`. Test keys wired; **integration-ID/account match still being finalised** in the Paymob dashboard.
- **Drop-specific rule (unchanged):** stock is decremented and piece numbers assigned only on the confirmed payment webhook. A 10-minute soft-hold (`InventoryHold`) at checkout start prevents overselling during drop rushes.
- Code lives in `src/lib/paymob.ts`, `src/lib/order-fulfill.ts`, `src/app/api/checkout/paymob/route.ts`, `src/app/api/webhooks/paymob/route.ts`.

## 🚚 Shipping (Phase 2 logic unchanged)
- Manual flat rates per region + free-shipping threshold at launch; Aramex/SMSA API later.
- Saudi address form: full name, +966 phone, city, district, street, building, postal code.

## 🏪 Saudi Trust & Compliance (unchanged — still required)
- Footer: Muthooq placeholder ("متجر موثوق | Verified Store"), VAT number [TBD], CR number [TBD], payment method logos, SSL badge.
- VAT 15%: stored excl., displayed incl., breakdown at checkout + PDF invoice (store name, CR, VAT no., items, piece numbers, VAT amount, total).

---

## 🗄️ Database Schema (Prisma) — v2

```
Drop
  - id, nameAr, nameEn, slug, status (teaser/live/soldout/archived),
    launchAt, teaserImage, heroImage, createdAt

Product
  - id, dropId, nameAr, nameEn, storyAr, storyEn, price, sku,
    totalPieces, images[], isActive

ProductVariant
  - id, productId, size, stock

Order
  - id, email?, phone, status, subtotal, shippingCost, vatAmount, total,
    paymentId, paymentStatus, paymentMethod, addressJson, createdAt

OrderItem
  - id, orderId, productId, variantId, quantity, unitPrice, pieceNumber

InventoryHold
  - id, variantId, quantity, expiresAt, checkoutSessionId

VaultMember
  - id, phone, email?, whatsappOptIn, joinedAt, source

User  (admin AND customers — role-based)
  - id, email? (unique), phone? (unique), passwordHash, name?,
    role (ADMIN/EMPLOYEE/CLIENT), addressJson?, vaultOptIn, createdAt
  - relations: orders[], wishlist[], cart

Cart  (server-synced cart for logged-in members)
  - id, userId (unique), itemsJson, updatedAt

WishlistItem
  - id, userId, productId, createdAt

HeroSlide  (owner-controlled homepage hero slides)
  - id, image, titleAr/En, subtitleAr/En, active, sortOrder

VerificationCode  (email verification + password reset)
  - id, email, purpose (EMAIL_VERIFY/PASSWORD_RESET), codeHash, expiresAt
  - hashed, 10-min expiry, one active code per (email, purpose)

Event  (first-party behaviour signal for recommendations)
  - id, userId?, anonId?, type (view/search/add_to_cart), productId?, query?, createdAt

Setting
  - key, value (shipping rates, thresholds, store identity, disabled payment methods)
```

> Note: the old `AdminUser` model is now the unified `User` model with a `role` field. Phone-OTP models (the retired Twilio flow) have been removed.

## 🔐 Security (unchanged from v1)
- Admin behind NextAuth; server-side session checks on all mutating routes; env vars for all secrets; rate-limit checkout + login + vault signup; sanitize inputs; HTTPS.
- Drop-day extra: rate-limit add-to-cart per IP; queue page if traffic spikes (simple "you're in line" holding state).

---

## 🎨 Design Direction

- **Palette:** near-black (#080808) base, off-white text, gold accent (exclusivity). One accent color only.
- **Type:** Space Grotesk (display/headlines), Space Mono (labels/prices), **Tajawal for Arabic** at weight 500+ (switched from Cairo 2026-06-24 — Cairo read too thin on the dark background).
- **Motion:** entrance gate, scroll-reveal sections, ticker bar (bilingual), product hover states, countdown flips. Framer Motion everywhere, but 60fps mobile is the law.
- **Photography:** this brand lives or dies on imagery. Square 1:1 product shots + cinematic 4:5 campaign shots. Shoot in the city — Riyadh locations are part of the identity.
- **Copy tone:** short, confident, slightly cocky. "Limited pieces. No restocks." / "قطع محدودة. ما فيه إعادة."

---

## 📋 Phases — v2 (restructured around launching a drop)

### Phase 0 — Brand (before any code)
- [ ] Brand name + logo + Instagram/TikTok handles secured
- [ ] Visual identity: palette, type, photography style
- [ ] First drop defined: 4–8 pieces, quantities, prices

### Phase 1 — The Machine  *(largely done)*
- [x] Next.js + Tailwind + next-intl + Prisma setup
- [x] Schema + migrations (live on Supabase)
- [x] Home (countdown + live modes), Drop page, Product page, Cart, Checkout
- [x] Inventory holds + piece numbering + shared `markOrderPaid` fulfilment
- [~] **Paymob** test-mode integration + HMAC webhook *(code done; finalising dashboard integration-ID/account match)*
- [x] Admin: drops, products, orders, payments toggle (perf-tuned: batched queries for the remote DB)
- [x] Catalogue seeded (~157 products / 29 categories); dual-state header + brand/category nav
- [x] Customer accounts: email-verified registration, login (email or phone), password reset (via Resend)
- [ ] The Entrance + The Vault capture

### Phase 2 — Hype Layer
- [ ] The Archive + Lookbook
- [ ] WhatsApp notifications (order updates + drop broadcasts)
- [ ] PDF invoices with piece numbers
- [ ] Instagram/TikTok feed embed as social proof

### Phase 3 — Legal & Live  *(in progress — onboarding payment gateways)*
- [ ] CR, VAT, Muthooq added to footer + invoices
- [ ] Terms/Privacy/Returns filled  ← **required for Paymob/Tap merchant approval**
- [ ] Paymob live keys + verified domain; full drop dry-run in test mode first
- [ ] Set production env vars on Netlify (`PAYMOB_*`, `RESEND_API_KEY`, `EMAIL_FROM`)

### Phase 4 — Scale
- [ ] Aramex/SMSA API, shipment tracking
- [ ] SEO (ar+en), Meta Pixel + TikTok Pixel (TikTok matters more than Google for this audience)
- [ ] Drop-day queue hardening

---

## ⚠️ Rules for the Developer
1. The countdown/live/soldout state lives in the DB — homepage flips without deploys.
2. Piece numbers assigned ONLY on payment confirmation webhook.
3. Never block a live drop with the entrance animation.
4. All copy through ar.json/en.json — and Arabic copy must sound like the street, not a corporation.
5. No discount/coupon code paths anywhere. Price integrity is brand integrity.
6. Store prices excl. VAT in halalas (integers); display incl. VAT.
7. +966 phone validation everywhere; WhatsApp is the primary customer channel.
8. Mobile-first always — assume 80%+ of traffic is phones.
