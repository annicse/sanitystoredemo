'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCart } from '@/context/CartContext'
import { SITE_NAME } from '@/lib/site'

export default function Header() {
    const { totalQuantity } = useCart()
    const pathname = usePathname()

    const current = (href: string) => (pathname === href ? 'page' : undefined)

    return (
        <header className="border-b">
            <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 p-4">
                <Link href="/" className="py-1 text-xl font-bold">
                    {SITE_NAME}
                </Link>
                <nav aria-label="Main">
                    <ul className="flex items-center gap-6">
                        <li>
                            <Link
                                href="/about"
                                aria-current={current('/about')}
                                className="inline-block py-2 font-medium hover:underline aria-[current=page]:underline"
                            >
                                About
                            </Link>
                        </li>
                        <li>
                            <Link
                                href="/cart"
                                aria-current={current('/cart')}
                                className="inline-block py-2 font-medium hover:underline aria-[current=page]:underline"
                            >
                                Cart ({totalQuantity})
                            </Link>
                        </li>
                    </ul>
                </nav>
            </div>
        </header>
    )
}
