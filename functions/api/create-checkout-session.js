import { buildCheckoutParams, getMissingCheckoutSettings, getPlan, isValidEmail, normalizeSiteOrigin } from '../../src/checkout.js';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function isSameOrigin(request) {
  const originHeader = request.headers.get('Origin');
  if (!originHeader) return true;
  try {
    return new URL(originHeader).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) return json({ message: '許可されていない送信元です。' }, 403);

  const missing = getMissingCheckoutSettings(env);
  if (missing.length > 0) {
    return json({
      code: 'CHECKOUT_NOT_CONFIGURED',
      message: `決済設定が未完了です: ${missing.join(', ')}`
    }, 503);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return json({ message: 'JSON形式のリクエストが必要です。' }, 400);
  }

  const plan = getPlan(body.plan);
  const email = String(body.email || '').trim();
  if (!plan) return json({ message: '選択したプランが見つかりません。' }, 400);
  if (!isValidEmail(email)) return json({ message: 'メールアドレスの形式を確認してください。' }, 400);

  let siteOrigin;
  try {
    siteOrigin = normalizeSiteOrigin(env.PUBLIC_SITE_URL || new URL(request.url).origin);
  } catch {
    return json({ message: '公開URLの設定が正しくありません。' }, 500);
  }

  const params = buildCheckoutParams(plan.id, siteOrigin, email);
  const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Idempotency-Key': crypto.randomUUID()
    },
    body: params
  });
  const session = await stripeResponse.json();

  if (!stripeResponse.ok || !session.url) {
    console.error('Stripe Checkout creation failed', session.error?.type, session.error?.code);
    return json({ message: session.error?.message || 'Stripe Checkoutを開始できませんでした。' }, 502);
  }

  return json({ id: session.id, url: session.url });
}
