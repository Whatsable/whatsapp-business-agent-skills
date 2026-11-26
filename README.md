<!-- Generated from the Whatsable product sources. Do not edit: changes are overwritten. -->

# Whatsable agent skill and plugin

Work with a business's WhatsApp through [Whatsable](https://docs.whatsable.app): one skill that teaches an AI agent to use
the Whatsable MCP server safely, and to guide a person through everything else in the Whatsable app.
The plugin routes also connect the MCP server; the skill-only routes explain how to connect it.

## Install

| Where | How |
| --- | --- |
| Claude Code (recommended there) | `/plugin marketplace add Whatsable/whatsapp-business-agent-skills`, then `/plugin install whatsable@whatsable` |
| Any agent, Cursor and Codex included | `npx skills add Whatsable/whatsapp-business-agent-skills` (add `-g` for every project) |
| By hand | Copy the whole `skills/whatsable/` folder into your agent's skills folder |

The Claude Code plugin also connects the MCP server. With the other routes, connect it in your agent:
the skill's `references/connect.md` says how. `plugin.json` and `mcp.json` describe the same plugin in
the Agent Plugins format.

Pick one route per agent: the plugin and `npx skills` together install the skill twice.

## What is inside

- 24 workflows and 12 concept notes from the MCP server's own guide.
- 63 tools in 10 capability files, with their access and parameters.
- 75 app tasks in 17 guide files: plan, role, path in the app and the docs steps.
- 190 error codes (WhatsApp, Instagram, Messenger and the Whatsable API), each with its fix.
- 6 playbooks by business, and 9 example inputs checked against their tools.

```text
.claude-plugin/icon.png
.claude-plugin/marketplace.json
.claude-plugin/plugin.json
.github/workflows/validate.yml
.mcp.json
CHANGELOG.md
LICENSE
README.md
clawhub.json
mcp.json
plugin.json
skills/whatsable/LICENSE
skills/whatsable/SKILL.md
skills/whatsable/assets/examples/ (9 files)
skills/whatsable/references/ (4 files)
skills/whatsable/references/capabilities/ (10 files)
skills/whatsable/references/concepts/ (12 files)
skills/whatsable/references/errors/ (12 files)
skills/whatsable/references/guides/ (19 files)
skills/whatsable/references/playbooks/ (6 files)
skills/whatsable/references/workflows/ (24 files)
```

## Updates

- `npx skills update` for the `skills` CLI.
- Claude Code updates the plugin on its own, or with `/plugin update whatsable`.

The reference files follow the product: a new MCP tool, workflow or docs page reaches this repository on
the next Whatsable release, with no new version. The version in `CHANGELOG.md` covers the hand-written
core.

## Requirements

A Whatsable organization, and an owner or an admin to approve the connection, on a plan that includes the
MCP server: https://docs.whatsable.app/mcp/plans

## About this repository

Every file here is generated from the Whatsable product sources. Changes made here are overwritten on
the next release. Report a problem at https://github.com/Whatsable/whatsapp-business-agent-skills/issues.

## License

Proprietary. See [LICENSE](LICENSE).
