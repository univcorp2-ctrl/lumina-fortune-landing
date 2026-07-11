# Production deployment

The production site is deployed from the `main` branch to Cloudflare Pages.

- Production URL: https://lumina-fortune-landing.pages.dev
- Purchase URL: https://lumina-fortune-landing.pages.dev/purchase.html
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root
- Production branch: `main`

Every push to `main` triggers a new production deployment. Pull request branches receive preview deployments when Cloudflare Git integration is enabled.

## Runtime functions

Cloudflare Pages Functions under `functions/api/` provide:

- `/api/checkout-config`
- `/api/create-checkout-session`
- `/api/checkout-session`
- `/api/create-portal-session`
- `/api/stripe-webhook`

The purchase page remains safely disabled until required Stripe and seller environment variables are configured. See [stripe-setup.md](stripe-setup.md).

The `public/_headers` file adds baseline browser security and no-store API headers. The `public/_redirects` file keeps static routes compatible with Pages hosting.
