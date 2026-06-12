# ALBAZAR — Saudi Streetwear Drop Machine

Bilingual (ar default + RTL / en) streetwear e-commerce for Saudi Gen Z.
Drop-based model: TEASE → COUNTDOWN → DROP → SELL OUT → ARCHIVE.
Full project spec: read `PROJECT_BRIEF.md` before starting any major feature.
Design reference for the entrance + countdown homepage: open `design-reference.html` in a browser.

## Stack
- Next.js 14 (App Router) + React + TypeScript
- Tailwind CSS + RTL support, Framer Motion for animation
- Prisma + PostgreSQL (Supabase), NextAuth (admin only)
- next-intl: /messages/ar.json + /messages/en.json — ZERO hardcoded strings
- Payments: Moyasar (Mada, Visa/MC, Apple Pay, STC Pay, Tabby, Tamara)
- Images: Cloudinary. Hosting: Vercel + Supabase.

## Commands
- `npm run dev` — dev server
- `npm run build` — production build
- `npx prisma migrate dev` — run migrations
- `npx prisma studio` — inspect DB

## Hard rules (never violate)
1. Homepage state (countdown/live/soldout) lives in the DB — flips without deploys.
2. Piece numbers ("07 / 150") assigned ONLY on confirmed Moyasar payment webhook, never at add-to-cart.
3. Inventory: 10-min soft-hold at checkout start (InventoryHold model); decrement stock only on webhook.
4. The Entrance overlay: first visit only (localStorage), auto-skipped during live drops, max 4s, always skippable.
5. No discount/coupon code paths anywhere. No restocks. Exclusivity is the brand.
6. Prices stored excl. VAT in halalas (integers); displayed incl. 15% VAT with "شامل ضريبة القيمة المضافة".
7. +966 phone validation on all forms; WhatsApp is the primary customer channel, email secondary.
8. All copy via ar.json/en.json. Arabic tone = Riyadh street Gen Z, not corporate.
9. Mobile-first: 60fps animations on mid-range phones; no heavy WebGL on mobile (lightweight particle fallback or video).
10. Admin routes: server-side session checks on every mutating endpoint.

## Conventions
- Server components by default; client components only when interactive.
- TypeScript strict; no `any`.
- Design tokens: bg #080808, text #f0f0f0, accent gold #C8A050 (only accent). Fonts: Space Grotesk (display), Space Mono (labels/prices), Cairo (Arabic).
- Commit style: imperative, max 72 chars.

## Current phase
Phase 1 — The Machine (see PROJECT_BRIEF.md → Phases). Build order:
schema → home (countdown+live modes) → drop/product pages → cart/checkout → Moyasar test mode + webhook → admin (drops/products/orders) → Entrance + Vault.
