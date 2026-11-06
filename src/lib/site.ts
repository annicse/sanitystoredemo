export const SITE_NAME = 'Sanity Store Demo'

export const SITE_DESCRIPTION =
    'A demo online store built with Next.js, Sanity CMS and Stripe Checkout. Payments run in Stripe test mode, so no real charges are made.'

/**
 * Public base URL of the site, used for absolute URLs in metadata.
 * NEXT_PUBLIC_SITE_URL wins; on Vercel we fall back to the production domain.
 */
export function getSiteUrl(): string {
    const explicit = process.env.NEXT_PUBLIC_SITE_URL
    if (explicit) return explicit.replace(/\/+$/, '')
    const vercelDomain = process.env.VERCEL_PROJECT_PRODUCTION_URL
    if (vercelDomain) return `https://${vercelDomain}`
    return 'http://localhost:3000'
}

/** Shortens text to at most `max` characters on a word boundary, adding an ellipsis. */
export function truncate(text: string, max = 160): string {
    const clean = text.replace(/\s+/g, ' ').trim()
    if (clean.length <= max) return clean
    const cut = clean.slice(0, max - 1)
    const lastSpace = cut.lastIndexOf(' ')
    return `${(lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}
