# Claude Code

```bash
claude mcp add codinfy \
  -e CODINFY_LICENSE_SECRET=$CODINFY_LICENSE_SECRET \
  -- npx -y @codinfy/mcp
```

Ou `.mcp.json` au niveau du projet :

```json
{
    "mcpServers": {
        "codinfy": {
            "command": "npx",
            "args": ["-y", "@codinfy/mcp"],
            "env": {
                "CODINFY_LICENSE_SECRET": "${CODINFY_LICENSE_SECRET}"
            }
        }
    }
}
```

`CODINFY_LICENSE_SECRET` n'est requis que pour les outils licence.
Vérification : demandez « Liste les outils du serveur codinfy » → 10 outils.
