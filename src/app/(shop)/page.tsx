import Image from 'next/image'
import Link from 'next/link'
import type { SanityImageSource } from '@sanity/image-url'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

type Product = {
  _id: string
  name: string
  slug: string
  price: number
  image?: SanityImageSource
}

const PRODUCTS_QUERY = `*[_type == "product" && defined(slug.current)] | order(_createdAt desc) {
  _id,
  name,
  "slug": slug.current,
  price,
  image
}`

export default async function Home() {
  const products = await client.fetch<Product[]>(PRODUCTS_QUERY)

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-6 text-3xl font-bold">Shop</h1>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-3">
        {products.map((p) => (
          <Link key={p._id} href={`/products/${p.slug}`} className="group">
            {p.image && (
              <Image
                src={urlFor(p.image).width(600).height(600).url()}
                alt={p.name}
                width={600}
                height={600}
                className="rounded-lg"
              />
            )}
            <h2 className="mt-2 font-medium group-hover:underline">{p.name}</h2>
            <p className="text-gray-600">${p.price}</p>
          </Link>
        ))}
      </div>
    </main>
  )
}