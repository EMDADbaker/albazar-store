# ALBAZAR Speed Improvement Plan

Date: 2026-06-18  
Project: ALBAZAR Saudi streetwear drop machine  
Goal: Make product-card taps and storefront browsing feel fast on mobile, using the URBNLOT comparison as reference.

## Executive Summary

The current homepage Lighthouse score is strong compared with URBNLOT, but product navigation is slower because ALBAZAR waits on slow server-rendered route payloads and backend calls before the product page appears.

The main issue is not CSS or click handling. The Chrome trace showed click handlers were tiny, usually around 1-6 ms. The delay comes from network/server work, especially Next.js RSC route requests such as:

- `/en/product/AZ001-TOTE-VAULT?_rsc=...` at about 7.3 s
- `/en/product/AZ001-SHOE-STREET?_rsc=...` at about 3.9 s
- `/en/brand/gramicci?_rsc=...` at about 4.0 s
- `/api/recommendations` at about 5.3 s

URBNLOT performs worse overall in Lighthouse, but its product document response was much faster, around 600 ms in the captured HAR. That is the useful lesson: make product pages return usable content quickly, then hydrate or fetch secondary features afterward.

## Evidence From Reports

### Lighthouse

Albazar homepage:

- Performance: 88
- FCP: 1.67 s
- LCP: 3.17 s
- TBT: 88 ms
- CLS: 0
- Interactive: 3.86 s
- Total payload: 601 KB
- Initial server response: 637 ms

URBNLOT homepage:

- Performance: 32
- FCP: 2.42 s
- LCP: 9.82 s
- TBT: 595 ms
- CLS: 0.388
- Interactive: 15.52 s
- Total payload: 3.48 MB
- Initial server response: 84 ms

Conclusion: ALBAZAR is lighter and cleaner on homepage load, but URBNLOT has a faster commerce/server response path.

### HAR

The ALBAZAR HAR captured admin pages, not the public storefront flow, so it is not an apples-to-apples comparison. It still revealed problems:

- `desert-dune.jpg`: 10.4 MB, about 9.2 s
- `orange-sky.jpg`: 2.5 MB, about 7.1 s
- `king-01.jpg`: 804 KB, about 4.8 s
- `/admin` document TTFB: about 4.26 s
- Admin POSTs: about 3.4-5.2 s

URBNLOT product-page HAR:

- Product document: about 600 ms
- Largest product images: 654 KB, 420 KB, 238 KB
- Many third-party requests, but product HTML arrives quickly

Conclusion: optimize ALBAZAR images and server responses. Retake a correct public product-click HAR after fixes.

### Performance Trace

ALBAZAR:

- Main thread is not the primary bottleneck.
- Product and brand RSC payloads are slow.
- Recommendations API is slow.
- Product-card click itself is fast.

URBNLOT:

- Much heavier JavaScript and third-party work.
- More long tasks.
- Faster product navigation/server response.

Conclusion: ALBAZAR can beat URBNLOT if product route latency and image weight are fixed.

## Priority 0: Retest Correctly

Before and after every optimization, capture the same flow:

1. Open Chrome DevTools.
2. Network tab: enable Preserve log and Disable cache.
3. Use mobile throttling if comparing mobile.
4. Visit `/en`.
5. Tap one product card.
6. Wait until product page is fully visible.
7. Save all as HAR with content.
8. Record a Performance trace for the same click.
9. Run Lighthouse for `/en` and one product page.

Name files like:

- `albazar-home-after.har`
- `albazar-product-click-after.har`
- `albazar-product-trace-after.json.gz`
- `albazar-product-lighthouse-after.json`

## Priority 1: Make Product Route Render Fast

Current problem area:

- `src/app/[locale]/product/[slug]/page.tsx`

The product page currently waits for:

- Product data
- Translations
- Related products
- Current user session
- Wishlist DB lookup
- Nav component server work

Recommended changes:

1. Render core product content first.
2. Move wishlist state to a client component that fetches after render.
3. Move recommendations/related products below the fold or load them after render.
4. Parallelize independent server work with `Promise.all`.
5. Keep the first render focused on product title, price, image, size, stock, and add-to-cart.

Target:

- Product RSC request under 800 ms warm.
- Product card tap shows a loading state immediately.
- Product page useful content visible under 2 s on mobile.

