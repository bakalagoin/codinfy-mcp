import type { CodinfyConfig } from "./config.js";
import { PACKAGE_NAME, PACKAGE_VERSION } from "./config.js";
import { signPayload } from "./signing.js";

export interface ApiResult {
  status: number;
  body: unknown;
  /** Relayed X-RateLimit-* headers so agents can self-throttle (T44.11). */
  rateLimit: { limit: string | null; remaining: string | null };
}

export class CodinfyApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: unknown = null,
  ) {
    super(message);
    this.name = "CodinfyApiError";
  }
}

/**
 * Minimal HTTPS client for the real Codinfy API. No retry storms, honest
 * errors, 15s timeout. License POSTs are HMAC-signed on the raw body with
 * an anti-replay timestamp (T44.12 — same contract as AGENT-03).
 */
export class CodinfyApiClient {
  constructor(
    private readonly config: CodinfyConfig,
    private readonly fetchImpl: typeof fetch = fetch,
  ) {}

  async getJson(path: string, params: Record<string, string | number | undefined> = {}): Promise<ApiResult> {
    const url = new URL(this.config.apiBase + path);
    for (const [key, value] of Object.entries(params)) {
      if (value !== undefined && value !== "") url.searchParams.set(key, String(value));
    }

    return this.send(url.toString(), { method: "GET", headers: this.baseHeaders() });
  }

  /** Signed license POST. Throws a clear error when no secret is configured. */
  async postSigned(path: string, payload: Record<string, unknown>): Promise<ApiResult> {
    if (!this.config.licenseSecret) {
      throw new CodinfyApiError(
        "CODINFY_LICENSE_SECRET is not set. License tools need the HMAC secret " +
          "delivered with your Codinfy license (never commit it; pass it as an env var).",
        0,
      );
    }

    const body = JSON.stringify({ ...payload, timestamp: Math.floor(Date.now() / 1000) });

    return this.send(this.config.apiBase + path, {
      method: "POST",
      headers: {
        ...this.baseHeaders(),
        "Content-Type": "application/json",
        "X-Codinfy-Signature": signPayload(body, this.config.licenseSecret),
      },
      body,
    });
  }

  private baseHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "User-Agent": `${PACKAGE_NAME}/${PACKAGE_VERSION}`,
    };
    if (this.config.apiKey) headers["X-Codinfy-Api-Key"] = this.config.apiKey;

    return headers;
  }

  private async send(url: string, init: RequestInit): Promise<ApiResult> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 15_000);

    let response: Response;
    try {
      response = await this.fetchImpl(url, { ...init, signal: controller.signal });
    } catch (cause) {
      throw new CodinfyApiError(`Codinfy API unreachable: ${(cause as Error).message}`, 0);
    } finally {
      clearTimeout(timer);
    }

    let body: unknown = null;
    try {
      body = await response.json();
    } catch {
      throw new CodinfyApiError(`Codinfy API returned non-JSON (HTTP ${response.status}).`, response.status);
    }

    return {
      status: response.status,
      body,
      rateLimit: {
        limit: response.headers.get("X-RateLimit-Limit"),
        remaining: response.headers.get("X-RateLimit-Remaining"),
      },
    };
  }
}
