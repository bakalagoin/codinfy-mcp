import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { CodinfyApiClient, CodinfyApiError, type ApiResult } from "./api-client.js";
import type { CodinfyConfig } from "./config.js";
import { DESIGN_TOKENS } from "./design-tokens.js";

type ToolResult = {
  content: Array<{ type: "text"; text: string }>;
  isError?: boolean;
};

function ok(data: unknown, rateLimit?: ApiResult["rateLimit"]): ToolResult {
  const payload = rateLimit?.remaining != null ? { data, rate_limit: rateLimit } : { data };

  return { content: [{ type: "text", text: JSON.stringify(payload, null, 2) }] };
}

function fail(error: unknown): ToolResult {
  const message =
    error instanceof CodinfyApiError
      ? `${error.message}${error.body ? `\n${JSON.stringify(error.body, null, 2)}` : ""}`
      : error instanceof Error
        ? error.message
        : String(error);

  return { content: [{ type: "text", text: message }], isError: true };
}

const purchaseCode = z.string().uuid().describe("Codinfy purchase code (UUID) delivered with the license");
const domain = z.string().min(3).max(255).describe("Domain the script runs on, e.g. monsite.ci");

/**
 * Registers every public tool. Each one calls a REAL shipped Codinfy API
 * (rule R11) — payment, OAuth and Ads tools will be added when those
 * platform APIs ship (AGENT-15 / AGENT-51); nothing is stubbed here.
 */
export function registerTools(server: McpServer, client: CodinfyApiClient, config: CodinfyConfig): void {
  // ---- Licenses (License API, AGENT-03) ------------------------------
  server.registerTool(
    "codinfy_validate_license",
    {
      description:
        "Validate a Codinfy license for a domain. Returns the signed status " +
        "(valid | read_only | disabled), grace-period info and a JWT (RS256) " +
        "to verify locally. Requires CODINFY_LICENSE_SECRET.",
      inputSchema: {
        purchase_code: purchaseCode,
        domain,
        product_id: z.number().int().positive().optional(),
        script_version: z.string().max(50).optional(),
      },
    },
    async (input) => {
      try {
        const result = await client.postSigned("/license/validate", input);

        return ok(result.body, result.rateLimit);
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "codinfy_check_license_status",
    {
      description:
        "Lightweight license status check (valid | read_only | disabled | grace). " +
        "Same signed validate call, summarised for quick agent decisions.",
      inputSchema: { purchase_code: purchaseCode, domain },
    },
    async (input) => {
      try {
        const result = await client.postSigned("/license/validate", input);
        const body = result.body as Record<string, unknown>;

        return ok(
          {
            status: body.status ?? "unknown",
            message: body.message ?? null,
            grace: body.grace ?? body.grace_until ?? null,
          },
          result.rateLimit,
        );
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "codinfy_get_grace_period",
    {
      description:
        "Inspect the 72h grace-period state of a license (active or not, until when). " +
        "Codinfy never hard-kills a site: expired licenses degrade gracefully.",
      inputSchema: { purchase_code: purchaseCode, domain },
    },
    async (input) => {
      try {
        const result = await client.postSigned("/license/validate", input);
        const body = result.body as Record<string, unknown>;

        return ok(
          {
            status: body.status ?? "unknown",
            grace: body.grace ?? body.grace_until ?? null,
            policy: "72h read-only grace, then progressive kill-switch (valid → read_only → disabled).",
          },
          result.rateLimit,
        );
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "codinfy_check_license_update",
    {
      description:
        "Ask whether a newer version of the licensed script exists. Returns " +
        "update_available, latest_version, changelog and a signed download " +
        "URL (valid 1h) when support is active.",
      inputSchema: {
        purchase_code: purchaseCode,
        domain,
        current_version: z.string().min(1).max(50).describe("Installed script version, e.g. 1.4.2"),
      },
    },
    async (input) => {
      try {
        const result = await client.postSigned("/license/check-update", input);

        return ok(result.body, result.rateLimit);
      } catch (error) {
        return fail(error);
      }
    },
  );

  // ---- Catalog (public products API, AGENT-44) -----------------------
  server.registerTool(
    "codinfy_list_products",
    {
      description:
        "List published Codinfy marketplace products (cursor-paginated). " +
        "Public data only; prices in XOF tiers standard/extended/agency.",
      inputSchema: {
        category: z.string().max(100).optional(),
        type: z.enum(["script", "plugin", "pack", "addon"]).optional(),
        limit: z.number().int().min(1).max(50).optional(),
        cursor: z.string().optional().describe("next_cursor from a previous call"),
      },
    },
    async (input) => {
      try {
        const result = await client.getJson("/v1/products", { ...input });

        return ok(result.body, result.rateLimit);
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "codinfy_get_product",
    {
      description: "Full public sheet of one published product (description, changelog, requirements, prices).",
      inputSchema: { slug: z.string().min(1).max(255).describe("Product slug, e.g. codinfy-store-pro") },
    },
    async ({ slug }) => {
      try {
        const result = await client.getJson(`/v1/products/${encodeURIComponent(slug)}`);
        if (result.status === 404) {
          return fail(new CodinfyApiError(`No published product with slug "${slug}".`, 404, result.body));
        }

        return ok(result.body, result.rateLimit);
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "codinfy_search_products",
    {
      description: "Search published products by keyword (title, summary, category).",
      inputSchema: {
        query: z.string().min(2).max(120),
        limit: z.number().int().min(1).max(50).optional(),
      },
    },
    async ({ query, limit }) => {
      try {
        const result = await client.getJson("/v1/products", { q: query, limit });

        return ok(result.body, result.rateLimit);
      } catch (error) {
        return fail(error);
      }
    },
  );

  // ---- Brand & platform ----------------------------------------------
  server.registerTool(
    "codinfy_get_design_tokens",
    {
      description:
        "Official Codinfy design tokens (colors, typography, UX rules) for " +
        "brand-consistent integrations. Versioned identity constants.",
      inputSchema: {},
    },
    async () => ok(DESIGN_TOKENS),
  );

  server.registerTool(
    "codinfy_health",
    {
      description: "Liveness check of the Codinfy API (GET /v1/health).",
      inputSchema: {},
    },
    async () => {
      try {
        const result = await client.getJson("/v1/health");

        return ok(result.body, result.rateLimit);
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    "codinfy_get_integration_links",
    {
      description:
        "Canonical links for integrating Codinfy: OpenAPI spec, PHP/Node SDKs, " +
        "Postman collection, anti-tampering guide, docs site.",
      inputSchema: {},
    },
    async () =>
      ok({
        site: config.siteBase,
        docs: "https://docs.codinfy.com",
        openapi: "https://github.com/bakalagoin/codinfy/blob/main/docs/api-spec.yaml",
        sdk_php: "https://github.com/bakalagoin/codinfy/blob/main/docs/sdk/CodinifyLicenseValidator.php",
        sdk_node: "https://github.com/bakalagoin/codinfy/tree/main/sdk/codinfy-sdk-js",
        postman: "https://github.com/bakalagoin/codinfy/blob/main/docs/postman/codinfy-license-api.postman_collection.json",
        anti_tampering_guide: "https://github.com/bakalagoin/codinfy/blob/main/docs/sdk/INTEGRATION_GUIDE.md",
        support: "support@codinfy.com",
      }),
  );
}
