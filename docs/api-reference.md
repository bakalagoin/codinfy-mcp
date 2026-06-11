# API reference — les 10 outils

Chaque outil renvoie du JSON dans `content[0].text` ; les en-têtes
`X-RateLimit-*` de l'API sont relayés dans `rate_limit` quand présents.

## Licences (signées HMAC — `CODINFY_LICENSE_SECRET` requis)

| Outil | Entrées | Retour |
|---|---|---|
| `codinfy_validate_license` | `purchase_code` (uuid), `domain`, `product_id?`, `script_version?` | statut signé (`valid` · `read_only` · `disabled`), grace, `jwt_token` RS256 |
| `codinfy_check_license_status` | `purchase_code`, `domain` | résumé `{status, message, grace}` |
| `codinfy_get_grace_period` | `purchase_code`, `domain` | état de la grace 72 h + politique kill-switch |
| `codinfy_check_license_update` | `purchase_code`, `domain`, `current_version` | `update_available`, `latest_version`, `changelog`, URL signée 1 h |

## Catalogue (public, lecture seule)

| Outil | Entrées | Retour |
|---|---|---|
| `codinfy_list_products` | `category?`, `type?`, `limit?` (≤50), `cursor?` | produits publiés + `next_cursor` |
| `codinfy_get_product` | `slug` | fiche complète (description, changelog, prérequis, prix XOF) |
| `codinfy_search_products` | `query`, `limit?` | recherche titre/résumé/catégorie |

## Plateforme

| Outil | Entrées | Retour |
|---|---|---|
| `codinfy_get_design_tokens` | — | palette + typo + règles UX officielles (hors-ligne) |
| `codinfy_health` | — | liveness `GET /v1/health` |
| `codinfy_get_integration_links` | — | OpenAPI, SDK PHP/Node, Postman, guide anti-contournement |

## Roadmap (livrés avec leurs APIs plateforme — jamais de stub)

- Paiements (`create_checkout`, `get_payment_status`, `list_supported_operators`) → API checkout publique
- `track_event`, `get_my_stats` → API analytics vendeur
- OAuth/Login with Codinfy (`get_oauth_metadata`, `get_login_button_config`) → AGENT-15
- Codinfy Ads (`get_ads_sdk_config`, `list_ads_formats`) → AGENT-51
