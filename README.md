# Lusha MCP Plugin

Prospect, enrich, and build call-ready lead lists using Lusha's B2B intelligence platform — verified phone numbers, buying signals, and lookalike targeting, all from inside your AI assistant.

Supports **Claude Code** (Claude Code CLI / Cowork) and **VS Code Copilot** (GitHub Copilot Chat with MCP).

## Skills

| Skill | What it does |
|-------|-------------|
| `enrich-contact` | Look up any person and get their verified direct and mobile phone numbers, email, and company context |
| `prospect` | Describe your ICP in plain English — get a filtered, enriched lead list with phone numbers revealed |
| `signal-prospect` | Start from a buying signal (funding, hiring surge, job change) and get the right decision makers' phones |
| `lookalike-prospect` | Give Lusha 5+ reference companies or contacts — get a matched list enriched with phone numbers |

## How it works

Each skill chains multiple Lusha API calls into a complete workflow. Every output surfaces verified phone numbers prominently — direct lines and mobile numbers are first-class outputs, not an afterthought.

Both clients load the **same** `skills/*/SKILL.md` files and the **same** Lusha MCP server — only the per-client manifest differs:

| Client | Manifest | MCP endpoint | How to invoke |
|--------|----------|--------------|---------------|
| Claude Code | `.claude-plugin/plugin.json` | `mcp.lusha.com/mcp/claude` | `/enrich-contact`, `/prospect`, etc. |
| VS Code Copilot | `.github/plugin/plugin.json` | `mcp.lusha.com/mcp/copilot` | `/enrich-contact`, `/prospect`, etc. |

Skills reference Lusha tools by their bare logical name (e.g. `contacts_search`), so a single skill source works identically in both clients.

## Prerequisites

- A Lusha account with API access

## Install

### Claude Code (CLI / Cowork)

```
/plugin marketplace add lusha-oss/lusha-mcp-plugin
/plugin install lusha
```

### VS Code Copilot

Requires a VS Code version with agent-plugin support and the GitHub Copilot extension. The plugin bundles the **MCP server** and all **skills** together via `.github/plugin/plugin.json`.

1. Open the **Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`).
2. Run **Chat: Install Plugin From Source**.
3. Paste the repository name: `lusha-oss/lusha-mcp-plugin`.

The Lusha MCP server and the four skills load automatically. Invoke a skill from Copilot Chat with `/enrich-contact`, `/prospect`, `/signal-prospect`, or `/lookalike-prospect`.

## Authentication

The Lusha MCP server uses OAuth. The first time you invoke a Lusha skill or tool, you'll be prompted to sign in with your Lusha account. Subsequent calls reuse the authenticated session.

## Skill chaining

Skills are designed to feed into each other:

- `prospect` → `signal-prospect`: build a list, then filter it to companies showing buying signals
- `lookalike-prospect` → `signal-prospect`: find lookalikes, then prioritize by signal
- `enrich-contact` → `lookalike-prospect`: enrich a single contact, then find similar people
