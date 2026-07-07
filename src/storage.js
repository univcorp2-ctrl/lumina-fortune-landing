const HISTORY_KEY = 'lumina:reading-history:v1';

export function createMemoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  return {
    getItem(key) { return values.has(key) ? values.get(key) : null; },
    setItem(key, value) { values.set(key, String(value)); },
    removeItem(key) { values.delete(key); },
    clear() { values.clear(); }
  };
}

export function loadHistory(storage = globalThis.localStorage) {
  try {
    const value = storage?.getItem(HISTORY_KEY);
    if (!value) return [];
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item) => item && item.dateKey && item.id) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history, storage = globalThis.localStorage) {
  storage?.setItem(HISTORY_KEY, JSON.stringify(Array.isArray(history) ? history.slice(-30) : []));
}

export function clearDemoData(storage = globalThis.localStorage) {
  storage?.removeItem(HISTORY_KEY);
}

export { HISTORY_KEY };
