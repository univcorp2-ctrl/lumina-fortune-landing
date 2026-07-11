export const PLAN_CATALOG = Object.freeze({
  detailed: Object.freeze({
    id: 'detailed', mode: 'payment', name: 'LUMINA 一回だけの詳細鑑定',
    description: '選んだテーマの詳細結果、7日間の行動ヒント、振り返り質問を含む買い切り鑑定です。',
    unitAmount: 480, currency: 'jpy', priceLabel: '¥480', cadenceLabel: '1回'
  }),
  plus: Object.freeze({
    id: 'plus', mode: 'subscription', name: 'LUMINA Plus 月額プラン',
    description: 'テーマ別7日間リーディング、結果履歴、追加質問ガイドを利用できる月額プランです。',
    unitAmount: 980, currency: 'jpy', interval: 'month', priceLabel: '¥980', cadenceLabel: '月'
  })
});

export function getPlan(planId) { return PLAN_CATALOG[planId] || null; }

export function getPublicPlans() {
  return Object.values(PLAN_CATALOG).map(({ id, mode, name, description, unitAmount, currency, priceLabel, cadenceLabel }) => ({
    id, mode, name, description, unitAmount, currency, priceLabel, cadenceLabel
  }));
}

export function isValidEmail(value) {
  if (!value) return true;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value)) && String(value).length <= 254;
}

export function normalizeSiteOrigin(value) {
  const url = new URL(value);
  const localhost = ['localhost', '127.0.0.1'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(localhost && url.protocol === 'http:')) {
    throw new Error('Site origin must use HTTPS outside localhost.');
  }
  return url.origin;
}

export function buildCheckoutParams(planId, siteOrigin, email = '') {
  const plan = getPlan(planId);
  if (!plan) throw new Error('Unknown plan.');
  if (!isValidEmail(email)) throw new Error('Invalid email.');
  const origin = normalizeSiteOrigin(siteOrigin);
  const params = new URLSearchParams();
  params.set('mode', plan.mode);
  params.set('locale', 'ja');
  params.set('success_url', `${origin}/success.html?session_id={CHECKOUT_SESSION_ID}`);
  params.set('cancel_url', `${origin}/cancel.html`);
  params.set('allow_promotion_codes', 'true');
  params.set('billing_address_collection', 'auto');
  params.set('line_items[0][quantity]', '1');
  params.set('line_items[0][price_data][currency]', plan.currency);
  params.set('line_items[0][price_data][unit_amount]', String(plan.unitAmount));
  params.set('line_items[0][price_data][product_data][name]', plan.name);
  params.set('line_items[0][price_data][product_data][description]', plan.description);
  params.set('metadata[plan_id]', plan.id);
  if (email) params.set('customer_email', email);
  if (plan.mode === 'subscription') {
    params.set('line_items[0][price_data][recurring][interval]', plan.interval);
    params.set('subscription_data[metadata][plan_id]', plan.id);
  } else {
    params.set('customer_creation', 'always');
    params.set('payment_intent_data[metadata][plan_id]', plan.id);
    params.set('submit_type', 'pay');
  }
  return params;
}

export function getMissingCheckoutSettings(env = {}) {
  return [
    ['STRIPE_SECRET_KEY', env.STRIPE_SECRET_KEY],
    ['SELLER_NAME', env.SELLER_NAME],
    ['SELLER_ADDRESS', env.SELLER_ADDRESS],
    ['SUPPORT_EMAIL', env.SUPPORT_EMAIL]
  ].filter(([, value]) => !String(value || '').trim()).map(([name]) => name);
}
