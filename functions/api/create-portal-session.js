function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}

export async function onRequestPost({ request, env }) {
  if (!env.STRIPE_SECRET_KEY) return json({ message: 'Stripeが設定されていません。' }, 503);

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'JSON形式のリクエストが必要です。' }, 400);
  }

  const sessionId = String(body.sessionId || '');
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) return json({ message: 'Checkout Session IDが正しくありません。' }, 400);

  const checkoutResponse = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
    headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` }
  });
  const checkout = await checkoutResponse.json();
  if (!checkoutResponse.ok || typeof checkout.customer !== 'string') {
    return json({ message: 'Stripe顧客情報を取得できませんでした。' }, 502);
  }

  const origin = env.PUBLIC_SITE_URL || new URL(request.url).origin;
  const params = new URLSearchParams({ customer: checkout.customer, return_url: `${origin}/success.html?session_id=${encodeURIComponent(sessionId)}` });
  const portalResponse = await fetch('https://api.stripe.com/v1/billing_portal/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });
  const portal = await portalResponse.json();
  if (!portalResponse.ok || !portal.url) return json({ message: portal.error?.message || '契約管理画面を作成できませんでした。' }, 502);
  return json({ url: portal.url });
}
