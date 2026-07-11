import { verifyStripeSignature } from '../../src/stripe-signature.js';
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }); }
export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_WEBHOOK_SECRET) return json({ message: 'Webhook secret is not configured.' }, 503);
  const signature = request.headers.get('Stripe-Signature') || '';
  const payload = await request.text();
  const verified = await verifyStripeSignature(payload, signature, env.STRIPE_WEBHOOK_SECRET);
  if (!verified) return json({ message: 'Invalid Stripe signature.' }, 400);
  let event;
  try { event = JSON.parse(payload); } catch { return json({ message: 'Invalid JSON payload.' }, 400); }
  const handledEvents = new Set(['checkout.session.completed','checkout.session.async_payment_succeeded','checkout.session.async_payment_failed','customer.subscription.updated','customer.subscription.deleted','invoice.payment_failed']);
  if (handledEvents.has(event.type)) console.log('Verified Stripe event', event.type, event.id);
  return json({ received: true });
}
