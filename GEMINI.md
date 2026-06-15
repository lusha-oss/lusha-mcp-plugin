# Lusha for Gemini CLI

This extension connects Gemini to Lusha's B2B intelligence platform through the
Lusha MCP server. Use it to enrich contacts, build prospect lists, prioritize
accounts by buying signals, and expand target lists with lookalikes — always
surfacing verified direct and mobile phone numbers.

## When to use it

Activate Lusha when the user wants to:

- **Look up a person** — get verified phones, email, and company context.
  → use the `enrich-contact` workflow.
- **Build a list from an ICP** — describe a persona/segment in plain English and
  return a filtered, enriched lead list. → use the `prospect` workflow.
- **Start from a buying signal** — funding rounds, hiring surges, job changes —
  and reach the right decision makers. → use the `signal-prospect` workflow.
- **Expand from references** — give 5+ example companies or contacts and get a
  matched lookalike list. → use the `lookalike-prospect` workflow.

## How to behave

- Always reference Lusha tools by their bare logical name (e.g. `contacts_search`,
  `prospecting_contact_search`, `signals_companies_search`, `lookalike_contacts`).
  The same skill source works identically across all clients.
- Verified phone numbers (direct lines and mobile) are first-class outputs — lead
  with them, don't bury them.
- Chain workflows when it helps: `prospect` → `signal-prospect` to prioritize a
  list by signal; `lookalike-prospect` → `signal-prospect`; `enrich-contact` →
  `lookalike-prospect` to find similar people.
- Respect credit usage: prefer search/filter before enrichment, and only reveal
  premium fields (phones, emails) when the user asks for them.

## Authentication

The Lusha MCP server uses OAuth. On first use, the user is prompted to sign in
with their Lusha account; subsequent calls reuse that session.

## Skills

The four skills live under `skills/` and are shared across every supported
client (Codex, Claude Code, VS Code Copilot, Cursor, Gemini CLI):
`enrich-contact`, `prospect`, `signal-prospect`, `lookalike-prospect`.
