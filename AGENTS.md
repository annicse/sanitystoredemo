<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project guide

## Overview

Sanity Store Demo is a portfolio demo store: Next.js (App Router) + an embedded Sanity Studio (`/studio`) + Stripe Checkout in **test mode only** + Tailwind CSS 4 + TypeScript. Live at https://sanitystoredemo.vercel.app/. The README is the user-facing documentation; keep it accurate.

## Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server on http://localhost:3000 |
| `npm run build` | Production build (also type-checks) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint, including the full `jsx-a11y` recommended rules |
| `npm run a11y` | axe-core check against a running site (`A11Y_BASE_URL`, default `http://localhost:3000`); needs Google Chrome |

Run `npm run lint` and `npm run build` before every commit. Both must pass.

## Folder structure

- `src/app/(shop)/` storefront routes sharing one layout (skip link, header, single `<main id="main-content">`, footer): `page.tsx` (product list), `products/[slug]`, `cart`, `success`, `about`.
- `src/app/api/checkout/route.ts` creates the Stripe Checkout Session.
- `src/app/studio/[[...tool]]/` the embedded Sanity Studio. It is outside the `(shop)` layout on purpose.
- `src/components/` Header, Footer, AddToCartButton, CheckoutButton.
- `src/context/CartContext.tsx` cart state (localStorage via `useSyncExternalStore`) and the cart live region.
- `src/lib/` `format.ts` (`formatPrice`), `site.ts` (site name/description/URL helpers).
- `src/sanity/` env, client, image URL builder, schemas (`schemaTypes/`), Studio structure.
- `scripts/a11y-check.mjs` the axe/Playwright check.

## Conventions

- TypeScript strict. No `any`; type Sanity images as `SanityImageSource`.
- Server components by default; add `'use client'` only where state, effects or browser APIs are needed.
- Fetch Sanity data in server components with the client from `src/sanity/lib/client.ts`. Use React `cache()` when `generateMetadata` and the page need the same query.
- Format every displayed price with `formatPrice()` from `src/lib/format.ts` (never `$${price}`).
- Page titles: set `title` in page/layout metadata; the ` | Sanity Store Demo` suffix comes from the template in `src/app/(shop)/layout.tsx`, so do not repeat it.
- Environment variables are listed in `.env.example`. Add any new variable there (with a placeholder value) and in the README table.
- Comments, UI text and docs are in English.
- Small, focused commits with clear messages.

## Accessibility rules (WCAG 2.2 AA)

- Use `<button>` for actions and `<a>`/`next/link` for navigation. Never put click handlers on non-interactive elements.
- Every page keeps one `h1` and a logical heading order. Pages must not render their own `<main>`; the shop layout provides it.
- Icon-only or glyph-only controls need an accessible name (`aria-label`) that includes what they act on.
- Images: meaningful `alt` text, or `alt=""` when the adjacent text already names the image.
- Changes that add, remove or alter cart items must go through `CartContext` so they are announced in the live region.
- Keep focus styles visible (`.shop :focus-visible` in `globals.css`) and interactive targets at least 24x24 CSS px.
- Do not reintroduce dark mode without checking contrast of every text/background pair.
- Run `npm run lint` (jsx-a11y) and `npm run a11y` after UI changes.

## Do and don't

- **Never trust client-side prices.** `/api/checkout` receives only `{ id, quantity }` and re-reads prices from Sanity on the server. Do not change this to accept prices, names or currencies from the request, and do not weaken the quantity and id validation.
- **Never commit secrets.** `.env*` is git-ignored except `.env.example`. Do not print, log or paste real keys, and do not add secrets to `NEXT_PUBLIC_*` variables (they are exposed to the browser). Stripe must stay in test mode (`sk_test_...`).
- Do not invent features in docs; only document what the code does.
- Do not add npm dependencies without a clear need.
- Keep content in Sanity; do not hard-code product data in the frontend.

## Testing and CI

Automated checks today: `npm run lint`, `npm run build` and `npm run a11y`. There is no unit-test suite or CI workflow yet.
