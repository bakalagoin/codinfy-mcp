# `@codinfy/mcp` — Codinfy Public MCP Server

> Official **Model Context Protocol** server for Codinfy.
> Connect your AI agent (Claude Code, Codex, Cursor, Continue, Cline, Windsurf) to the Codinfy platform to validate licenses, create checkouts, list products, track events, fetch brand tokens, manage OAuth metadata, configure ads, and more.

[![npm version](https://img.shields.io/npm/v/@codinfy/mcp.svg)](https://www.npmjs.com/package/@codinfy/mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Status

> 🚧 **v0.1.0 — scaffold.** Tool implementations land in AGENT-44.
> Track progress at [`docs.codinfy.com/mcp`](https://docs.codinfy.com/mcp).

---

## What is this?

The Model Context Protocol ([MCP](https://modelcontextprotocol.io)) is an open standard that lets AI agents call external tools through a well-defined transport. This package implements **the public Codinfy MCP server**: a thin TypeScript layer that exposes Codinfy's public APIs as MCP tools.

It is the tool any third-party developer, vendor, or agency uses when they want their agent to talk to Codinfy.

## Companion projects

| Repo | Purpose | License |
|---|---|---|
| [`codinfy-mcp`](https://github.com/bakalagoin/codinfy-mcp) (this) | Public MCP for Codinfy API consumers | MIT |
| [`codix-build-mcp`](https://github.com/bakalagoin/codix-build-mcp) | Codix Build MCP — scaffold projects with AI agents using Smart Context Mode | MIT |
| `codinfy-mcp-internal` | Private MCP for Codinfy team agents only | proprietary |

---

## Install

```bash
npm install -g @codinfy/mcp
# or
npx -y @codinfy/mcp
```

## Configure your agent

### Claude Code / Claude Desktop

`~/.claude/mcp.json` (or `claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "codinfy": {
      "command": "npx",
      "args": ["-y", "@codinfy/mcp"],
      "env": {
        "CODINFY_API_KEY": "pk_live_xxxxxxxxxxxxxxxxx"
      }
    }
  }
}
```

### Cursor

`Settings → Cursor → MCP → New Server`:

```json
{
  "name": "codinfy",
  "command": "npx",
  "args": ["-y", "@codinfy/mcp"],
  "env": { "CODINFY_API_KEY": "pk_live_xxxxxxxxxxxxxxxxx" }
}
```

### Codex / Continue / Cline / Windsurf

See [`docs.codinfy.com/mcp/clients`](https://docs.codinfy.com/mcp).

---

## Get an API key

Log in at [`codinfy.com/admin/parametres/api-s`](https://codinfy.com) and create a key:

- `pk_live_…` — production
- `pk_sandbox_…` — sandbox (free tier, rate-limited)

Keys are scoped (`licenses:read`, `payments:write`, `brand:read`, …) and rotateable from the same UI.

---

## Tools (16 — to be implemented in AGENT-44)

### Licenses
- `codinfy_license_validate` — validate a purchase code and domain
- `codinfy_license_list` — list licenses for a customer

### Products & checkout
- `codinfy_products_list`
- `codinfy_checkout_create`
- `codinfy_checkout_status`

### Brand & design
- `codinfy_brand_get` — current site name, colors, logos, social
- `codinfy_brand_tokens_get` — Tailwind CSS 4 tokens

### Identity (Login with Codinfy — OAuth 2.0 / OIDC)
- `codinfy_oauth_metadata` — `.well-known/openid-configuration`
- `codinfy_oauth_jwks` — public JWKS
- `codinfy_oauth_apps_list` — list connected applications

### Ads
- `codinfy_ads_config_get`
- `codinfy_ads_placement_create`
- `codinfy_ads_stats_get`

### Analytics & misc
- `codinfy_event_track` — track a custom event
- `codinfy_webhook_test`
- `codinfy_health`

> Detailed schemas, parameters, examples and changelogs live in [`docs.codinfy.com/mcp`](https://docs.codinfy.com/mcp).

---

## Development

```bash
git clone https://github.com/bakalagoin/codinfy-mcp.git
cd codinfy-mcp
npm install
npm run build
npm test
```

### Project layout

```
codinfy-mcp/
├── src/
│   ├── index.ts              # MCP server bootstrap (stdio transport)
│   ├── tools/                # one file per tool, all re-exported from index
│   ├── client/               # thin HTTP client for api.codinfy.com
│   └── types/                # shared schemas (Zod)
├── tests/
├── package.json
├── tsconfig.json
└── .github/workflows/        # ci.yml + publish-npm.yml
```

---

## Releases

Pushing a tag `v*` to `main` publishes to npm automatically (see [`publish-npm.yml`](.github/workflows/publish-npm.yml)).

```bash
npm version patch        # 0.1.0 → 0.1.1
git push --follow-tags
```

---

## Security

Report vulnerabilities privately to **security@codinfy.com**. See [`SECURITY.md`](SECURITY.md).

## Contributing

Issues and PRs welcome. See [`CONTRIBUTING.md`](CONTRIBUTING.md).

## License

[MIT](LICENSE) © 2026 RAFLOX SAS — Abidjan, Côte d'Ivoire.
