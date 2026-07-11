function toHex(bytes) {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

export function parseStripeSignature(header = '') {
  const values = { t: [], v1: [] };
  for (const part of String(header).split(',')) {
    const separator = part.indexOf('=');
    if (separator < 1) continue;
    const key = part.slice(0, separator).trim();
    const value = part.slice(separator + 1).trim();
    if (key in values && value) values[key].push(value);
  }
  return {
    timestamp: Number(values.t[0]),
    signatures: values.v1
  };
}

export async function createStripeSignature(payload, secret, timestamp) {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${timestamp}.${payload}`)
  );
  return toHex(new Uint8Array(signature));
}

export async function verifyStripeSignature(payload, header, secret, options = {}) {
  const toleranceSeconds = options.toleranceSeconds ?? 300;
  const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
  const parsed = parseStripeSignature(header);
  if (!Number.isFinite(parsed.timestamp) || parsed.signatures.length === 0) return false;
  if (Math.abs(nowSeconds - parsed.timestamp) > toleranceSeconds) return false;
  const expected = await createStripeSignature(payload, secret, parsed.timestamp);
  return parsed.signatures.some((signature) => constantTimeEqual(expected, signature));
}