Suggested structure:

```tsx
const productPromise = getProductBySlug(slug);
const translationsPromise = getTranslations('Product');

const [product, t] = await Promise.all([
  productPromise,
  translationsPromise,
]);
```

Then defer:

- Wishlist
- Related products
- Recommendations
- View tracking
- Account-specific UI

## Priority 2: Add Instant Loading UI

Add:

- `src/app/[locale]/product/[slug]/loading.tsx`
- `src/app/[locale]/brand/[slug]/loading.tsx`
- `src/app/[locale]/category/[slug]/loading.tsx`

The loading screen should match the product layout with image and text skeletons. This makes a tap feel immediate even if the server takes longer.

Best practice:

- Keep skeletons simple.
- Avoid animation-heavy shimmer on mobile.
- Use fixed aspect ratios so layout does not jump.

Target:

- Visual response within 100 ms after tap.
- No blank wait between product card and product page.

## Priority 3: Fix Mobile Prefetch

Current problem area:

- `src/components/ShopProductCard.tsx`

The card currently prefetches on `onMouseEnter`, which helps desktop hover but does not help mobile.

Recommended changes:

1. Allow Next.js `Link` prefetch where appropriate.
2. Prefetch when cards enter viewport on mobile.
3. Avoid prefetching every product if the grid is huge.
4. Prefetch only the first 4-8 visible product cards.

Suggested approach:

- Use default `Link` prefetch for critical product cards.
- For large grids, create a small `PrefetchOnVisible` helper using `IntersectionObserver`.

Target:

- Product route payload is already requested before the shopper taps.
- First-screen product cards feel near-instant on mobile.

## Priority 4: Defer Recommendations

Current problem area:

- `src/app/api/recommendations/route.ts`
- `src/lib/recommend.ts`

Trace evidence:

- `/api/recommendations` took about 5.3 s.

Recommended changes:

1. Never block product page render on recommendations.
2. Use client-side fetch after idle time.
3. Add a timeout fallback.
4. Cache recommendation results for anonymous users.
5. Limit query size and selected fields.

Suggested client behavior:

- Render product page.
- After `requestIdleCallback`, fetch recommendations.
- If request takes more than 1.5 s, hide the section or show a simple fallback.

Target:

- Recommendations do not affect LCP or product tap responsiveness.
- API returns under 500 ms warm.

## Priority 5: Reduce Nav Server Work

Current problem area:

- `src/components/Nav.tsx`

The Nav fetches:

- Categories
- Brands
- Current user session

This runs on product pages too. Categories and brands are cached, but session still makes every page more dynamic.

Recommended changes:

1. Split Nav into static/catalog nav and account state.
2. Render categories/brands from cached server data.
3. Load account/session state in a small client component after render.
4. Avoid making every public product page wait for `getCurrentUser`.

Target:

- Public product page should not wait on account/session unless absolutely required.
- Logged-out users should get fully cacheable public pages.

## Priority 6: Optimize Images

Problems found:

- Some campaign images are extremely large.
- The biggest captured image was 10.4 MB.

Recommended changes:

1. Convert large JPGs to WebP or AVIF.
2. Resize public images to realistic display sizes:
   - Mobile hero: 750-1000 px wide
   - Desktop hero: 1600-2200 px wide
   - Product card: 600-900 px wide
   - Thumbnails: 150-300 px wide
3. Store original master files outside the deployed public path.
4. Use Cloudinary transformations for production images.
5. Use `next/image` for all public storefront images.

Target:

- Hero image under 300-500 KB.
- Product card image under 100-200 KB.
- Product gallery image under 300-700 KB.
- No single storefront image over 1 MB unless truly necessary.

## Priority 7: Improve Server and Database Performance

Likely causes:

- Serverless cold starts
- Supabase round trips
- Sequential DB queries
- Session checks on public pages
- RSC payload generation waiting on too much work

Recommended changes:

1. Use `Promise.all` for independent queries.
2. Select only needed fields in Prisma queries.
3. Avoid `include` trees when a lightweight `select` is enough.
4. Add indexes for hot lookups:
   - `Product.sku`
   - `Product.isActive`
   - `Drop.status`, `Drop.published`
   - `WishlistItem.userId_productId`
   - `Event.userId`, `Event.anonId`, `Event.productId`
