import { cache } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import type { SanityImageSource } from '@sanity/image-url'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import AddToCartButton from '@/components/AddToCartButton'
import { formatPrice } from '@/lib/format'
import { SITE_NAME, truncate } from '@/lib/site'

type Product = {
    _id: string
    name: string
    slug: string
    price: number
    description?: string
    image?: SanityImageSource
}

const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0]{
  _id,
  name,
  "slug": slug.current,
  price,
  description,
  image
}`

type PageProps = { params: Promise<{ slug: string }> }

// Shared by generateMetadata and the page so Sanity is only queried once per request.
const getProduct = cache((slug: string) =>
    client.fetch<Product | null>(PRODUCT_QUERY, { slug })
)

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product) return { title: 'Product not found' }

    const description = product.description?.trim()
        ? truncate(product.description)
        : `${product.name} for ${formatPrice(product.price)} at ${SITE_NAME}.`
    const ogImage = product.image
        ? {
              url: urlFor(product.image).width(1200).height(630).fit('crop').url(),
              width: 1200,
              height: 630,
              alt: product.name,
          }
        : undefined

    return {
        title: product.name,
        description,
        alternates: { canonical: `/products/${product.slug}` },
        openGraph: {
            type: 'website',
            siteName: SITE_NAME,
            title: `${product.name} | ${SITE_NAME}`,
            description,
            url: `/products/${product.slug}`,
            images: ogImage ? [ogImage] : undefined,
        },
        twitter: {
            card: ogImage ? 'summary_large_image' : 'summary',
            title: `${product.name} | ${SITE_NAME}`,
            description,
            images: ogImage ? [ogImage.url] : undefined,
        },
    }
}

export default async function ProductPage({ params }: PageProps) {
    const { slug } = await params
    const product = await getProduct(slug)

    if (!product) notFound()

    return (
        <main className="mx-auto max-w-4xl p-6">
            <Link href="/" className="text-sm text-gray-600 hover:underline">
                ← Back to shop
            </Link>

            <div className="mt-6 grid gap-8 md:grid-cols-2">
                {product.image && (
                    <Image
                        src={urlFor(product.image).width(800).height(800).url()}
                        alt={product.name}
                        width={800}
                        height={800}
                        className="rounded-lg"
                    />
                )}

                <div>
                    <h1 className="text-3xl font-bold">{product.name}</h1>
                    <p className="mt-2 text-2xl text-gray-700">{formatPrice(product.price)}</p>
                    {product.description && (
                        <p className="mt-4 text-gray-600">{product.description}</p>
                    )}

                    <AddToCartButton
                        product={{
                            id: product._id,
                            name: product.name,
                            slug: product.slug,
                            price: product.price,
                            imageUrl: product.image
                                ? urlFor(product.image).width(200).height(200).url()
                                : undefined,
                        }}
                    />
                </div>
            </div>
        </main>
    )
}