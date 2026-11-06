'use client'

import {
    createContext,
    useContext,
    useMemo,
    useSyncExternalStore,
    type ReactNode,
} from 'react'

export type CartItem = {
    id: string
    name: string
    slug: string
    price: number
    imageUrl?: string
    quantity: number
}

type CartContextType = {
    items: CartItem[]
    /** False during server render and hydration, true once the cart has been read from localStorage. */
    loaded: boolean
    totalQuantity: number
    totalPrice: number
    addItem: (item: Omit<CartItem, 'quantity'>) => void
    removeItem: (id: string) => void
    updateQuantity: (id: string, quantity: number) => void
    clearCart: () => void
}

const CartContext = createContext<CartContextType | null>(null)

export const STORAGE_KEY = 'cart'

/*
 * The cart lives in localStorage and React subscribes to it with
 * useSyncExternalStore. This keeps server and client markup identical during
 * hydration (the server snapshot is always an empty cart) and also keeps
 * multiple open tabs in sync via the `storage` event.
 */
const listeners = new Set<() => void>()

function notify() {
    listeners.forEach((listener) => listener())
}

function subscribe(listener: () => void) {
    listeners.add(listener)
    const onStorage = (event: StorageEvent) => {
        if (event.key === STORAGE_KEY || event.key === null) listener()
    }
    window.addEventListener('storage', onStorage)
    return () => {
        listeners.delete(listener)
        window.removeEventListener('storage', onStorage)
    }
}

function getSnapshot(): string {
    try {
        return localStorage.getItem(STORAGE_KEY) ?? ''
    } catch {
        return ''
    }
}

function getServerSnapshot(): string {
    return ''
}

function isCartItem(value: unknown): value is CartItem {
    if (typeof value !== 'object' || value === null) return false
    const v = value as Record<string, unknown>
    return (
        typeof v.id === 'string' &&
        typeof v.name === 'string' &&
        typeof v.slug === 'string' &&
        typeof v.price === 'number' &&
        Number.isFinite(v.price) &&
        typeof v.quantity === 'number' &&
        Number.isInteger(v.quantity) &&
        v.quantity >= 1
    )
}

/** Parses the stored cart. Corrupt or tampered data results in an empty cart. */
export function parseCart(raw: string): CartItem[] {
    if (!raw) return []
    try {
        const parsed: unknown = JSON.parse(raw)
        return Array.isArray(parsed) ? parsed.filter(isCartItem) : []
    } catch {
        return []
    }
}

function writeCart(items: CartItem[]) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
    } catch {
        // Storage can be unavailable (for example, blocked by browser settings).
    }
    notify()
}

function readCart(): CartItem[] {
    return parseCart(getSnapshot())
}

const subscribeNever = () => () => {}
const getLoadedOnClient = () => true
const getLoadedOnServer = () => false

export function CartProvider({ children }: { children: ReactNode }) {
    const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    const loaded = useSyncExternalStore(
        subscribeNever,
        getLoadedOnClient,
        getLoadedOnServer
    )
    const items = useMemo(() => parseCart(raw), [raw])

    const value = useMemo<CartContextType>(() => {
        const addItem: CartContextType['addItem'] = (item) => {
            const current = readCart()
            const existing = current.find((i) => i.id === item.id)
            writeCart(
                existing
                    ? current.map((i) =>
                          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                      )
                    : [...current, { ...item, quantity: 1 }]
            )
        }

        const removeItem = (id: string) => {
            writeCart(readCart().filter((i) => i.id !== id))
        }

        const updateQuantity = (id: string, quantity: number) => {
            if (quantity < 1) return removeItem(id)
            writeCart(
                readCart().map((i) => (i.id === id ? { ...i, quantity } : i))
            )
        }

        const clearCart = () => writeCart([])

        return {
            items,
            loaded,
            totalQuantity: items.reduce((sum, i) => sum + i.quantity, 0),
            totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
        }
    }, [items, loaded])

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
    return ctx
}