5. Cache public catalog data with `unstable_cache`.
6. Avoid authenticated/session APIs in public render paths.
7. Consider Vercel for Next.js App Router hosting if Netlify RSC/serverless latency remains high after code fixes.

Target:

- Public product RSC under 800 ms warm.
- Public homepage TTFB under 300 ms warm.
- Admin operations under 1.5 s warm.

## Priority 8: Add Performance Budgets

Add budgets and enforce them manually at first:

- Homepage Lighthouse Performance: 90+
- Product page Lighthouse Performance: 85+
- Product-card tap to visible skeleton: under 100 ms
- Product-card tap to useful product content: under 2 s
- Product RSC warm request: under 800 ms
- Homepage transferred bytes: under 1 MB
- Product page transferred bytes: under 1.5 MB
- Any single storefront image: under 1 MB
- Total Blocking Time: under 200 ms
- CLS: under 0.05

Later, add automated Lighthouse CI.

## Priority 9: Keep UI Fast By Design

Coding best practices:

1. Server components by default.
2. Client components only for interaction.
3. Do not put session-dependent UI in the critical server render path.
4. Do not fetch wishlist/recommendations before product content.
5. Avoid loading modal code until opened.
6. Keep product cards simple.
7. Use stable image dimensions and aspect ratios.
8. Avoid layout shifts by reserving space for images and skeletons.
9. Keep animations transform/opacity only.
10. Respect `prefers-reduced-motion`.
11. Avoid heavy carousels above the fold unless they are essential.
12. Do not ship admin/client code to public storefront routes.

## Priority 10: Platform Strategy

Do not rebuild from scratch yet.

The stack is still right for ALBAZAR because the brand needs a custom drop engine:

- DB-controlled drop states
- Entrance overlay
- Vault
- Numbered pieces
- Payment webhook inventory logic
- Archive
- Arabic/English custom tone

But the implementation should become more focused:

- Drop-first homepage
- Faster public product path
- Less generic e-commerce feature weight
- More cacheable public pages
- Deferred personalization

URBNLOT is useful as a speed reference for product response, not as a full quality target. Their Lighthouse score is much worse, but their product navigation path is faster.

## Implementation Order

### Day 1

1. Add loading skeletons for product, brand, and category pages.
2. Move wishlist state out of the blocking product page render.
3. Disable or defer recommendations from critical path.
4. Retest product click.

### Day 2

1. Split Nav account state from catalog nav.
2. Improve product-card mobile prefetch.
3. Parallelize product-page queries.
4. Retest product click and Lighthouse.

### Day 3

1. Compress and resize campaign/product images.
2. Replace oversized public images.
3. Confirm `next/image` is used where possible.
4. Retest homepage and product page.

### Day 4

1. Optimize Prisma queries and selected fields.
2. Add missing indexes if needed.
3. Cache public catalog/drop data.
4. Retest RSC request timings.

### Day 5

1. Create final before/after report.
2. Decide if Netlify hosting is still acceptable.
3. If server latency remains high, test Vercel deployment for comparison.

## Retest Checklist

After each batch of changes, record:

- Lighthouse homepage mobile
- Lighthouse product page mobile
- HAR for `/en` to product click
- Performance trace for product click
- Largest image sizes
- Slowest RSC requests
- `/api/recommendations` timing

Success looks like:

- Product card tap shows immediate skeleton.
- Product content appears in under 2 s on mobile.
- Product RSC requests stay under 800 ms warm.
- No product or campaign image is multi-megabyte.
- Recommendations never block the product page.
- Lighthouse remains 85+ for product pages and 90+ for homepage.

## First Code Changes To Make

Start with these files:

- `src/app/[locale]/product/[slug]/page.tsx`
- `src/app/[locale]/product/[slug]/loading.tsx`
- `src/components/ShopProductCard.tsx`
- `src/components/Nav.tsx`
- `src/app/api/recommendations/route.ts`
- `src/lib/recommend.ts`

The first pass should focus on perceived speed:

1. Add loading skeleton.
2. Defer wishlist.
3. Defer recommendations.
4. Improve prefetch.
5. Retest.

This will address the exact symptom: product cards feeling like they take 10 seconds to open.
