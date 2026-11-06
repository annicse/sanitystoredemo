'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/context/CartContext'
import CheckoutButton from '@/components/CheckoutButton'
import { formatPrice } from '@/lib/format'

export default function CartPage() {
    const { items, totalPrice, updateQuantity, removeItem } = useCart()

    if (items.length === 0) {
        return (
            <main className="mx-auto max-w-3xl p-6">
                <h1 className="text-3xl font-bold">Your cart</h1>
                <p className="mt-4 text-gray-600">Your cart is empty.</p>
                <Link href="/" className="mt-4 inline-block underline">
                    Continue shopping
                </Link>
            </main>
        )
    }

    return (
        <main className="mx-auto max-w-3xl p-6">
            <h1 className="mb-6 text-3xl font-bold">Your cart</h1>

            <ul className="divide-y">
                {items.map((item) => (
                    <li key={item.id} className="flex items-center gap-4 py-4">
                        {item.imageUrl && (
                            <Image
                                src={item.imageUrl}
                                alt={item.name}
                                width={80}
                                height={80}
                                className="rounded"
                            />
                        )}

                        <div className="flex-1">
                            <Link
                                href={`/products/${item.slug}`}
                                className="font-medium hover:underline"
                            >
                                {item.name}
                            </Link>
                            <p className="text-gray-600">{formatPrice(item.price)}</p>
                        </div>

                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="h-8 w-8 rounded border"
                            >
                                −
                            </button>
                            <span className="w-6 text-center">{item.quantity}</span>
                            <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="h-8 w-8 rounded border"
                            >
                                +
                            </button>
                        </div>

                        <button
                            onClick={() => removeItem(item.id)}
                            className="text-sm text-red-600 hover:underline"
                        >
                            Remove
                        </button>
                    </li>
                ))}
            </ul>

            <div className="mt-6 flex items-center justify-between border-t pt-4">
                <p className="text-xl font-bold">Total: {formatPrice(totalPrice)}</p>
                <CheckoutButton />
            </div>
        </main>
    )
}