'use client'

import { useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { MAX_QUANTITY, useCart } from '@/context/CartContext'
import CheckoutButton from '@/components/CheckoutButton'
import { formatPrice } from '@/lib/format'

export default function CartPage() {
    const { items, loaded, totalPrice, updateQuantity, removeItem } = useCart()
    const headingRef = useRef<HTMLHeadingElement>(null)

    // When an item is removed its buttons disappear, so move focus to the page
    // heading instead of letting it fall back to the top of the document.
    const handleRemove = (id: string) => {
        removeItem(id)
        headingRef.current?.focus()
    }

    return (
        <div className="mx-auto max-w-3xl p-6">
            <h1
                ref={headingRef}
                tabIndex={-1}
                className="mb-6 text-3xl font-bold focus:outline-none"
            >
                Your cart
            </h1>

            {!loaded ? (
                <p role="status" className="text-gray-700">
                    Loading your cart…
                </p>
            ) : items.length === 0 ? (
                <>
                    <p className="text-gray-700">Your cart is empty.</p>
                    <Link href="/" className="mt-4 inline-block py-2 underline">
                        Continue shopping
                    </Link>
                </>
            ) : (
                <>
                    <ul className="divide-y" aria-label="Items in your cart">
                        {items.map((item) => (
                            <li key={item.id} className="flex items-center gap-4 py-4">
                                {item.imageUrl && (
                                    // Decorative: the product name is right next to it.
                                    <Image
                                        src={item.imageUrl}
                                        alt=""
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
                                    <p className="text-gray-700">{formatPrice(item.price)}</p>
                                </div>

                                <div
                                    role="group"
                                    aria-label={`Quantity of ${item.name}`}
                                    className="flex items-center gap-2"
                                >
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                        aria-label={`Decrease quantity of ${item.name}`}
                                        className="h-9 w-9 rounded border"
                                    >
                                        <span aria-hidden="true">−</span>
                                    </button>
                                    <span className="w-6 text-center">{item.quantity}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                        disabled={item.quantity >= MAX_QUANTITY}
                                        aria-label={`Increase quantity of ${item.name}`}
                                        className="h-9 w-9 rounded border disabled:opacity-40"
                                    >
                                        <span aria-hidden="true">+</span>
                                    </button>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => handleRemove(item.id)}
                                    aria-label={`Remove ${item.name} from cart`}
                                    className="min-h-9 px-2 text-sm text-red-700 hover:underline"
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
                </>
            )}
        </div>
    )
}
