import type { Metadata } from 'next'

// The success page is a client component, so its title lives in this server layout.
export const metadata: Metadata = {
    title: 'Thank you',
    robots: { index: false },
}

export default function SuccessLayout({ children }: { children: React.ReactNode }) {
    return children
}
