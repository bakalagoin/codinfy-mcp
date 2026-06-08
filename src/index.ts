#!/usr/bin/env node
/**
 * @codinfy/mcp — Codinfy public MCP server (scaffold).
 *
 * Full tool implementations land in AGENT-44 of the Codinfy build plan.
 * This entry point will register 16 tools across:
 *   - Licenses (validate, list)
 *   - Products & checkout (list, create, status)
 *   - Brand & design (get, tokens)
 *   - Identity / Login with Codinfy (OAuth metadata, JWKS, connected apps)
 *   - Codinfy Ads (config, placements, stats)
 *   - Analytics (event_track, webhook_test, health)
 *
 * Auth: CODINFY_API_KEY env var (pk_live_… or pk_sandbox_…).
 * Spec: https://docs.codinfy.com/mcp
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const PACKAGE_NAME = "@codinfy/mcp";
const PACKAGE_VERSION = "0.1.0";

async function main(): Promise<void> {
  const apiKey = process.env.CODINFY_API_KEY;
  if (!apiKey) {
    console.error(
      `[${PACKAGE_NAME}] Missing CODINFY_API_KEY. ` +
        "Generate one at https://codinfy.com/admin/parametres/api-s and set it as an env var.",
    );
    process.exit(1);
  }

  const server = new Server(
    { name: PACKAGE_NAME, version: PACKAGE_VERSION },
    { capabilities: { tools: {} } },
  );

  // AGENT-44: register tools here.
  // server.setRequestHandler(...)

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error(`[${PACKAGE_NAME}] v${PACKAGE_VERSION} ready on stdio.`);
}

main().catch((error: unknown) => {
  console.error(`[${PACKAGE_NAME}] Fatal:`, error);
  process.exit(1);
});
