import test from 'node:test';
import assert from 'node:assert/strict';
import { computeStreak, createReading, getQuotaState, runReadingFlow } from '../src/fortune.js';

const now = new Date('2026-07-07T03:00:00.000Z');

test('reading generation is deterministic for the same day and input', () => {
  const input = { concern: 'love', nickname: 'ルナ', birthDate: '1994-04-12' };
  assert.deepEqual(createReading(input, now), createReading(input, now));
});

test('reading contains supportive, actionable fields', () => {
  const reading = createReading({ concern: 'work', nickname: '', birthDate: '' }, now);
  assert.equal(reading.concernLabel, '仕事');
  assert.ok(reading.headline.length > 10);
  assert.ok(reading.action.length > 5);
  assert.equal(reading.premiumPreview.length, 3);
  assert.doesNotMatch(reading.interpretation, /絶対|不幸|破滅/);
});

test('quota counts only readings created on the Tokyo calendar day', () => {
  const today = createReading({ concern: 'love' }, now);
  const old = { ...today, id: 'old', dateKey: '2026-07-06' };
  const quota = getQuotaState([today, old], now);
  assert.equal(quota.used, 1);
  assert.equal(quota.remaining, 2);
});

test('primary reading flow records a result and stops at the free limit', () => {
  let history = [];
  for (let index = 0; index < 3; index += 1) {
    const outcome = runReadingFlow({ concern: ['love', 'work', 'self'][index], nickname: `u${index}` }, history, now);
    assert.equal(outcome.ok, true);
    history = outcome.history;
  }
  const blocked = runReadingFlow({ concern: 'money' }, history, now);
  assert.equal(blocked.ok, false);
  assert.equal(blocked.reason, 'quota');
  assert.equal(blocked.quota.remaining, 0);
});

test('streak follows consecutive Tokyo date keys', () => {
  const history = ['2026-07-05', '2026-07-06', '2026-07-07'].map((dateKey, index) => ({ id: String(index), dateKey }));
  assert.equal(computeStreak(history, now), 3);
});
