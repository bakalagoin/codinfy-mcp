# Contributing to `@codinfy/mcp`

Thanks for your interest. This repository is the **public** Codinfy MCP server. Issues and PRs are welcome from anyone.

## Quick start

```bash
git clone https://github.com/bakalagoin/codinfy-mcp.git
cd codinfy-mcp
npm install
cp .env.example .env       # add your CODINFY_API_KEY (sandbox key recommended)
npm run build
npm test
```

## Workflow

1. Open an issue first for non-trivial changes — we'll triage and discuss approach.
2. Fork → branch → PR against `main`.
3. Use [Conventional Commits](https://www.conventionalcommits.org/): `feat:`, `fix:`, `docs:`, `chore:`, etc.
4. Add tests for new tools (`tests/` uses Vitest).
5. Run `npm run lint && npm test` before opening the PR.

## What we accept

- Bug fixes and tests for existing tools.
- New tools that wrap **public** Codinfy API endpoints.
- Documentation, type definitions, and example MCP-client configs.

## What we don't accept here

- Internal Codinfy tooling (scaffolders, deploy helpers, internal templates) — those live in the private `codinfy-mcp-internal` repository.
- Hard-coded brand colors, copy, or client names — Codinfy is fully administrable (rule R13).
- Direct integrations with payment gateways other than GeniusPay (rule R12).

## Code style

- TypeScript strict mode.
- ESLint + Prettier defaults (`npm run lint`).
- Validate all MCP inputs with [Zod](https://zod.dev/).

## License

By contributing, you agree your work is released under the [MIT License](LICENSE).

## Code of conduct

Be kind. Assume good faith. No harassment, discrimination, or spam. Maintainers may close threads at any time.
