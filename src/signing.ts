import { createHmac } from "node:crypto";

/**
 * HMAC-SHA256 hex signature of a RAW JSON body — the exact wire contract
 * enforced by the Codinfy License API (header `X-Codinfy-Signature`) and
 * shared with the PHP & Node SDKs. Tested against a cross-language vector
 * so all clients stay byte-compatible.
 */
export function signPayload(rawBody: string, secret: string): string {
  if (rawBody === "") throw new TypeError("rawBody must be a non-empty string");
  if (secret === "") throw new TypeError("secret must be a non-empty string");

  return createHmac("sha256", secret).update(rawBody, "utf8").digest("hex");
}
