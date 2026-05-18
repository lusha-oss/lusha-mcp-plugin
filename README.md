# Lusha Plugin for Claude

Prospect, enrich, and build call-ready lead lists using Lusha's B2B intelligence platform — verified phone numbers, buying signals, and lookalike targeting, all from inside Claude.

## Skills

| Skill | What it does |
|-------|-------------|
| `enrich-contact` | Look up any person and get their verified direct and mobile phone numbers, email, and company context |
| `prospect` | Describe your ICP in plain English — get a filtered, enriched lead list with phone numbers revealed |
| `signal-prospect` | Start from a buying signal (funding, hiring surge, job change) and get the right decision makers' phones |
| `lookalike-prospect` | Give Lusha 5+ reference companies or contacts — get a matched list enriched with phone numbers |

## How it works

Each skill chains multiple Lusha MCP tool calls into a complete workflow. Every output surfaces verified phone numbers prominently — direct lines and mobile numbers are first-class outputs, not an afterthought.

The plugin talks to Lusha's curated Claude MCP surface at `https://mcp.lusha.com/mcp/claude`, which exposes 17 tools (contacts, companies, prospecting, signals, lookalikes, account usage). Tool calls are namespaced as `mcp__lusha__<tool_name>`.

## Prerequisites

- A Lusha account with API access
- One of:
  - Claude Cowork desktop app
  - Claude Code CLI
  - Claude.ai with the Lusha connector enabled

## Install

### From the Anthropic plugin marketplace (one-click)

In Claude (Cowork, Claude Code, or Claude.ai):

```
/plugin install lusha
```

### From this GitHub repo

```
/plugin marketplace add lusha-oss/lusha-mcp-plugin
/plugin install lusha@lusha
```

### Local development

Clone this repo and run Claude Code with the `--plugin-dir` flag:

```bash
git clone https://github.com/lusha-oss/lusha-mcp-plugin.git
cd lusha-mcp-plugin
claude --plugin-dir ./
```

After making edits, run `/reload-plugins` inside Claude Code to pick them up without restarting.

## Authentication

The plugin uses OAuth against `https://auth.lusha.com`. After installing, click **Connect** on the Lusha MCP server entry in your client's MCP/connectors settings panel and complete the OAuth flow with your Lusha account. No API key needs to be pasted anywhere.

## Skill chaining

Skills are designed to feed into each other:

- `prospect` → `signal-prospect`: build a list, then filter it to companies showing buying signals
- `lookalike-prospect` → `signal-prospect`: find lookalikes, then prioritize by signal
- `enrich-contact` → `lookalike-prospect`: enrich a single contact, then find similar people

## Inspecting cost and components

Run `/plugin details lusha` inside Claude Code to see the always-on token cost the plugin adds to a session plus the per-skill token cost when each skill fires.

## Versioning

This plugin uses [semantic versioning](https://semver.org). See [CHANGELOG.md](./CHANGELOG.md) for release notes. Users only receive updates when the `version` field in `.claude-plugin/plugin.json` is bumped.

## License

[MIT](./LICENSE)

## Support

- Issues: <https://github.com/lusha-oss/lusha-mcp-plugin/issues>
- General Lusha support: <support@lusha.com>
