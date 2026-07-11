import { getMissingCheckoutSettings, getPublicPlans } from '../../src/checkout.js';
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }); }
export async function onRequestGet({ env }) {
  const missing = getMissingCheckoutSettings(env);
  const secret = String(env.STRIPE_SECRET_KEY || '');
  const stripeMode = secret.startsWith('sk_live_') ? 'live' : secret.startsWith('sk_test_') ? 'test' : 'unconfigured';
  return json({ configured: missing.length === 0, missing, stripeMode, plans: getPublicPlans(), seller: { name: String(env.SELLER_NAME || ''), address: String(env.SELLER_ADDRESS || ''), email: String(env.SUPPORT_EMAIL || '') } });
}
