#!/usr/bin/env node
/**
 * @codinfy/mcp — official Codinfy public MCP server (AGENT-44).
 *
 * 10 tools backed by REAL shipped Codinfy APIs (rule R11):
 *   licenses  : validate, status, grace period, check-update (HMAC-signed)
 *   catalog   : list / get / search published products
 *   platform  : design tokens, health, integration links
 *
 * Payments, OAuth (Login with Codinfy) and Ads tools ship together with
 * their platform APIs (AGENT-15 / AGENT-51) — nothing here is stubbed.
 *
 * Env: CODINFY_API_BASE (default https://api.codinfy.com/api),
 *      CODINFY_SITE_BASE, CODINFY_LICENSE_SECRET (license tools only),
 *      CODINFY_API_KEY (pk_live_… — forwarded once the developer portal
 *      issues keys; optional today). No credential is ever hardcoded (R1).
 *
 * Spec: https://docs.codinfy.com/mcp
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

import { CodinfyApiClient } from "./api-client.js";
import { loadConfig, PACKAGE_NAME, PACKAGE_VERSION } from "./config.js";
import { registerTools } from "./tools.js";

export function buildServer(env: NodeJS.ProcessEnv = process.env): McpServer {
  const config = loadConfig(env);
  const client = new CodinfyApiClient(config);

  const server = new McpServer({ name: PACKAGE_NAME, version: PACKAGE_VERSION });
  registerTools(server, client, config);

  return server;
}

async function main(): Promise<void> {
  const server = buildServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${PACKAGE_NAME}] v${PACKAGE_VERSION} ready on stdio (10 tools).`);
}

// Only start the stdio loop when executed directly (not when imported by tests).
const entry = process.argv[1]?.replace(/\\/g, "/");
if (entry && import.meta.url.endsWith(entry.split("/").pop() ?? "")) {
  main().catch((error: unknown) => {
    console.error(`[${PACKAGE_NAME}] Fatal:`, error);
    process.exit(1);
  });
}
