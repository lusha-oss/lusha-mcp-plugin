# Lusha MCP Plugin

Find and enrich B2B contacts and companies with verified emails, direct dials, mobile numbers, and real-time buying signals from Lusha — straight from inside your AI assistant.

Supports **Codex** (plugins), **Claude Code** (Claude Code CLI / Cowork), **Cursor** (plugins), **VS Code Copilot** (GitHub Copilot Chat with MCP), and **Gemini CLI** (extensions).

## Skills

**Find and enrich**

| Skill | What it does |
|-------|-------------|
| `enrich-contact` | Look up any person and get their verified direct and mobile phone numbers, email, and company context |
| `prospect` | Describe your ICP in plain English — get a filtered, enriched lead list with phone numbers revealed |
| `signal-prospect` | Start from a buying signal (funding, hiring surge, job change) and get the right decision makers' phones |
| `lookalike-prospect` | Give Lusha 5+ reference companies or contacts — get a matched list enriched with phone numbers |

**Write outreach** — a two-stage pair, run in order

| Skill | What it does |
|-------|-------------|
| `outreach-research` | Stage 1. Capture what you sell, to whom, and how you differentiate as a portable positioning brief (`lusha-outreach-brief.md`). Text only — makes no Lusha API calls |
| `outreach-sequence` | Stage 2. Turn that brief plus a contact list into personalized, signal-grounded Email 1 (optionally E2/E3 and LinkedIn), handoff-ready as flat CSV |

## How it works

The find-and-enrich skills each chain multiple Lusha API calls into a complete workflow, and surface verified phone numbers prominently — direct lines and mobile numbers are first-class outputs, not an afterthought.

The outreach pair sits on top of them. `outreach-research` is pure conversation, producing a brief you save and reuse. `outreach-sequence` consumes that brief and never calls Lusha directly: it delegates signal discovery and harvest to `signal-prospect`, and contact enrichment to `enrich-contact`, so credit handling stays in one place. Every call it triggers is tagged with a `reason_for_invocation` starting `outreach-sequence: `, which is how skill-driven usage is attributed.

All clients load the **same** `skills/*/SKILL.md` files and the **same** Lusha MCP server — only the per-client manifest and store endpoint differ:

| Client | Manifest | MCP endpoint | How to invoke |
|--------|----------|--------------|---------------|
| Codex | `.codex-plugin/plugin.json` + `mcp.json` | `mcp.lusha.com/mcp/codex` | Skills activate from natural language requests |
| Claude Code | `.claude-plugin/plugin.json` | `mcp.lusha.com/mcp/claude` | `/enrich-contact`, `/prospect`, etc. |
| Cursor | `.cursor-plugin/plugin.json` | `mcp.lusha.com/mcp/cursor` | Skills activate from natural language requests |
| VS Code Copilot | `.github/plugin/plugin.json` | `mcp.lusha.com/mcp/copilot` | `/enrich-contact`, `/prospect`, etc. |
| Gemini CLI | `gemini-extension.json` | `mcp.lusha.com/mcp/gemini` | Gemini activates the matching skill on demand |

Skills reference Lusha tools by their bare logical name (e.g. `contacts_search`), so a single skill source works identically across all clients. Gemini CLI auto-discovers the bundled `skills/` directory as extension skills.

## Prerequisites

- A Lusha account with API access

## Install

### Codex

The Codex plugin lives at the repo root — `.codex-plugin/plugin.json` (manifest) and `mcp.json` (MCP server), with `skills: "./skills/"` pointing at the shared root `skills/`. Codex discovers it through the repo marketplace catalog at `.agents/plugins/marketplace.json`, which uses a `url` source pinned to a branch/tag. That catalog is read only by Codex/OpenAI tooling — Claude, Copilot, and Gemini keep using their own provider-specific manifests.

