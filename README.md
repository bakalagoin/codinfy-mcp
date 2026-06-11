# `@codinfy/mcp` — Codinfy Public MCP Server

> Official **Model Context Protocol** server for Codinfy. Connect your AI
> agent (Claude Code/Desktop, Cursor, Codex, Continue, Cline, Windsurf) to
> the Codinfy platform: validate licenses, check updates, browse the
> marketplace catalog and fetch the official design tokens.

[![npm version](https://img.shields.io/npm/v/@codinfy/mcp.svg)](https://www.npmjs.com/package/@codinfy/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Status

**v0.2.0** — 10 tools live, every one backed by a real shipped Codinfy API
(no stubs, ever). Payments, OAuth (Login with Codinfy) and Ads tools ship
together with their platform APIs.

## Quick start

```bash
# Claude Code
claude mcp add codinfy -e CODINFY_LICENSE_SECRET=xxx -- npx -y @codinfy/mcp
```

Configs for Claude Desktop, Cursor, Codex, Continue and Cline:
[`examples/`](examples/). Full guide: [`docs/getting-started.md`](docs/getting-started.md).

## Tools

| Category | Tools |
|---|---|
| **Licenses** (HMAC-signed) | `codinfy_validate_license` · `codinfy_check_license_status` · `codinfy_get_grace_period` · `codinfy_check_license_update` |
| **Catalog** | `codinfy_list_products` · `codinfy_get_product` · `codinfy_search_products` |
| **Platform** | `codinfy_get_design_tokens` · `codinfy_health` · `codinfy_get_integration_links` |

Details: [`docs/api-reference.md`](docs/api-reference.md) ·
problems: [`docs/troubleshooting.md`](docs/troubleshooting.md).

## Environment

| Variable | Required | Purpose |
|---|---|---|
| `CODINFY_LICENSE_SECRET` | license tools only | HMAC secret delivered with your license — **never commit it** |
| `CODINFY_API_BASE` | no | default `https://api.codinfy.com/api` |
| `CODINFY_SITE_BASE` | no | default `https://codinfy.com` |
| `CODINFY_API_KEY` | no | `pk_live_…` forwarded as `X-Codinfy-Api-Key`; key issuance arrives with the developer portal |

## Security model

- Requests to the License API are signed **HMAC-SHA256 over the raw body**
  with an anti-replay timestamp (±300 s) — the same wire contract as the
  official PHP and Node SDKs (cross-language test vector in `tests/`).
- Responses carry an **RS256 JWT**: verify it locally in your script (see
  the [anti-tampering guide](https://github.com/bakalagoin/codinfy/blob/main/docs/sdk/INTEGRATION_GUIDE.md)).
- `X-RateLimit-*` headers are relayed in every tool result so agents can
  self-throttle (60 req/min/IP).
- This public server never exposes internal Codinfy tooling (rule R15).

## Development

```bash
npm install
npm test          # vitest — includes the PHP cross-language HMAC vector
npm run build     # tsc → dist/
node dist/index.js  # stdio server, "ready on stdio (10 tools)"
```

## License

MIT © [RAFLOX SAS](https://codinfy.com) — Codinfy, Abidjan.
