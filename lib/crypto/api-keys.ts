import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getMasterKey(): Buffer {
  const key = process.env["ENCRYPTION_KEY"];
  if (!key) {
    throw new Error("ENCRYPTION_KEY environment variable is not set");
  }
  return Buffer.from(key, "base64");
}

export function encryptKey(plaintext: string): { encrypted: string; iv: string } {
  const masterKey = getMasterKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, masterKey, iv, { authTagLength: AUTH_TAG_LENGTH });

  let encrypted = cipher.update(plaintext, "utf8", "base64");
  encrypted += cipher.final("base64");
  const authTag = cipher.getAuthTag();

  return {
    encrypted: encrypted + "." + authTag.toString("base64"),
    iv: iv.toString("base64"),
  };
}

export function decryptKey(encrypted: string, iv: string): string {
  const masterKey = getMasterKey();
  const [ciphertext, authTagB64] = encrypted.split(".");

  if (!ciphertext || !authTagB64) {
    throw new Error("Invalid encrypted format");
  }

  const decipher = createDecipheriv(ALGORITHM, masterKey, Buffer.from(iv, "base64"), {
    authTagLength: AUTH_TAG_LENGTH,
  });
  decipher.setAuthTag(Buffer.from(authTagB64, "base64"));

  let decrypted = decipher.update(ciphertext, "base64", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

export function maskKey(plaintext: string): string {
  if (plaintext.length <= 8) {
    return "****";
  }
  const prefix = plaintext.slice(0, 7);
  const suffix = plaintext.slice(-4);
  return `${prefix}****${suffix}`;
}
