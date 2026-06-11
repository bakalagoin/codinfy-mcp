# Getting started — @codinfy/mcp

## 1. Prérequis

- Node.js ≥ 20.19 (22 LTS recommandé)
- Un client MCP : Claude Code/Desktop, Cursor, Codex, Continue, Cline…
- Pour les outils **licence** : le `CODINFY_LICENSE_SECRET` livré avec votre licence

## 2. Installation

Copiez la config de votre client depuis [`examples/`](../examples/), puis
redémarrez le client. Aucune installation manuelle : `npx -y @codinfy/mcp`.

## 3. Variables d'environnement

| Variable | Requis | Description |
|---|---|---|
| `CODINFY_LICENSE_SECRET` | outils licence uniquement | Secret HMAC livré avec la licence. **Jamais commité.** |
| `CODINFY_API_BASE` | non | Défaut `https://api.codinfy.com/api` (utile en sandbox/local) |
| `CODINFY_SITE_BASE` | non | Défaut `https://codinfy.com` |
| `CODINFY_API_KEY` | non | `pk_live_…` — transmise telle quelle ; l'émission de clés arrive avec le portail développeur |

## 4. Premier test

Demandez à votre agent :

> « Avec le serveur codinfy, vérifie la santé de l'API puis liste 3 produits. »

→ `codinfy_health` doit répondre `{"status":"ok"}` puis `codinfy_list_products`
renvoie le catalogue publié réel (curseur de pagination inclus).

## 5. Valider une licence

> « Valide la licence 123e4567-e89b-12d3-a456-426614174000 pour monsite.ci »

→ `codinfy_validate_license` signe la requête (HMAC-SHA256 du corps brut +
timestamp anti-replay ±300 s) et renvoie le statut signé + un JWT RS256 à
vérifier localement (voir le [guide anti-contournement](https://github.com/bakalagoin/codinfy/blob/main/docs/sdk/INTEGRATION_GUIDE.md)).
