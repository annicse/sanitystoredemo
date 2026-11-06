import type { Metadata } from 'next'
import Header from '@/components/Header'
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
        <>
            <Header />
            {children}
        </>
    )
}
