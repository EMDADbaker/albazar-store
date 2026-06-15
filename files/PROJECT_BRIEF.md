# 🖤 ALBAZAR — Project Brief v2 (The Drop Machine)

## What This Is
ALBAZAR (البازار) is a bilingual (Arabic/English) streetwear e-commerce site for the Saudi market, targeting Gen Z (18–28). This is NOT a general store — it is a **drop-based hype machine**. Limited pieces, numbered items, countdown launches, no discounts, no restocks. The owner has full ownership of code, data, and infrastructure.

Brand positioning: **exclusive, elevated, Riyadh-coded.** The visitor should feel like they discovered something, not like they walked into a mall.

---

## 🔁 The Core Loop (everything serves this)

```
TEASE → COUNTDOWN → DROP → SELL OUT → ARCHIVE → repeat
```

- Between drops: homepage = cinematic countdown + teaser. No product grid.
- During a drop: homepage = live collection, stock counters, buy fast.
- After sellout: pieces move to The Archive with SOLD OUT stamps. Demand becomes marketing.

---

## 🧱 Tech Stack (unchanged — still own everything)

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) + React |
| Styling | Tailwind CSS (+ RTL plugin) |
| Animations | Framer Motion (entrance, scroll reveals, countdown) |
| Backend | Next.js API Routes |
| Database | PostgreSQL (Supabase) |
| ORM | Prisma |
| Auth (admin only) | NextAuth.js |
| Payments | Moyasar (Mada, Visa/MC, Apple Pay, STC Pay, Tabby, Tamara) |
| Notifications | WhatsApp Business API (or Twilio WhatsApp) — primary channel; email secondary |
| Images | Cloudinary |
| Hosting | Vercel + Supabase |
| i18n | next-intl (ar default, en secondary, full RTL) |

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
7. **Cart + Checkout** — guest checkout, Saudi address form, Moyasar payment
8. **Order confirmation** — order number, piece number(s), invoice download, WhatsApp updates opt-in
9. **Info pages** — About (brand story), Contact (WhatsApp-first), Terms / Privacy / Returns (placeholders, owner fills later)

### Admin (NextAuth-protected)
1. **Drops manager** — create a drop: name, launchAt, teaser image, pieces, quantities. One button: "Schedule drop."
2. **Products manager** — pieces belong to drops; images via Cloudinary; sizes as variants with per-size stock
3. **Orders manager** — list, status flow (paid → packed → shipped → delivered), invoice regeneration
4. **Vault manager** — waitlist list, export, broadcast announcement
5. **Settings** — store identity, shipping rates per region, free-shipping threshold

Cut from v1: coupons (no discounts — exclusivity), reviews (social proof comes from Instagram/TikTok embeds instead), customer accounts at launch (guest checkout + WhatsApp updates; accounts can come later if needed).

---

## 🌐 Bilingual & RTL (unchanged from v1, still strict)
- next-intl, /messages/ar.json + /messages/en.json, zero hardcoded strings.
- Arabic default + full RTL; language switch in nav.
- Prices: `٣٤٩ ر.س` (ar) / `SAR 349` (en), VAT-inclusive display with "شامل ضريبة القيمة المضافة 15%".
- Brand voice in Arabic should be street, not formal — write ar.json copy like Riyadh Gen Z talks, not like a bank.

## 💳 Payments — Moyasar (unchanged from v1)
- Mada, Visa/MC, Apple Pay, STC Pay, Tabby, Tamara via hosted form / moyasar.js.
- Webhooks for payment status; store payment_id/status/method; never touch card data.
- **Drop-specific rule:** stock is decremented and piece numbers assigned only on confirmed payment webhook. A 10-minute soft-hold on inventory at checkout start prevents overselling during drop rushes.

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

AdminUser
  - id, email, passwordHash, role

Setting
  - key, value (shipping rates, thresholds, store identity)
```

## 🔐 Security (unchanged from v1)
- Admin behind NextAuth; server-side session checks on all mutating routes; env vars for all secrets; rate-limit checkout + login + vault signup; sanitize inputs; HTTPS.
- Drop-day extra: rate-limit add-to-cart per IP; queue page if traffic spikes (simple "you're in line" holding state).

---

## 🎨 Design Direction

- **Palette:** near-black (#080808) base, off-white text, gold accent (exclusivity). One accent color only.
- **Type:** a bold display sans for headlines (e.g., Space Grotesk), mono for labels/prices (Space Mono), Cairo for Arabic — test Arabic headlines at heavy weights.
- **Motion:** entrance gate, scroll-reveal sections, ticker bar (bilingual), product hover states, countdown flips. Framer Motion everywhere, but 60fps mobile is the law.
- **Photography:** this brand lives or dies on imagery. Square 1:1 product shots + cinematic 4:5 campaign shots. Shoot in the city — Riyadh locations are part of the identity.
- **Copy tone:** short, confident, slightly cocky. "Limited pieces. No restocks." / "قطع محدودة. ما فيه إعادة."

---

## 📋 Phases — v2 (restructured around launching a drop)

### Phase 0 — Brand (before any code)
- [ ] Brand name + logo + Instagram/TikTok handles secured
- [ ] Visual identity: palette, type, photography style
- [ ] First drop defined: 4–8 pieces, quantities, prices

### Phase 1 — The Machine
- [ ] Next.js + Tailwind + next-intl + Prisma setup
- [ ] Schema + migrations
- [ ] Home (countdown + live modes), Drop page, Product page, Cart, Checkout
- [ ] Moyasar test-mode integration + webhook + inventory holds + piece numbering
- [ ] Admin: drops, products, orders
- [ ] The Entrance + The Vault capture

### Phase 2 — Hype Layer
- [ ] The Archive + Lookbook
- [ ] WhatsApp notifications (order updates + drop broadcasts)
- [ ] PDF invoices with piece numbers
- [ ] Instagram/TikTok feed embed as social proof

### Phase 3 — Legal & Live
- [ ] CR, VAT, Muthooq added to footer + invoices
- [ ] Terms/Privacy/Returns filled
- [ ] Moyasar live keys; full drop dry-run in test mode first

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
