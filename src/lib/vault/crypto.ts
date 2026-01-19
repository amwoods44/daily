// Vault Encryption Utilities
// Uses Web Crypto API for secure client-side encryption

const SALT_LENGTH = 16;
const IV_LENGTH = 12;
const PBKDF2_ITERATIONS = 100000;
const ALGORITHM = 'AES-GCM';

// Convert string to ArrayBuffer (for Web Crypto API compatibility)
function stringToBuffer(str: string): ArrayBuffer {
  const encoded = new TextEncoder().encode(str);
  return toArrayBuffer(encoded);
}

// Convert Uint8Array to ArrayBuffer (handles TypeScript 5 strict typing)
function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  // Create a new ArrayBuffer and copy the data to ensure correct typing
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

// Convert ArrayBuffer to string
function bufferToString(buffer: ArrayBuffer): string {
  return new TextDecoder().decode(buffer);
}

// Convert Uint8Array to base64
function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Generate random bytes
function getRandomBytes(length: number): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(length));
}

// Derive encryption key from passphrase using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    stringToBuffer(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toArrayBuffer(salt),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypted data format
export interface EncryptedData {
  salt: string; // base64
  iv: string; // base64
  ciphertext: string; // base64
}

// Encrypt data with passphrase
export async function encrypt(data: string, passphrase: string): Promise<EncryptedData> {
  const salt = getRandomBytes(SALT_LENGTH);
  const iv = getRandomBytes(IV_LENGTH);
  const key = await deriveKey(passphrase, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: ALGORITHM, iv: toArrayBuffer(iv) },
    key,
    stringToBuffer(data)
  );

  return {
    salt: bytesToBase64(salt),
    iv: bytesToBase64(iv),
    ciphertext: bytesToBase64(new Uint8Array(ciphertext)),
  };
}

// Decrypt data with passphrase
export async function decrypt(encrypted: EncryptedData, passphrase: string): Promise<string> {
  const salt = base64ToBytes(encrypted.salt);
  const iv = base64ToBytes(encrypted.iv);
  const ciphertext = base64ToBytes(encrypted.ciphertext);

  const key = await deriveKey(passphrase, salt);

  const decrypted = await crypto.subtle.decrypt(
    { name: ALGORITHM, iv: toArrayBuffer(iv) },
    key,
    toArrayBuffer(ciphertext)
  );

  return bufferToString(decrypted);
}

// Hash passphrase for verification (stored separately from encrypted data)
export async function hashPassphrase(
  passphrase: string,
  salt?: Uint8Array
): Promise<{ hash: string; salt: string }> {
  const useSalt = salt || getRandomBytes(SALT_LENGTH);
  const key = await deriveKey(passphrase, useSalt);

  // Export key and hash it
  const exported = await crypto.subtle.exportKey('raw', key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', exported);

  return {
    hash: bytesToBase64(new Uint8Array(hashBuffer)),
    salt: bytesToBase64(useSalt),
  };
}

// Verify passphrase against stored hash
export async function verifyPassphrase(
  passphrase: string,
  storedHash: string,
  storedSalt: string
): Promise<boolean> {
  const salt = base64ToBytes(storedSalt);
  const { hash } = await hashPassphrase(passphrase, salt);
  return hash === storedHash;
}

// Check if Web Crypto API is available
export function isCryptoAvailable(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}
