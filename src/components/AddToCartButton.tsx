'use client'

import { useState } from 'react'
import { useCart, type CartItem } from '@/context/CartContext'

export default function AddToCartButton({
    product,
}: {
    product: Omit<CartItem, 'quantity'>
}) {
    const { addItem } = useCart()
    const [added, setAdded] = useState(false)

    const handleClick = () => {
        addItem(product)
        setAdded(true)
        setTimeout(() => setAdded(false), 1500)
    }

    return (
        <button
            onClick={handleClick}
            className="mt-6 rounded-lg bg-black px-6 py-3 text-white hover:bg-gray-800"
        >
            {added ? 'Added ✓' : 'Add to cart'}
        </button>
    )
}