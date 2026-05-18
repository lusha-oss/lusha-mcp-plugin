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

Each skill chains multiple Lusha API calls into a complete workflow. Every output surfaces verified phone numbers prominently — direct lines and mobile numbers are first-class outputs, not an afterthought.

## Prerequisites

- A Lusha account with API access
- Claude Code (CLI) or Claude Cowork desktop app

## Install

In Claude Code (CLI) or Cowork, run:

```
/plugin marketplace add lusha-oss/lusha-mcp-plugin
/plugin install lusha
```

## Authentication

The Lusha MCP server uses OAuth. The first time you invoke a Lusha skill, you'll be prompted to sign in with your Lusha account. Subsequent calls reuse the authenticated session.

## Skill chaining

Skills are designed to feed into each other:

- `prospect` → `signal-prospect`: build a list, then filter it to companies showing buying signals
- `lookalike-prospect` → `signal-prospect`: find lookalikes, then prioritize by signal
- `enrich-contact` → `lookalike-prospect`: enrich a single contact, then find similar people
