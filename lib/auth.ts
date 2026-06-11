// Sessões assinadas com Web Crypto HMAC-SHA256 (sem jose — npm SSL indisponível).
const SESSION_COOKIE = "session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 dias

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("AUTH_SECRET deve estar definido em produção");
  }
  return secret ?? "dev-secret-altere-em-producao";
}

async function getHmacKey(): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

function toBase64Url(bytes: Uint8Array): string {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(value: string): ArrayBuffer {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const buf = Buffer.from(padded, "base64");
  // slice evita o pool ArrayBuffer de 8KB de Buffer.buffer (quebrava HMAC verify).
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
}

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
  exp: number;
};

export async function createSessionToken(
  payload: Omit<SessionPayload, "exp">,
): Promise<string> {
  const data: SessionPayload = {
    ...payload,
    exp: Date.now() + SESSION_MAX_AGE * 1000,
  };
  const encoded = toBase64Url(new TextEncoder().encode(JSON.stringify(data)));
  const key = await getHmacKey();
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(encoded),
  );
  return `${encoded}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function verifySessionToken(
  token: string,
): Promise<SessionPayload | null> {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  try {
    const key = await getHmacKey();
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(signature),
      new TextEncoder().encode(encoded),
    );
    if (!valid) return null;

    const payload = JSON.parse(
      new TextDecoder().decode(fromBase64Url(encoded)),
    ) as SessionPayload;

    if (payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_MAX_AGE };
