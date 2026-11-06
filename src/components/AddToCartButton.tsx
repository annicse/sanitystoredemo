'use client'

import { useEffect, useRef, useState } from 'react'
import { useCart, type CartItem } from '@/context/CartContext'

export default function AddToCartButton({
    product,
}: {
    product: Omit<CartItem, 'quantity'>
}) {
    const { addItem } = useCart()
    const [added, setAdded] = useState(false)
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    useEffect(() => () => clearTimeout(timer.current), [])

    const handleClick = () => {
        // The screen-reader announcement ("... added to cart") comes from the cart's live region.
        addItem(product)
        setAdded(true)
        clearTimeout(timer.current)
        timer.current = setTimeout(() => setAdded(false), 1500)
    }

    return (
        <button
            type="button"
            onClick={handleClick}
            className="mt-6 min-h-11 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
            {added ? 'Added ✓' : 'Add to cart'}
        </button>
    )
}
