'use client'

import { useState } from 'react'
import { useCart } from '@/context/CartContext'

export default function CheckoutButton() {
    const { items } = useCart()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleCheckout = async () => {
        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    items: items.map((i) => ({ id: i.id, quantity: i.quantity })),
                }),
            })
            const data = await res.json()
            if (!res.ok || !data.url) throw new Error(data.error || 'Failed')
            window.location.href = data.url
        } catch {
            setError('Something went wrong. Please try again.')
            setLoading(false)
        }
    }

    return (
        <div className="text-right">
            <button
                onClick={handleCheckout}
                disabled={loading}
                className="rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800 disabled:opacity-50"
            >
                {loading ? 'Redirecting...' : 'Checkout'}
            </button>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
    )
}