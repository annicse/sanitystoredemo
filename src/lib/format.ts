/** Currency used across the store. Must match the currency sent to Stripe in /api/checkout. */
export const CURRENCY = 'USD'

const LOCALE = 'en-US'

const formatters = new Map<string, Intl.NumberFormat>()

/**
 * Formats a price with the currency symbol and exactly two decimals,
 * for example formatPrice(30.2) === "$30.20".
 */
export function formatPrice(amount: number, currency: string = CURRENCY): string {
    let formatter = formatters.get(currency)
    if (!formatter) {
        formatter = new Intl.NumberFormat(LOCALE, {
            style: 'currency',
            currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        })
        formatters.set(currency, formatter)
    }
    return formatter.format(amount)
}
