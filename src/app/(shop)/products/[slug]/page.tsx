import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import AddToCartButton from '@/components/AddToCartButton'

type Product = {
    _id: string
    name: string
    slug: string
    price: number
    description?: string
    image?: any
}

const PRODUCT_QUERY = `*[_type == "product" && slug.current == $slug][0]{
  _id,
  name,
  "slug": slug.current,
  price,
  description,
  image
}`

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const { slug } = await params
    const product = await client.fetch<Product | null>(PRODUCT_QUERY, { slug })

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
                    <p className="mt-2 text-2xl text-gray-700">${product.price}</p>
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