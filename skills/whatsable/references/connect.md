<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Connect the Whatsable MCP server

The skill is not the connection. Your AI app needs the Whatsable MCP server added once, and a person
from the business approves it.

| Setting | Value |
| --- | --- |
| Server URL | `https://api.whatsable.app/mcp` |
| Transport | Remote Streamable HTTP. Some apps call it **HTTP**. Not SSE. |
| Sign-in | OAuth. The app registers itself, so there is no client ID or secret to enter. |
| Or | An API key in the header `Authorization: Bearer <key>` |

## Who approves

Only an owner or an admin of a Whatsable organization can connect an AI app, on a plan that includes the
MCP server (https://docs.whatsable.app/mcp/plans). Signing in opens Whatsable in the browser. The person signs in, picks the
organization, the access (Full access, Send and read, or Read only) and the numbers the app may use, then
chooses **Approve**. The token renews itself; after 30 days without use the person signs in again.

If the person has no account, the sign-up for connecting an AI app is https://console.whatsable.app/sign-up?product=connector.

## Sign in or use an API key

Prefer signing in. Use an API key only where no browser can open (a server, SSH, CI). An owner or an
admin creates the key in Whatsable under **API keys** in the sidebar. Keep it in an environment variable,
such as `WHATSABLE_API_KEY`, or in the app's secret store. Never write it in a file that is committed or
shared, and never ask the person to paste it into the chat.

## By app

**Claude (claude.ai, desktop and mobile).** Plugins > Connectors > Add custom connector. Name `Whatsable`,
URL `https://api.whatsable.app/mcp`. Under **OAuth client**, choose **Register automatically**, not Claude's published
identity. On Team and Enterprise, an owner of the Claude organization adds it first in Organization
settings > Connectors. https://docs.whatsable.app/mcp/connect/claude

**Claude Code.** The Whatsable plugin adds the server for you. Without it:

```bash
claude mcp add --transport http whatsable https://api.whatsable.app/mcp
claude mcp login whatsable
```

Add `--scope user` for every project. Never put an API key in a project-scoped `.mcp.json`.
https://docs.whatsable.app/mcp/connect/claude-code

**ChatGPT (web).** Plugins > **+** > Add custom MCP server. Name `Whatsable`, connection `https://api.whatsable.app/mcp`,
authentication **OAuth** with no static credentials, then **Create as a plugin** and **Install**. Business,
Enterprise and Edu can send; Pro is limited to read and fetch. After Whatsable adds tools, choose
**Refresh** on the plugin. https://docs.whatsable.app/mcp/connect/chatgpt

**Codex.**

```bash
codex mcp add whatsable --url https://api.whatsable.app/mcp
codex mcp login whatsable
```

With a key: `--bearer-token-env-var WHATSABLE_API_KEY`. https://docs.whatsable.app/mcp/connect/codex

**Cursor.** Customize > MCPs, add a server; in `mcp.json`:

```json
{ "mcpServers": { "whatsable": { "url": "https://api.whatsable.app/mcp" } } }
```

Then choose **Connect** and allow the browser to open Cursor. With a key, add
`"headers": { "Authorization": "Bearer ${env:WHATSABLE_API_KEY}" }`. https://docs.whatsable.app/mcp/connect/cursor

**VS Code (GitHub Copilot).** Chat: Open Customizations > MCP Servers > Add Server > HTTP, server ID
`whatsable`, URL `https://api.whatsable.app/mcp`, then sign in. https://docs.whatsable.app/mcp/connect/vs-code

**Gemini.** Gemini Apps on the web: Settings > Connected Apps > Add a custom app, URL `https://api.whatsable.app/mcp`, no client
ID or secret. Gemini CLI:

```bash
gemini mcp add --transport http whatsable https://api.whatsable.app/mcp
```

In the CLI's `settings.json` the field is `httpUrl`, not `url`. Gemini Enterprise is not supported yet.
https://docs.whatsable.app/mcp/connect/gemini

**Windsurf.** In the MCP config from the agent panel:

```json
{ "mcpServers": { "whatsable": { "serverUrl": "https://api.whatsable.app/mcp" } } }
```

https://docs.whatsable.app/mcp/connect/windsurf

**Any other app.** Add a remote MCP server with the URL above and Streamable HTTP. An app that only starts
local commands can use the open-source bridge (it needs Node.js):

```json
{ "mcpServers": { "whatsable": { "command": "npx", "args": ["-y", "mcp-remote", "https://api.whatsable.app/mcp"] } } }
```

https://docs.whatsable.app/mcp/connect/other-clients

## When sign-in refuses

- **The organization is greyed out:** its plan is not active, or does not include the MCP server; the page
  says which. Only an owner or an admin can connect an AI app.
- **Claude fails to connect:** remove the connector and add it again with **Register automatically**.
- **The app connected but tools are missing:** the access chosen at approval is too small. Revoke the
  connection in Whatsable (API keys > Connected AI apps) and connect again with wider access.
- **It asks to sign in again:** 30 days passed without use, or the connection was revoked.

More: https://docs.whatsable.app/mcp/troubleshooting
