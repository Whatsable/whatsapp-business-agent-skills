# Agent skills directory listing tracker

Asset: [Whatsable/whatsapp-business-agent-skills](https://github.com/Whatsable/whatsapp-business-agent-skills)

Facts used (from this repo’s README only):

- Suite label: **v0.4.0 — Full suite ClawHub release** (`setup-notifyer`, `automate-notifyer`, `chat-notifyer` production-ready).
- Per-skill versions: **setup-notifyer** 1.0.0; **automate-notifyer** and **chat-notifyer** 0.3.0.
- Install: `npx skills add whatsable/whatsapp-business-agent-skills` (also `--all`, `--skill <name>`).
- Public guide: https://whatsable.app/guides/agent-skills

Agent run: cloud agent could **not** fork or push to third-party GitHub repos (integration token: `403 Resource not accessible`). External list PRs below are **ready to paste**; no upstream PR URLs yet.

## Summary counts

| Metric | Count |
|--------|------:|
| Upstream PRs opened by this agent | 0 |
| Already listed (no change needed) | 5 |
| Stale listing flagged (human ClawHub publish) | 1 |
| Blocked (login, email, paywall, or wrong product scope) | 28 |
| Held (MCP-only directories) | 10 |
| PR-ready on GitHub (not pushed) | 4 |

## Master tracker

| Directory | URL | Action | Upstream PR | Fields / notes |
|-----------|-----|--------|-------------|----------------|
| **This repo (tracker)** | https://github.com/Whatsable/whatsapp-business-agent-skills | PR opened | _(this PR)_ | Tracker markdown only. |
| **VoltAgent Awesome Agent Skills** | https://github.com/VoltAgent/awesome-agent-skills | PR-ready (not pushed) | — | Add 3 bullets after Kapso under **Productivity and Collaboration** (see appendix A). Title: `Add skill: whatsable/setup-notifyer` (+ automate, chat). |
| **Agentic Awesome Skills (sickn33)** | https://github.com/sickn33/agentic-awesome-skills | PR-ready (not pushed) | — | One README source line like Kapso; optional `docs/sources/sources.md` row (appendix B). |
| **libukai Awesome Agent Skills** | https://github.com/libukai/awesome-agent-skills | PR-ready (not pushed) | — | Add `whatsable` cell to official-projects table in `README.md`, `docs/README_EN.md`, `docs/README_JA.md` (appendix C). |
| **xAI Grok plugin marketplace index** | https://github.com/xai-org/plugin-marketplace | PR-ready (not pushed) | — | Only if shipping a **Grok plugin** catalog entry (`.grok-plugin/marketplace.json` + validate scripts). Repo is Agent Skills, not a plugin bundle today—confirm packaging before PR (appendix D). |
| **agentskill.sh — setup-notifyer** | https://agentskill.sh/@whatsable/setup-notifyer | already listed | — | Listed as `@whatsable/setup-notifyer`. Install API documented on page. |
| **agentskill.sh — automate-notifyer** | https://agentskill.sh/@whatsable/automate-notifyer | already listed | — | HTTP 200; slug `@whatsable/automate-notifyer`. |
| **agentskill.sh — chat-notifyer** | https://agentskill.sh/@whatsable/chat-notifyer | already listed | — | HTTP 200; slug `@whatsable/chat-notifyer`. |
| **ClawHub — agent-skills-by-notifyer** | https://clawhub.ai/skills/agent-skills-by-notifyer | stale vs README | — | Listed (`displayName`: Notifyer by WhatsAble). API shows bundle **`setup-notifyer` @ 1.0.0** only (`tags.latest`: 1.0.0). README claims **v0.4.0 full suite** (all three skills). **Human:** republish from repo `clawhub.json` (0.4.0) via ClawHub CLI—agent did not log in. |
| **Toolify (OpenClaw mirror)** | https://www.toolify.ai/openclaw-skills/agent-skills-by-notifyer-54033 | already listed | — | Third-party mirror; references ClawHub install. Not edited. |
| **Awesome Remote MCP Servers (jaw9c)** | https://github.com/jaw9c/awesome-remote-mcp-servers | held-MCP-only | — | Scope: remote **MCP servers** only (`README`: “Remote MCP servers”). |
| **Awesome Remote MCP Servers (punkpeye)** | https://github.com/punkpeye/awesome-remote-mcp-servers | held-MCP-only | — | Same category as jaw9c fork line. |
| **Awesome MCP List (MobinX)** | https://github.com/MobinX/awesome-mcp-list | held-MCP-only | — | “Concise list for mcp servers”. |
| **Awesome MCP Lists (collabnix)** | https://github.com/collabnix/awesome-mcp-lists | held-MCP-only | — | MCP servers, clients, toolkits. |
| **ToolSDK MCP registry** | https://github.com/toolsdk-ai/toolsdk-mcp-registry | held-MCP-only | — | MCP packages registry (OAuth MCP configs). |
| **Official MCP Registry** | https://registry.modelcontextprotocol.io/ | held-MCP-only | — | MCP server entries only. |
| **Glama** | https://glama.ai/mcp/servers | held-MCP-only | — | MCP server directory. |
| **MCP Servers (site)** | https://mcpservers.org/ | held-MCP-only | — | MCP-focused. |
| **AllMCPs** | https://allmcps.com/ | held-MCP-only | — | MCP directory. |
| **MCP Market** | https://mcpmarket.com/ | held-MCP-only | — | MCP marketplace. |
| **MCP Directory** | https://mcpdirectory.io/ | held-MCP-only | — | MCP listings. |
| **MCP Repository** | https://mcprepository.com/ | held-MCP-only | — | MCP listings. |
| **TensorBlock MCP** | https://tensorblock.ai/mcp | held-MCP-only | — | MCP catalog. |
| **AI Indigo MCP** | https://aiindigo.io/mcp | held-MCP-only | — | MCP listings. |
| **MCP So** | https://mcp.so/ | held-MCP-only | — | MCP server hub. |
| **Claude Code / Claude plugin directory** | https://code.claude.com/docs/en/plugins | blocked-login | — | Plugins via `/plugin` marketplaces; publish path is marketplace-specific, not a no-login web form for this skills repo. |
| **Public APIs** | https://publicapis.dev/ | blocked-login | — | Curated **HTTP APIs**, not Agent Skills; no public no-login skills submit matched. |
| **llms.txt Hub** | https://llmstxthub.com/submit | blocked-login | — | Page requires **Sign In**; mentions verified contributor / automated PRs behind auth. |
| **llms.txt Site** | https://llmstxt.site/submit | blocked-login | — | Public form (product name, llms.txt URL, llms-full.txt URL, notes)—**no agent submit** without choosing URLs; repo README does not define an llms.txt URL to enter. |
| **AI Directories** | https://www.aidirectories.com/submit | blocked-login | — | Submit URL returned **500** during check; treat as unavailable. |
| **Product Hunt** | https://www.producthunt.com/posts/new | blocked-login | — | Cloudflare **blocked** automated access; requires account. |
| **AlternativeTo** | https://alternativeto.net/browse/new/ | blocked-login | — | HTTP **403** on submit path. |
| **Better Launch** | https://betterlaunch.com/submit | blocked-login | — | HTTP **404** (no public submit page found). |
| **DanielLaunches** | https://daniellaunches.com/submit | blocked-login | — | **Sign in to submit** before launch form. |
| **IndieTool** | https://www.indietool.io/submit | blocked-login | — | **404** at `/submit`. |
| **Tinyshelf** | https://www.tinyshelf.co/submit | blocked-login | — | Redirects to **Google OAuth** login. |
| **Stork** | https://www.stork.ai/submit | blocked-login | — | Public URL step 1; later steps imply **Stripe / badge** paths ($49 or verified badge)—no account-free completion. |
| **Findly** | https://findly.tools/submit | blocked-login | — | Redirects to **sign-in** (`/sign-in?from=/submit`). |
| **Twelve Tools** | https://twelve.tools/submit | blocked-login | — | Submit page loads; typical directory **login** for ownership (not completed without account). |
| **Turbo0** | https://turbo0.com/submit | blocked-login | — | HTTP **403**. |
| **Noonlaunch** | https://noonlaunch.com/submit | blocked-login | — | Redirects to **/login**. |
| **LaunchPanda** | https://launchpanda.co/submit | blocked-login | — | Host did not resolve (curl **000**). |
| **Launch Streak** | https://launchstreak.com/submit | blocked-login | — | Domain resolves via Unstoppable Domains landing—not a verified SaaS submit form. |
| **ScrollLaunch** | https://www.scrolllaunch.com/submit | blocked-login | — | HTTP **404**. |
| **ConfettiSaaS** | https://confettisaas.com/submit | blocked-login | — | Website URL form exists; agent path also mentions **email approve link** for MCP/agent submit—skipped (no email). |
| **Launch Llama** | https://launchllama.com/submit | blocked-login | — | Host did not resolve (curl **000**). |
| **Acid Tools** | https://acidtools.com/submit | blocked-login | — | **Log in with Google** required to submit. |
| **Composio Awesome Claude Skills** | https://github.com/ComposioHQ/awesome-claude-skills | blocked-login | — | Large curated repo; no Kapso/WhatsAble pattern found; contribution needs fork + maintainer review (not attempted). |
| **awesome-agentic-atlas (crazy54)** | https://github.com/crazy54/awesome-agentic-atlas | blocked-login | — | No existing row for this repo; ingestion is automated/mega-list pipeline—not a simple third-party skill PR (Kapso appears via generated atlas pages). |

---

## Appendix A — VoltAgent/awesome-agent-skills PR body

**Title:** `Add skill: whatsable/setup-notifyer`

**Insert** after the three `gokapso/*-whatsapp` lines in `README.md` (Productivity and Collaboration):

```markdown
- **[whatsable/setup-notifyer](https://github.com/Whatsable/whatsapp-business-agent-skills/tree/main/skills/setup-notifyer)** - Notifyer account, WhatsApp connection, team setup
- **[whatsable/automate-notifyer](https://github.com/Whatsable/whatsapp-business-agent-skills/tree/main/skills/automate-notifyer)** - Templates, bots, broadcasts, webhooks for Notifyer
- **[whatsable/chat-notifyer](https://github.com/Whatsable/whatsapp-business-agent-skills/tree/main/skills/chat-notifyer)** - Live WhatsApp chat, labels, handoff, scheduling
```

**PR description:**

Adds Notifyer by WhatsAble Agent Skills (three-phase WhatsApp Business suite) alongside existing Kapso WhatsApp skills.

Install (from upstream README):

```bash
npx skills add whatsable/whatsapp-business-agent-skills --all
```

Repo: https://github.com/Whatsable/whatsapp-business-agent-skills  
Guide: https://whatsable.app/guides/agent-skills

---

## Appendix B — sickn33/agentic-awesome-skills PR body

**Title:** `docs: add Whatsable Notifyer agent-skills source`

**README.md** — add after the `gokapso/agent-skills` line:

```markdown
- **[Whatsable/whatsapp-business-agent-skills](https://github.com/Whatsable/whatsapp-business-agent-skills)**: Notifyer/WhatsApp Agent Skills (`setup-notifyer`, `automate-notifyer`, `chat-notifyer`).
```

**docs/sources/sources.md** — add table row:

```markdown
| `setup-notifyer`, `automate-notifyer`, `chat-notifyer` | [Whatsable](https://github.com/Whatsable/whatsapp-business-agent-skills) | Compatible | Notifyer WhatsApp Agent Skills suite |
```

Mirror the same row in `docs_zh-CN/sources/sources.md` if required by CI.

Run `npm run validate` before opening PR (per CONTRIBUTING).

---

## Appendix C — libukai/awesome-agent-skills PR body

**Title:** `Add Whatsable Notifyer agent-skills to official projects table`

Add a cell (e.g. under **内容与协作 / Content & collaboration**):

```html
<td><a href="https://github.com/Whatsable/whatsapp-business-agent-skills">whatsable</a></td>
```

Sync **`README.md`**, **`docs/README_EN.md`**, and **`docs/README_JA.md`** tables.

**PR description:** Links to the open Agent Skills suite for Notifyer (WhatsApp Business): three skills installable via `npx skills add whatsable/whatsapp-business-agent-skills`.

---

## Appendix D — xai-org/plugin-marketplace (optional)

Only if WhatsAble publishes a **Grok plugin** manifest pointing at this repo (remote `source.url` + pinned SHA). Follow https://github.com/xai-org/plugin-marketplace/blob/main/CONTRIBUTING.md — regenerate `.grok-plugin/plugin-index.json`, run `validate-catalog.py`. This is **not** the same as listing Agent Skills in awesome lists.

---

## ClawHub republish checklist (human)

README states **v0.4.0** full suite; ClawHub API currently serves **`setup-notifyer` 1.0.0** inside `agent-skills-by-notifyer`. Republish from repo root and per-skill `clawhub.json` (version **0.4.0** on bundle metadata) using ClawHub’s publish flow—without using email or unrelated accounts in this tracker run.
