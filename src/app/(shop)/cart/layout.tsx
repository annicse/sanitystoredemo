import type { Metadata } from 'next'

// The cart page is a client component, so its title lives in this server layout.
export const metadata: Metadata = {
    title: 'Your cart',
    robots: { index: false },
}

export default function CartLayout({ children }: { children: React.ReactNode }) {
    return children
}