> A `url` source is used instead of a `local` path because Codex rejects a local plugin path that resolves to the repo root ([codex#17066](https://github.com/openai/codex/issues/17066)) and silently drops symlinks during install ([codex#18863](https://github.com/openai/codex/issues/18863)). Cloning the repo over `url` keeps `skills/` as real files at the plugin root, so no copy or symlink is needed.

Add the marketplace and install:

```
codex plugin marketplace add lusha-oss/lusha-mcp-plugin
codex
/plugins
```

Select **Lusha Plugins**, install the Lusha plugin, then start a new Codex thread so the skills and MCP tools are loaded. The `url` source installs from the ref pinned in `.agents/plugins/marketplace.json`, so changes take effect once they land on that ref.

### Claude Code (CLI / Cowork)

```
/plugin marketplace add lusha-oss/lusha-mcp-plugin
/plugin install lusha
```

### Cursor

Cursor reads the plugin manifest at `.cursor-plugin/plugin.json` and discovers the bundled `skills/` automatically. Add the repo as a plugin marketplace, then install the Lusha plugin from `.cursor-plugin/marketplace.json` (catalog `lusha-plugins`, plugin `lusha`). All six skills activate from natural-language requests once the MCP server connects.

### VS Code Copilot

Requires a VS Code version with agent-plugin support and the GitHub Copilot extension. The plugin bundles the **MCP server** and all **skills** together via `.github/plugin/plugin.json`.

1. Open the **Command Palette** (`Cmd+Shift+P` / `Ctrl+Shift+P`).
2. Run **Chat: Install Plugin From Source**.
3. Paste the repository name: `lusha-oss/lusha-mcp-plugin`.

The Lusha MCP server and all six skills load automatically. Invoke a skill from Copilot Chat with `/enrich-contact`, `/prospect`, `/signal-prospect`, `/lookalike-prospect`, `/outreach-research`, or `/outreach-sequence`.

### Gemini CLI

The repo ships a `gemini-extension.json` manifest at its root, so Gemini CLI wires up the Lusha MCP server and discovers the bundled skills automatically.

```
gemini extensions install https://github.com/lusha-oss/lusha-mcp-plugin
```

All six skills are registered as extension skills — Gemini activates the matching one on demand (e.g. when you ask it to find a contact's phone number, build a prospect list, or draft outreach). Run `gemini skills list` to confirm they loaded.

## Authentication

The Lusha MCP server uses OAuth. The first time you invoke a Lusha skill or tool, you'll be prompted to sign in with your Lusha account. Subsequent calls reuse the authenticated session.

## Skill chaining

Skills are designed to feed into each other:

- `prospect` → `signal-prospect`: build a list, then filter it to companies showing buying signals
- `lookalike-prospect` → `signal-prospect`: find lookalikes, then prioritize by signal
- `enrich-contact` → `lookalike-prospect`: enrich a single contact, then find similar people
- `outreach-research` → `outreach-sequence`: capture positioning once, then draft against it
- `prospect` → `outreach-sequence`: hand a lead list straight into drafting (optional — any CSV with `full_name`, `company`, and `title` works)

`outreach-sequence` requires a brief from `outreach-research`; without one it refuses to draft rather than inventing positioning. An audience is required too, but it can come from anywhere: a pasted CSV, an attached file, a single named contact, or a `prospect` handoff.

### Interactive and automated runs

`outreach-sequence` runs in two modes, set out in its **Execution Mode** section:

- **Interactive** (default) — a human is in the conversation, so the skill asks about signal preferences, any audience-wide signal, and whether you want a sample before it drafts the batch.
- **Automated** — the caller declares a non-interactive run (`"non-interactive"`, `"headless"`, `"automated run"`, or `"no user is available to answer"`), as an automation runner or scheduled job would. Every question resolves from a supplied value or a documented default and execution continues, because an emitted question would become the final output and the run would produce nothing.

Automated mode never relaxes the data rules: the brief and audience stay hard-required, signal and enrichment work still delegates to the other skills, and nothing may be fabricated to fill a gap.

## Contributing

Root `skills/` is the single source of truth — every client (Codex, Claude, Copilot, Gemini) reads these same files, so edit skills only under `skills/`.

When releasing, update the `ref` in `.agents/plugins/marketplace.json` to the branch or tag Codex users should install from (e.g. `master` for production, or a feature branch while testing).
