import { getPlan } from '../../src/checkout.js';
function json(data, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } }); }
export async function onRequestGet({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ message: 'Stripeが設定されていません。' }, 503);
  const sessionId = new URL(request.url).searchParams.get('id') || '';
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return json({ message: 'Checkout Session IDが正しくありません。' }, 400);
  const response = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } });
  const session = await response.json();
  if (!response.ok) return json({ message: session.error?.message || '購入情報を取得できませんでした。' }, 502);
  const planId = session.metadata?.plan_id || '';
  return json({ id: session.id, status: session.status, paymentStatus: session.payment_status, mode: session.mode, amountTotal: session.amount_total, currency: session.currency, customerEmail: session.customer_details?.email || session.customer_email || '', customerAvailable: typeof session.customer === 'string' && session.customer.startsWith('cus_'), planId, planName: getPlan(planId)?.name || '' });
}
