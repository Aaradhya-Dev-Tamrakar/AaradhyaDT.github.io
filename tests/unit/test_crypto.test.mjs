import test from 'node:test';
import assert from 'node:assert/strict';

const KEY_CACHE = new Map();

async function getDecryptionKey(passcode) {
  const norm = (passcode || '').trim().toLowerCase();
  if (KEY_CACHE.has(norm)) return KEY_CACHE.get(norm);
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(norm),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const derived = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('adt_salt_2026'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
  KEY_CACHE.set(norm, derived);
  return derived;
}

async function encryptPayload(plainText, passcode) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode((passcode || '').trim().toLowerCase()),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: enc.encode('adt_salt_2026'),
      iterations: 100000,
      hash: 'SHA-256'
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encryptedBuf = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv, tagLength: 128 },
    key,
    enc.encode(plainText)
  );
  const cipherBytesWithTag = new Uint8Array(encryptedBuf);
  const tag = cipherBytesWithTag.slice(cipherBytesWithTag.length - 16);
  const cipherOnly = cipherBytesWithTag.slice(0, cipherBytesWithTag.length - 16);

  const out = new Uint8Array(12 + 16 + cipherOnly.length);
  out.set(iv, 0);
  out.set(tag, 12);
  out.set(cipherOnly, 28);
  return Array.from(out).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function decryptHexPayload(hexStr, passcode) {
  try {
    const bytes = new Uint8Array(hexStr.match(/.{1,2}/g).map(b => parseInt(b, 16)));
    const iv = bytes.slice(0, 12);
    const tag = bytes.slice(12, 28);
    const cipherBytes = bytes.slice(28);

    const data = new Uint8Array(cipherBytes.length + tag.length);
    data.set(cipherBytes, 0);
    data.set(tag, cipherBytes.length);

    const key = await getDecryptionKey(passcode);
    const decrypted = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv, tagLength: 128 },
      key,
      data
    );
    return new TextDecoder().decode(decrypted);
  } catch (e) {
    return null;
  }
}

test('Crypto: PBKDF2 key derivation & memoization', async () => {
  const key1 = await getDecryptionKey('vip2026');
  assert.ok(key1, 'Key should be successfully derived');
  const key2 = await getDecryptionKey('vip2026');
  assert.strictEqual(key1, key2, 'Key should be retrieved from in-memory cache');
});

test('Crypto: AES-256-GCM roundtrip encryption and decryption', async () => {
  const secretText = 'https://github.com/AaradhyaDT/confidential-project-spec';
  const hex = await encryptPayload(secretText, 'vip2026');
  assert.ok(hex.length > 56, 'Encrypted hex should contain IV, tag, and ciphertext');

  const decrypted = await decryptHexPayload(hex, 'vip2026');
  assert.strictEqual(decrypted, secretText, 'Decrypted text should match original plaintext');
});

test('Crypto: Incorrect passcode fails decryption gracefully', async () => {
  const secretText = 'Secret spec';
  const hex = await encryptPayload(secretText, 'correct_passcode');

  const result = await decryptHexPayload(hex, 'wrong_passcode');
  assert.strictEqual(result, null, 'Decryption with incorrect passcode should return null');
});

test('Crypto: Corrupted ciphertext fails gracefully', async () => {
  const corruptedHex = '0102030405060708090a0b0c00112233445566778899aabbccddeeffdeadbeefcafebabe';
  const result = await decryptHexPayload(corruptedHex, 'vip2026');
  assert.strictEqual(result, null, 'Corrupted payload should return null without crashing');
});
