// adminAuth.ts: Edge Runtime 호환 관리자 토큰 서명/검증 유틸
// Web Crypto API (crypto.subtle) 사용 — Node.js API 사용 금지

const ALGORITHM = "HMAC-SHA256";
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24시간

function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlDecode(str: string): Uint8Array {
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(secret);
  return crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * 페이로드 {username, exp}를 AUTH_SECRET으로 HMAC-SHA256 서명 후 base64url 반환
 */
export async function signAdminToken(username: string): Promise<string> {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");

  const exp = Date.now() + TOKEN_TTL_MS;
  const payload = JSON.stringify({ username, exp });

  const encoder = new TextEncoder();
  const key = await importHmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

  const encodedPayload = base64urlEncode(encoder.encode(payload).buffer as ArrayBuffer);
  const encodedSignature = base64urlEncode(signature);

  return `${encodedPayload}.${encodedSignature}`;
}

/**
 * 토큰 검증: 서명 확인 + 만료 시간 확인
 */
export async function verifyAdminToken(token: string): Promise<boolean> {
  try {
    const secret = process.env.AUTH_SECRET;
    if (!secret) return false;

    const dotIndex = token.lastIndexOf(".");
    if (dotIndex === -1) return false;

    const encodedPayload = token.slice(0, dotIndex);
    const encodedSignature = token.slice(dotIndex + 1);

    const payloadBytes = base64urlDecode(encodedPayload);
    const signatureBytes = base64urlDecode(encodedSignature);

    const key = await importHmacKey(secret);
    const isValid = await crypto.subtle.verify(
      "HMAC",
      key,
      signatureBytes,
      payloadBytes
    );

    if (!isValid) return false;

    const payloadStr = new TextDecoder().decode(payloadBytes);
    const payload = JSON.parse(payloadStr) as { username: string; exp: number };

    if (typeof payload.exp !== "number" || Date.now() > payload.exp) return false;

    return true;
  } catch {
    return false;
  }
}
