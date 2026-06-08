# Security Policy

## Reporting a vulnerability

If you discover a security issue in `@codinfy/mcp`, please **do not open a public GitHub issue**. Email us instead:

- **security@codinfy.com**

Include:

- a description of the issue and its impact;
- reproduction steps (code, requests, MCP client config);
- the version of `@codinfy/mcp` you tested (`npm ls @codinfy/mcp`);
- your name / handle for credit (optional).

We acknowledge reports within **2 business days** and aim to patch and publish within **30 days** for high-severity issues.

## Scope

In scope:

- code in this repository (`bakalagoin/codinfy-mcp`);
- the npm package `@codinfy/mcp`;
- documentation at `docs.codinfy.com/mcp`.

Out of scope:

- the Codinfy platform itself (`codinfy.com`, `api.codinfy.com`, `pay.codinfy.com`) — report those via [`codinfy.com/security`](https://codinfy.com/security);
- third-party packages we depend on (report upstream).

## Hardening guidance for users

- Never commit your `CODINFY_API_KEY` to source control.
- Use `pk_sandbox_…` keys for local development; reserve `pk_live_…` for production agents.
- Rotate keys regularly from `/admin/parametres/api-s`.
- Pin the version in your MCP client config (e.g. `npx -y @codinfy/mcp@0.1.0`) to avoid pulling unreviewed updates.

## License

Reports and patches accepted under the [MIT License](LICENSE).
