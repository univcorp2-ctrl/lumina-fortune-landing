# Production deployment

The production site is deployed from the `main` branch to Cloudflare Pages.

- Production URL: https://lumina-fortune-landing.pages.dev
- Build command: `npm run build`
- Output directory: `dist`
- Root directory: repository root
- Production branch: `main`

Every push to `main` triggers a new production deployment. Pull request branches receive preview deployments when Cloudflare Git integration is enabled.

The `public/_headers` file adds baseline browser security headers. The `public/_redirects` file keeps client-side routes compatible with static hosting.
