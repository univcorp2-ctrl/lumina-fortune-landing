import test from 'node:test';
import assert from 'node:assert/strict';
import { HISTORY_KEY, clearDemoData, createMemoryStorage, loadHistory, saveHistory } from '../src/storage.js';

test('history round-trips through the storage adapter', () => {
  const storage = createMemoryStorage();
  const history = [{ id: 'one', dateKey: '2026-07-07' }];
  saveHistory(history, storage);
  assert.deepEqual(loadHistory(storage), history);
});

test('invalid JSON fails safely', () => {
  const storage = createMemoryStorage({ [HISTORY_KEY]: '{bad json' });
  assert.deepEqual(loadHistory(storage), []);
});

test('demo reset removes stored history', () => {
  const storage = createMemoryStorage();
  saveHistory([{ id: 'one', dateKey: '2026-07-07' }], storage);
  clearDemoData(storage);
  assert.deepEqual(loadHistory(storage), []);
});
