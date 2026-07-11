import test from 'node:test';
import assert from 'node:assert/strict';
import { createStripeSignature, parseStripeSignature, verifyStripeSignature } from '../src/stripe-signature.js';

test('Stripe signature parser extracts timestamp and v1 values', () => {
  assert.deepEqual(parseStripeSignature('t=123,v1=abc,v1=def'), { timestamp: 123, signatures: ['abc', 'def'] });
});

test('Stripe webhook signature verifies raw payload and tolerance', async () => {
  const payload = '{"id":"evt_test"}';
  const secret = 'whsec_example';
  const timestamp = 1_700_000_000;
  const signature = await createStripeSignature(payload, secret, timestamp);
  const header = `t=${timestamp},v1=${signature}`;
  assert.equal(await verifyStripeSignature(payload, header, secret, { nowSeconds: timestamp }), true);
  assert.equal(await verifyStripeSignature(`${payload} `, header, secret, { nowSeconds: timestamp }), false);
  assert.equal(await verifyStripeSignature(payload, header, secret, { nowSeconds: timestamp + 301 }), false);
});
