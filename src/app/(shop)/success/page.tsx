'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useCart } from '@/context/CartContext'

export default function SuccessPage() {
    const { clearCart, loaded } = useCart()

    useEffect(() => {
        if (loaded) clearCart()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loaded])

    return (
        <main className="mx-auto max-w-xl p-6 text-center">
            <h1 className="text-3xl font-bold">Thank you! 🎉</h1>
            <p className="mt-4 text-gray-600">Your payment was successful.</p>
            <Link href="/" className="mt-6 inline-block underline">
                Continue shopping
            </Link>
        </main>
    )
}