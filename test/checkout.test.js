import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCheckoutParams, getMissingCheckoutSettings, getPlan, isValidEmail } from '../src/checkout.js';

test('catalog exposes one-time and subscription plans', () => {
  assert.equal(getPlan('detailed').mode, 'payment');
  assert.equal(getPlan('plus').mode, 'subscription');
  assert.equal(getPlan('missing'), null);
});

test('one-time Checkout parameters are server controlled', () => {
  const params = buildCheckoutParams('detailed', 'https://example.com', 'user@example.com');
  assert.equal(params.get('mode'), 'payment');
  assert.equal(params.get('line_items[0][price_data][unit_amount]'), '480');
  assert.equal(params.get('customer_email'), 'user@example.com');
  assert.equal(params.get('success_url'), 'https://example.com/success.html?session_id={CHECKOUT_SESSION_ID}');
  assert.equal(params.get('customer_creation'), 'always');
});

test('subscription parameters include monthly recurrence', () => {
  const params = buildCheckoutParams('plus', 'https://example.com');
  assert.equal(params.get('mode'), 'subscription');
  assert.equal(params.get('line_items[0][price_data][unit_amount]'), '980');
  assert.equal(params.get('line_items[0][price_data][recurring][interval]'), 'month');
});

test('checkout rejects insecure public origins and invalid emails', () => {
  assert.throws(() => buildCheckoutParams('detailed', 'http://example.com'), /HTTPS/);
  assert.equal(isValidEmail('bad@'), false);
  assert.equal(isValidEmail('ok@example.com'), true);
});

test('configuration requires Stripe and seller disclosure fields', () => {
  assert.deepEqual(getMissingCheckoutSettings({}), ['STRIPE_SECRET_KEY', 'SELLER_NAME', 'SELLER_ADDRESS', 'SUPPORT_EMAIL']);
  assert.deepEqual(getMissingCheckoutSettings({ STRIPE_SECRET_KEY: 'sk_test_x', SELLER_NAME: 'Example', SELLER_ADDRESS: 'Tokyo', SUPPORT_EMAIL: 'support@example.com' }), []);
});
