import { SITE_NAME } from '@/lib/site'

export default function Footer() {
    return (
        <footer className="mt-12 border-t">
            <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 p-4 text-sm text-gray-700">
                <p>
                    {SITE_NAME} is a portfolio project. Payments run in Stripe test
                    mode, so no real charges are made.
                </p>
                <a
                    href="https://github.com/annicse/sanitystoredemo"
                    className="inline-block py-1 underline"
                >
                    Source code on GitHub
                </a>
            </div>
        </footer>
    )
}
