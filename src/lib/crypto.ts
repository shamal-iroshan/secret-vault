import type { EncryptedPayload } from "@/types/vault";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const KEY_CHECK_TEXT = "secret-vault-key-check-v1";

function bytesToBase64(bytes: ArrayBuffer | Uint8Array): string {
  const byteArray =
    bytes instanceof ArrayBuffer ? new Uint8Array(bytes) : bytes;
  let binary = "";

  byteArray.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });

  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

export function randomBase64(length = 16): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return bytesToBase64(bytes);
}

export async function deriveVaultKey(
  masterKey: string,
  saltBase64: string,
): Promise<CryptoKey> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(masterKey),
    "PBKDF2",
    false,
    ["deriveKey"],
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: base64ToArrayBuffer(saltBase64),
      iterations: 250000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptText(
  key: CryptoKey,
  text: string,
): Promise<EncryptedPayload> {
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const encrypted = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    encoder.encode(text),
  );

  return {
    iv: bytesToBase64(iv),
    data: bytesToBase64(encrypted),
  };
}

export async function decryptText(
  key: CryptoKey,
  payload: EncryptedPayload,
): Promise<string> {
  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: base64ToArrayBuffer(payload.iv) },
    key,
    base64ToArrayBuffer(payload.data),
  );

  return decoder.decode(decrypted);
}
