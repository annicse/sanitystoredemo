'use client'

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
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

/** The checkout API ignores line items above this quantity, so the UI never allows more. */
export const MAX_QUANTITY = 99

/** How long a status message stays in the live region, in milliseconds. */
const ANNOUNCEMENT_TIMEOUT = 5000

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

function itemsLabel(count: number): string {
    return count === 0 ? 'Cart is empty.' : `Cart has ${count} ${count === 1 ? 'item' : 'items'}.`
}

function countItems(items: CartItem[]): number {
    return items.reduce((sum, i) => sum + i.quantity, 0)
}

export function CartProvider({ children }: { children: ReactNode }) {
    const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
    const loaded = useSyncExternalStore(
        subscribeNever,
        getLoadedOnClient,
        getLoadedOnServer
    )
    const items = useMemo(() => parseCart(raw), [raw])

    // Text for the screen-reader-only live region rendered below.
    const [announcement, setAnnouncement] = useState('')
    const announcementTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
        undefined
    )

    useEffect(() => () => clearTimeout(announcementTimer.current), [])

    const announce = useCallback((message: string) => {
        setAnnouncement(message)
        clearTimeout(announcementTimer.current)
        announcementTimer.current = setTimeout(
            () => setAnnouncement(''),
            ANNOUNCEMENT_TIMEOUT
        )
    }, [])

    const addItem = useCallback<CartContextType['addItem']>(
        (item) => {
            const current = readCart()
            const existing = current.find((i) => i.id === item.id)

            if (existing && existing.quantity >= MAX_QUANTITY) {
                announce(`Maximum quantity of ${MAX_QUANTITY} reached for ${item.name}.`)
                return
            }

            const next = existing
                ? current.map((i) =>
                      i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                  )
                : [...current, { ...item, quantity: 1 }]
            writeCart(next)
            announce(`${item.name} added to cart. ${itemsLabel(countItems(next))}`)
        },
        [announce]
    )

    const removeItem = useCallback(
        (id: string) => {
            const current = readCart()
            const removed = current.find((i) => i.id === id)
            const next = current.filter((i) => i.id !== id)
            writeCart(next)
            if (removed) {
                announce(
                    `${removed.name} removed from cart. ${itemsLabel(countItems(next))}`
                )
            }
        },
        [announce]
    )

    const updateQuantity = useCallback(
        (id: string, quantity: number) => {
            if (quantity < 1) return removeItem(id)
            const capped = Math.min(Math.floor(quantity), MAX_QUANTITY)
            const current = readCart()
            const target = current.find((i) => i.id === id)
            if (!target) return
            writeCart(current.map((i) => (i.id === id ? { ...i, quantity: capped } : i)))
            announce(`${target.name}: quantity ${capped}.`)
        },
        [announce, removeItem]
    )

    // Used after a completed checkout; deliberately silent.
    const clearCart = useCallback(() => writeCart([]), [])

    const value = useMemo<CartContextType>(
        () => ({
            items,
            loaded,
            totalQuantity: countItems(items),
            totalPrice: items.reduce((sum, i) => sum + i.price * i.quantity, 0),
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
        }),
        [items, loaded, addItem, removeItem, updateQuantity, clearCart]
    )

    return (
        <CartContext.Provider value={value}>
            {children}
            <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
                {announcement}
            </div>
        </CartContext.Provider>
    )
}

export function useCart() {
    const ctx = useContext(CartContext)
    if (!ctx) throw new Error('useCart must be used inside CartProvider')
    return ctx
}
