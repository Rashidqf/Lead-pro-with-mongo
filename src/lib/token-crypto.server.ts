import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto";

function keyBytes() {
  const raw = process.env.TOKEN_ENCRYPTION_KEY || process.env.AUTH_SECRET || "";
  if (!raw) throw new Error("Missing TOKEN_ENCRYPTION_KEY or AUTH_SECRET");
  return createHash("sha256").update(raw).digest();
}

/** Encrypt a secret string for Mongo storage. Format: v1:ivHex:tagHex:cipherHex */
export function encryptSecret(plain: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", keyBytes(), iv);
  const enc = Buffer.concat([cipher.update(plain, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return `v1:${iv.toString("hex")}:${tag.toString("hex")}:${enc.toString("hex")}`;
}

export function decryptSecret(payload: string): string {
  const [ver, ivHex, tagHex, dataHex] = payload.split(":");
  if (ver !== "v1" || !ivHex || !tagHex || !dataHex) throw new Error("Invalid encrypted payload");
  const decipher = createDecipheriv("aes-256-gcm", keyBytes(), Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));
  return Buffer.concat([
    decipher.update(Buffer.from(dataHex, "hex")),
    decipher.final(),
  ]).toString("utf8");
}
