# Stripe Checkout setup

The purchase UI, Cloudflare Pages Functions, success verification, customer portal and webhook signature verification are implemented. Actual charging remains disabled until the merchant-owned Stripe and seller settings are added to Cloudflare.

## Required Cloudflare Pages secrets and variables

Open Cloudflare Dashboard → Workers & Pages → `lumina-fortune-landing` → Settings → Variables and Secrets.

Add these to Production and Preview as appropriate:

- `STRIPE_SECRET_KEY` — Stripe secret API key. Use `sk_test_...` first and `sk_live_...` only after verification.
- `STRIPE_WEBHOOK_SECRET` — signing secret for the webhook endpoint.
- `PUBLIC_SITE_URL` — `https://lumina-fortune-landing.pages.dev` or the final custom domain.
- `SELLER_NAME` — legal seller or business name.
- `SELLER_ADDRESS` — address required for the commercial disclosure.
- `SUPPORT_EMAIL` — customer support address.

A new deployment is required after changing Cloudflare Pages bindings.

## Stripe Dashboard

1. Start in Stripe test mode.
2. Open Developers → Webhooks and add `https://lumina-fortune-landing.pages.dev/api/stripe-webhook`.
3. Subscribe at minimum to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`, and `invoice.payment_failed`.
4. Copy the endpoint signing secret into `STRIPE_WEBHOOK_SECRET` in Cloudflare.
5. Enable and configure the Stripe Customer Portal so the success page can open subscription management and cancellation.
6. Confirm business profile, statement descriptor, receipts, tax treatment, refund policy and required Japanese commercial disclosures before switching to live mode.

## Test flow

1. Deploy with an `sk_test_...` key.
2. Open `/purchase.html`.
3. Confirm the page displays `テスト決済`.
4. Use a Stripe test card from the official Stripe testing documentation.
5. Confirm redirect to `/success.html?session_id=...` and verify the purchase summary.
6. For the monthly plan, open the Customer Portal and verify cancellation management.
7. Confirm signed webhook events return HTTP 200.

## Security model

- Prices and plan mode are allowlisted on the server and cannot be supplied by the browser.
- Card data is collected on Stripe-hosted Checkout, not by LUMINA.
- Checkout creation accepts same-origin browser requests only.
- Checkout Session IDs are validated before Stripe retrieval.
- Webhook signatures use the unmodified request body, timestamp tolerance and HMAC SHA-256 verification.
- API responses use `Cache-Control: no-store`.

## Remaining production work

The current webhook verifies and acknowledges events, but it does not grant durable entitlements because the prototype has no user authentication or database. Before paid content is unlocked permanently, add an authenticated account system, database, idempotent event ledger and entitlement table. Do not use the success redirect alone as proof of fulfillment.
