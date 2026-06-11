# Troubleshooting

**« CODINFY_LICENSE_SECRET is not set »**
→ Les 4 outils licence exigent le secret HMAC livré avec votre licence.
Ajoutez-le dans le bloc `env` de la config MCP (jamais dans un repo).

**`invalid_signature` (401)**
→ Le secret ne correspond pas à la licence, ou un proxy réécrit le corps
de la requête. Le serveur signe le corps **brut** ; ne mettez aucun
middleware qui re-sérialise le JSON.

**`replay_rejected` (400)**
→ L'horloge de votre machine dérive de plus de 5 minutes. Synchronisez-la
(NTP) : le timestamp anti-replay est strict.

**429 Too Many Requests**
→ 60 req/min par IP sur l'API. Le champ `rate_limit.remaining` relayé dans
chaque réponse permet à l'agent de s'auto-réguler.

**Le client ne voit aucun outil**
→ Node ≥ 20.19 requis (`node --version`). Lancez à la main pour voir le log :
`npx -y @codinfy/mcp` doit afficher `ready on stdio (10 tools)` sur stderr.

**Tester contre une instance locale**
→ `CODINFY_API_BASE=http://127.0.0.1:8000/api` dans le bloc `env`.

Support : support@codinfy.com · Issues : https://github.com/bakalagoin/codinfy-mcp/issues
