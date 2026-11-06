'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'

export default function SuccessPage() {
    const { clearCart, loaded } = useCart()

    // Stripe redirects here after payment; empty the cart once it has been read from storage.
    useEffect(() => {
        if (loaded) clearCart()
    }, [loaded, clearCart])

    return (
        <div className="mx-auto max-w-xl p-6 text-center">
            <h1 className="text-3xl font-bold">
                Thank you! <span aria-hidden="true">🎉</span>
            </h1>
            <p className="mt-4 text-gray-700">Your payment was successful.</p>
            <Link href="/" className="mt-6 inline-block py-2 underline">
                Continue shopping
            </Link>
        </div>
    )
}
