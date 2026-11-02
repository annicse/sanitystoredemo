'use client'

import Link from 'next/link'
import { useCart } from '@/context/CartContext'

export default function Header() {
    const { totalQuantity } = useCart()

    return (
        <header className="border-b">
            <div className="mx-auto flex max-w-5xl items-center justify-between p-4">
                <Link href="/" className="text-xl font-bold">
                    My Shop
                </Link>
                <Link href="/about" className="font-medium hover:underline">
                    About
                </Link>
                <Link href="/cart" className="font-medium hover:underline">
                    Cart ({totalQuantity})
                </Link>
            </div>
        </header>
    )
}