import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import type { SanityImageSource } from '@sanity/image-url'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

type CartInput = { id: string; quantity: number }[]

type SanityProduct = {
    _id: string
    name: string
    price: number
    image?: SanityImageSource
}

export async function POST(req: Request) {
    try {
        const { items } = (await req.json()) as { items: CartInput }

        if (!Array.isArray(items) || items.length === 0) {
            return NextResponse.json({ error: 'Cart is empty' }, { status: 400 })
        }

        // Fetch the real prices from Sanity (prices sent by the browser are never trusted)
        const ids = items.map((i) => i.id)
        const products = await client.fetch<SanityProduct[]>(
            `*[_type == "product" && _id in $ids]{ _id, name, price, image }`,
            { ids }
        )

        const lineItems = items.flatMap((item) => {
            const product = products.find((p) => p._id === item.id)
            const quantity = Math.floor(Number(item.quantity))
            if (!product || !(quantity >= 1) || quantity > 99) return []

            return [
                {
                    quantity,
                    price_data: {
                        currency: 'usd',
                        unit_amount: Math.round(product.price * 100), // in cents
                        product_data: {
                            name: product.name,
                            images: product.image
                                ? [urlFor(product.image).width(600).height(600).url()]
                                : [],
                        },
                    },
                },
            ]
        })

        if (lineItems.length === 0) {
            return NextResponse.json({ error: 'No valid items' }, { status: 400 })
        }

        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL!

        const session = await stripe.checkout.sessions.create({
            mode: 'payment',
            line_items: lineItems,
            success_url: `${siteUrl}/success`,
            cancel_url: `${siteUrl}/cart`,
        })

        return NextResponse.json({ url: session.url })
    } catch (err) {
        console.error(err)
        return NextResponse.json({ error: 'Checkout failed' }, { status: 500 })
    }
}