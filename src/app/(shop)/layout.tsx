import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { SITE_NAME } from '@/lib/site'

// The template applies to every page below this layout (not to the Studio).
export const metadata: Metadata = {
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
}

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="shop flex flex-1 flex-col">
            <a
                href="#main-content"
                className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-black focus:px-4 focus:py-2 focus:text-white"
            >
                Skip to main content
            </a>
            <Header />
            {/* Single main landmark for all shop pages; tabIndex lets the skip link move focus here. */}
            <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
                {children}
            </main>
            <Footer />
        </div>
    )
}
