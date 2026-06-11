import { describe, expect, it } from "vitest";

import { CodinfyApiClient, CodinfyApiError } from "../src/api-client.js";
import { loadConfig } from "../src/config.js";
import { DESIGN_TOKENS } from "../src/design-tokens.js";
import { signPayload } from "../src/signing.js";

const baseEnv = {
  CODINFY_API_BASE: "https://api.codinfy.test/api",
  CODINFY_LICENSE_SECRET: "codinfy-test-secret",
} as NodeJS.ProcessEnv;

function jsonResponse(body: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...headers },
  });
}

describe("signing", () => {
  it("matches the PHP hash_hmac cross-language vector", () => {
    // php -r "echo hash_hmac('sha256','{\"purchase_code\":\"abc\",\"timestamp\":1760000000}','codinfy-test-secret');"
    expect(signPayload('{"purchase_code":"abc","timestamp":1760000000}', "codinfy-test-secret")).toBe(
      "7cc2ba642b193c8c9cb00a76663a11de21c6a0b4c1fdb2effb1244f042d5e6af",
    );
  });
});

describe("CodinfyApiClient", () => {
  it("signs the exact raw body and adds an anti-replay timestamp", async () => {
    let captured: { url: string; init: RequestInit } | null = null;
    const fetchImpl = (async (url: string | URL, init?: RequestInit) => {
      captured = { url: String(url), init: init! };

      return jsonResponse({ status: "valid" });
    }) as typeof fetch;

    const client = new CodinfyApiClient(loadConfig(baseEnv), fetchImpl);
    await client.postSigned("/license/validate", { purchase_code: "abc", domain: "shop.ci" });

    const headers = captured!.init.headers as Record<string, string>;
    const body = captured!.init.body as string;

    expect(captured!.url).toBe("https://api.codinfy.test/api/license/validate");
    expect(headers["X-Codinfy-Signature"]).toBe(signPayload(body, "codinfy-test-secret"));
    expect(JSON.parse(body).timestamp).toBeGreaterThan(1_700_000_000);
  });

  it("refuses license calls without CODINFY_LICENSE_SECRET (clear error, no fake call)", async () => {
    const client = new CodinfyApiClient(loadConfig({ CODINFY_API_BASE: baseEnv.CODINFY_API_BASE } as NodeJS.ProcessEnv));

    await expect(client.postSigned("/license/validate", {})).rejects.toThrowError(CodinfyApiError);
    await expect(client.postSigned("/license/validate", {})).rejects.toThrow(/CODINFY_LICENSE_SECRET/);
  });

  it("relays X-RateLimit headers and query params on GET", async () => {
    const fetchImpl = (async (url: string | URL) => {
      expect(String(url)).toBe("https://api.codinfy.test/api/v1/products?q=store&limit=5");

      return jsonResponse({ data: [] }, 200, { "X-RateLimit-Limit": "60", "X-RateLimit-Remaining": "59" });
    }) as typeof fetch;

    const client = new CodinfyApiClient(loadConfig(baseEnv), fetchImpl);
    const result = await client.getJson("/v1/products", { q: "store", limit: 5, cursor: undefined });

    expect(result.rateLimit).toEqual({ limit: "60", remaining: "59" });
  });

  it("forwards the public API key when configured (future pk_live)", async () => {
    let headers: Record<string, string> = {};
    const fetchImpl = (async (_url: string | URL, init?: RequestInit) => {
      headers = init!.headers as Record<string, string>;

      return jsonResponse({ status: "ok" });
    }) as typeof fetch;

    const client = new CodinfyApiClient(
      loadConfig({ ...baseEnv, CODINFY_API_KEY: "pk_sandbox_123" } as NodeJS.ProcessEnv),
      fetchImpl,
    );
    await client.getJson("/v1/health");

    expect(headers["X-Codinfy-Api-Key"]).toBe("pk_sandbox_123");
  });
});

describe("design tokens", () => {
  it("ship the official palette (identity constants, no network)", () => {
    expect(DESIGN_TOKENS.colors.primary).toBe("#1A1A1A");
    expect(DESIGN_TOKENS.colors.premium).toBe("#C6A15B");
    expect(DESIGN_TOKENS.ux.minTouchTarget).toBe("44px");
  });
});
