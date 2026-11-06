import { cache } from 'react'
import Link from 'next/link'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PortableText, type PortableTextBlock } from '@portabletext/react'
import { client } from '@/sanity/lib/client'

type AboutPage = {
    title: string
    body?: PortableTextBlock[]
}

const ABOUT_QUERY = `*[_type == "aboutPage"][0]{ title, body }`

// Shared by generateMetadata and the page so Sanity is only queried once per render.
const getAboutPage = cache(() => client.fetch<AboutPage | null>(ABOUT_QUERY))

// Re-fetch from Sanity at most once a minute so Studio edits show up without a redeploy.
export const revalidate = 60

export async function generateMetadata(): Promise<Metadata> {
    const page = await getAboutPage()
    // The "| Sanity Store Demo" suffix comes from the title template in the (shop) layout.
    return { title: page?.title ?? 'About' }
}

export default async function AboutPage() {
    const page = await getAboutPage()

    if (!page) notFound()

    return (
        <main className="mx-auto max-w-3xl p-6">
            <h1 className="text-3xl font-bold">{page.title}</h1>

            <div className="mt-6">
                {page.body && <PortableText value={page.body} />}
            </div>

            <Link href="/" className="mt-8 inline-block underline">
                ← Back to shop
            </Link>
        </main>
    )
}
