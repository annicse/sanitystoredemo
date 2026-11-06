# Sanity Store Demo

A demo e-commerce store built with Next.js (App Router), an embedded Sanity Studio and Stripe Checkout.

**Live demo: [sanitystoredemo.vercel.app](https://sanitystoredemo.vercel.app/)**

> **Stripe runs in test mode only.** No real payments are made. At the Stripe checkout page use the test card
> `4242 4242 4242 4242`, any future expiry date, any 3-digit CVC and any postal code.

This is a portfolio project, not a production shop: it has no user accounts, no order storage and no Stripe webhooks (see [Known limitations](#known-limitations)).

---

## Screenshots

<!--
  Add your screenshots to docs/screenshots/ and uncomment the lines below.

  ![Storefront](docs/screenshots/home.png)
  ![Product page](docs/screenshots/product.png)
  ![Cart](docs/screenshots/cart.png)
  ![Sanity Studio](docs/screenshots/studio.png)
-->

_Screenshots coming soon. See the live demo above._

---

## Features

- **Product catalog and product pages** with content, prices and images from Sanity, queried with GROQ.
- **Embedded Sanity Studio** mounted in the app at `/studio` (products and an About page).
- **Shopping cart**: a React context persisted to `localStorage`, kept in sync between browser tabs.
- **Stripe Checkout (test mode)**: the checkout session is created by `/api/checkout`, which re-reads every price from Sanity on the server.
- **Per-page metadata**: title template, description, canonical URL and an Open Graph image taken from the product image.
- **Accessibility work** targeting WCAG 2.2 AA (see [Accessibility](#accessibility)).

## Tech stack

- Next.js 16 (App Router) and React 19
- Sanity v5 with `next-sanity`, GROQ and `@portabletext/react`
- Stripe Checkout (`stripe` Node SDK)
- Tailwind CSS 4
- TypeScript, ESLint (with `eslint-plugin-jsx-a11y`)

---

## Architecture and decisions

### Why Sanity

Product data and the About page are content, not code. Keeping them in Sanity means they can be edited in the embedded Studio by someone who does not touch the codebase, and the storefront only needs a read-only query to display them. The schema is small and lives in `src/sanity/schemaTypes/` (`product`: name, slug, price in USD, image, description; `aboutPage`: title and rich text body).

### GROQ queries

Pages fetch exactly the fields they render, for example the product list:

```groq
*[_type == "product" && defined(slug.current)] | order(_createdAt desc) { _id, name, "slug": slug.current, price, image }
```

Queries are executed with the `next-sanity` client in server components (`src/sanity/lib/client.ts`). Images are turned into URLs with `@sanity/image-url`, served from `cdn.sanity.io` through `next/image`.

### How the server verifies prices

The browser is never trusted for prices.

1. The cart lives in the browser, but `CheckoutButton` only sends `{ id, quantity }` for each line to `POST /api/checkout`. No prices are sent.
2. The route re-fetches `_id, name, price, image` for those ids from Sanity (`*[_type == "product" && _id in $ids]`).
3. Each Stripe line item is built from the **Sanity** price (`unit_amount = Math.round(price * 100)`, currency `usd`). Lines whose id does not exist in Sanity, or whose quantity is not a whole number between 1 and 99, are dropped. If nothing valid is left the API answers `400`.
4. A Stripe Checkout Session (`mode: "payment"`) is created and the browser is redirected to Stripe's hosted page.

Because prices are re-read on the server, editing `localStorage` or the request body cannot change what is charged.

### How content updates appear on the site

| Route | Rendering | When a Studio edit shows up |
| --- | --- | --- |
| `/` (product list) | Static with `revalidate = 60` | Up to about a minute after publishing (see below) |
| `/about` | Static with `revalidate = 60` | Same |
| `/products/[slug]` | Rendered on demand per request | On the next request |
| `/api/checkout` | Dynamic | Reads Sanity on every checkout |

The two static pages use stale-while-revalidate: once the 60 second window has passed, the next visitor still gets the cached page and triggers a background refresh, and the visitor after that sees the edit. The Sanity client uses the API CDN (`useCdn: true`). There is no webhook-based on-demand revalidation; the delay is the trade-off.

### Cart

`src/context/CartContext.tsx` stores the cart under the `cart` key in `localStorage` and exposes it through `useSyncExternalStore`, so server and client render the same markup during hydration and other tabs stay in sync via the `storage` event. Stored data is validated when read, and quantities are capped at 99 to match the checkout API. Changes are announced to assistive technology through a polite live region.

### Known limitations

- `/success` does not verify the Stripe session: it clears the cart when the page loads. There are no webhooks and no order storage, since this demo only goes as far as Stripe's hosted payment page.
- Checkout prices are read through the same CDN-enabled Sanity client as the pages. For stricter freshness, the checkout route could use an uncached client.
- `/api/checkout` has no rate limiting.

---

## Accessibility

The storefront (not the Sanity Studio) targets WCAG 2.2 level AA. This is a self-check with the tools below, not a formal conformance audit.

**What was checked, and how**

- **Static analysis**: `eslint-plugin-jsx-a11y` with its full `recommended` rule set, run by `npm run lint`. No findings.
- **Automated browser check**: `npm run a11y` runs [axe-core](https://github.com/dequelabs/axe-core) through `@axe-core/playwright` (WCAG 2.0, 2.1 and 2.2 A/AA rule tags, including the 24x24 target size rule) on the home page, a product page, About, the empty cart, a cart with one item and the success page. No violations. It also asserts that adding to the cart is announced in the live region.
- **Manual keyboard walkthrough** in Chrome: skip link, tab order, adding to the cart, changing quantity and removing an item using the keyboard only; focus indicators checked visually.
- **Colour contrast**: body and muted text use `#171717` and `#374151` on white (10.3:1 or better), error text `#b91c1c` (6.5:1), focus ring `#1d4ed8` (6.7:1 against white).

**What the code does**

- Landmarks: `header`, `nav` (labelled, `aria-current` on the active link), a single `main`, `footer`; a "Skip to main content" link.
- Visible `:focus-visible` outline on all interactive elements; real `<button>` and `<a>` elements are used for actions and navigation respectively.
- Cart changes ("added", "removed", new quantity) are announced via an `aria-live="polite"` status region; checkout errors use `role="alert"`.
- Icon-style controls (`+`, `-`, Remove) have accessible names that include the product name; the cart shows a loading state instead of a false "empty" message while it is read from storage; focus moves to the cart heading after an item is removed.
- Product card and cart thumbnails use empty `alt` text because the product name sits right next to them; the product page image uses the product name as alt text.
- A single `h1` per page with a logical heading order; decorative emoji are hidden from screen readers.
- Light theme only; `prefers-reduced-motion` is respected (the shop currently has no animations).
- Interactive targets are at least 24x24 CSS pixels.

**Not covered**

- Automated tools find only a subset of issues. The site has **not** been tested with a screen reader (VoiceOver, NVDA) or with 200% zoom and 320px reflow.
- The Sanity Studio is a third-party UI and was not audited.
- Rich text from Sanity (About page) is rendered as authored, so heading levels in that content depend on the editor.

---

## Project structure

```text
src/
├── app/
│   ├── (shop)/                # Storefront routes sharing the header/footer layout
│   │   ├── about/             # About page (content from Sanity)
│   │   ├── cart/              # Cart and checkout trigger
│   │   ├── products/[slug]/   # Product page (+ generateMetadata)
│   │   ├── success/           # Page Stripe redirects to after payment
│   │   └── page.tsx           # Product list
│   ├── api/checkout/          # Creates the Stripe Checkout Session (verifies prices server-side)
│   └── studio/[[...tool]]/    # Embedded Sanity Studio
├── components/                # Header, Footer, AddToCartButton, CheckoutButton
├── context/                   # CartContext (localStorage-backed cart + live region)
├── lib/                       # formatPrice (Intl.NumberFormat), site constants
└── sanity/                    # Sanity env, client, image URL builder, schemas, Studio structure
scripts/
└── a11y-check.mjs             # axe-core / Playwright accessibility check
```

## Getting started

Requires Node.js 20+ and a Sanity project with a dataset (the Studio at `/studio` lets you add products).

```bash
npm install
cp .env.example .env.local   # then fill in your own values
npm run dev
```

- Storefront: `http://localhost:3000`
- Sanity Studio: `http://localhost:3000/studio` (add `http://localhost:3000` and your deployed URL as CORS origins in your Sanity project settings so the Studio can sign in)

### Environment variables

See [`.env.example`](.env.example). Never commit `.env.local`.

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | yes | Sanity project id |
| `NEXT_PUBLIC_SANITY_DATASET` | yes | Sanity dataset, e.g. `production` |
| `NEXT_PUBLIC_SANITY_API_VERSION` | no | Overrides the default API version in `src/sanity/env.ts` |
| `STRIPE_SECRET_KEY` | yes | Stripe **test** secret key (`sk_test_...`), server-side only |
| `NEXT_PUBLIC_SITE_URL` | yes | Public site URL, used for Stripe success/cancel redirects and absolute metadata URLs |

### Scripts

- `npm run dev` - start the development server
- `npm run build` - production build
- `npm run start` - run the production build
- `npm run lint` - ESLint (includes `jsx-a11y`)
- `npm run a11y` - axe-core accessibility check against a running site (defaults to `http://localhost:3000`; override with `A11Y_BASE_URL`). Needs Google Chrome installed.
