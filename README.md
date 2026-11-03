# Sanity Store Demo

A full-stack demo e-commerce store built with Next.js (App Router), an embedded Sanity Studio CMS, and Stripe Checkout.

---

## Overview

This project is a minimal, working store prototype:
- **Product Catalog & Detail Pages**: Fetches products, pricing, and images directly from Sanity using GROQ queries.
- **Embedded Sanity Studio**: Studio is mounted directly inside the app at `/studio`, allowing easy management of products and page content without a separate deployment.
- **Shopping Cart**: Client-side cart backed by React context and persisted to `localStorage`.
- **Secure Stripe Checkout**: Checkout sessions are created via `/api/checkout`, where product prices are re-verified against Sanity on the server to prevent client-side tampering.
- **Content Pages**: Includes a dynamic About page managed through Sanity and a post-purchase success confirmation screen.

---

## Tech Stack

- **Framework**: Next.js 16 (App Router) & React 19
- **CMS**: Sanity (v5) with GROQ
- **Payments**: Stripe Checkout
- **Styling**: Tailwind CSS
- **Language**: TypeScript

---

## Project Structure

```text
src/
├── app/
│   ├── (shop)/
│   │   ├── about/             # About page (content from Sanity)
│   │   ├── cart/              # Cart view & checkout trigger
│   │   ├── products/[slug]/   # Individual product page
│   │   ├── success/           # Stripe payment success redirect
│   │   └── page.tsx           # Storefront product list
│   ├── api/
│   │   └── checkout/          # Stripe checkout session API route
│   └── studio/[[...tool]]/    # Embedded Sanity Studio route
├── components/                # UI components (Header, AddToCart, CheckoutButton)
├── context/                   # CartContext with localStorage persistence
└── sanity/
    ├── schemaTypes/           # Sanity schemas (products, about page)
    └── lib/                   # Sanity client, image URL builder, queries
```

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SANITY_PROJECT_ID="your_project_id"
NEXT_PUBLIC_SANITY_DATASET="production"
SANITY_PROJECT_ID="your_project_id"
SANITY_DATASET="production"
STRIPE_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```

### 3. Run the development server

```bash
npm run dev
```

- Storefront: `http://localhost:3000`
- Sanity Studio: `http://localhost:3000/studio`

---

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build the production bundle
- `npm run start` - Run the production build locally
- `npm run lint` - Run ESLint checks
