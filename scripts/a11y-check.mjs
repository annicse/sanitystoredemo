/**
 * Automated accessibility check (axe-core via Playwright) against a running site.
 *
 *   npm run build && npm run start      # in one terminal
 *   npm run a11y                        # in another (defaults to http://localhost:3000)
 *   A11Y_BASE_URL=https://example.com npm run a11y
 *
 * Uses the Chrome installed on the machine (no browser download). Set
 * A11Y_CHROME_CHANNEL=chromium to use a Playwright-managed Chromium instead.
 *
 * Scans these pages against WCAG 2.0/2.1/2.2 A and AA rules: home, a product
 * page, About, the empty cart, a cart with one item, and the success page.
 * Also asserts that adding to the cart is announced in the live region.
 * Exits with code 1 if any violation or assertion failure is found.
 *
 * Automated tools only catch a subset of problems; this does not replace
 * manual keyboard and screen-reader testing.
 */
import AxeBuilder from '@axe-core/playwright'
import { chromium } from 'playwright-core'

const BASE_URL = (process.env.A11Y_BASE_URL ?? 'http://localhost:3000').replace(/\/+$/, '')
const CHANNEL = process.env.A11Y_CHROME_CHANNEL ?? 'chrome'
const TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']

const browser = await chromium.launch({ channel: CHANNEL })
const page = await (await browser.newContext()).newPage()

let failures = 0

// Navigate and wait until the page is hydrated and the cart (if shown) has loaded.
async function open(path) {
    await page.goto(`${BASE_URL}${path}`, { waitUntil: 'load' })
    await page.locator('main h1').first().waitFor()
    await page.getByText('Loading your cart').waitFor({ state: 'detached' })
}

async function scan(label, path) {
    if (path) await open(path)
    const { violations } = await new AxeBuilder({ page }).withTags(TAGS).analyze()
    if (violations.length === 0) {
        console.log(`PASS  ${label}`)
        return
    }
    failures += violations.length
    console.log(`FAIL  ${label}: ${violations.length} violation(s)`)
    for (const v of violations) {
        console.log(`      - [${v.impact}] ${v.id}: ${v.help}`)
        for (const node of v.nodes.slice(0, 3)) console.log(`          ${node.target.join(' ')}`)
    }
}

function assert(label, condition) {
    if (condition) {
        console.log(`PASS  ${label}`)
    } else {
        failures += 1
        console.log(`FAIL  ${label}`)
    }
}

try {
    await open('/')
    const productHref = await page
        .locator('a[href^="/products/"]')
        .first()
        .getAttribute('href')
    if (!productHref) throw new Error('No product link found on the home page. Is there content in Sanity?')

    await scan('Home (/)', null)
    await scan(`Product (${productHref})`, productHref)
    await scan('About (/about)', '/about')

    await page.evaluate(() => localStorage.clear())
    await scan('Cart, empty (/cart)', '/cart')

    // Add the product to the cart and check the live region announces it.
    await open(productHref)
    await page.getByRole('button', { name: 'Add to cart' }).click()
    const status = page.locator('[role="status"]').filter({ hasText: 'added to cart' })
    await status.waitFor({ timeout: 5000 }).catch(() => {})
    assert('Adding to cart is announced in the live region', (await status.count()) === 1)

    await scan('Cart, with one item (/cart)', '/cart')
    await scan('Success (/success)', '/success')
} finally {
    await browser.close()
}

if (failures > 0) {
    console.log(`\n${failures} problem(s) found.`)
    process.exit(1)
}
console.log('\nNo automated accessibility violations found.')
