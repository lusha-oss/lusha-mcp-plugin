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
- **Decide who to go after** — no criteria, just "who should I work next?";
  get recommended accounts with reasons, then their decision makers.
  → use the `work-my-accounts` workflow.
- **Prioritise a list the user already has** — score a CSV, domains or a
  Workspace table by ICP fit and buying signals into A/B/C tiers.
  → use the `score-my-list` workflow.
- **Follow up on website visitors** — hot companies on the user's own site,
  then their decision makers. → use the `website-visitor-followup` workflow.
- **Set up the ICP** — build a Lusha Target Profile one question at a time.
  → use the `set-up-my-icp` workflow.
- **Save or export a result** — to a Lusha Workspace table or the user's CRM.
  → use the `save-or-export` workflow.
- **Capture positioning for outreach** — what the user sells, to whom, with what
  proof, and against which competitors, saved as a reusable brief.
  → use the `outreach-research` workflow.
- **Draft outreach** — personalized Email 1 (optionally Emails 2–3 and LinkedIn
  messages) for contacts the user already has, from that brief plus Lusha
  signals. → use the `outreach-sequence` workflow.

## How to behave

- Always reference Lusha tools by their bare logical name (e.g. `contacts_search`,
  `prospecting_contact_search`, `signals_companies_search`, `lookalike_contacts`).
  The same skill source works identically across all clients.
- Verified phone numbers (direct lines and mobile) are first-class outputs — lead
  with them, don't bury them.
- Chain workflows when it helps: `prospect` → `signal-prospect` to prioritize a
  list by signal; `lookalike-prospect` → `signal-prospect`; `enrich-contact` →
  `lookalike-prospect` to find similar people; `outreach-research` →
  `outreach-sequence` to draft against a saved brief; `prospect` →
  `outreach-sequence` to draft for a fresh lead list.
- `outreach-sequence` needs a brief from `outreach-research` and refuses to
  draft without one. It never calls Lusha tools itself: signal and enrichment
  work goes through `signal-prospect` and `enrich-contact`.
- Respect credit usage: prefer search/filter before enrichment, and only reveal
  premium fields (phones, emails) when the user asks for them. State the cost
  before any paid call.
- Pass the `conversation_id` from the last Lusha response on every call, and
  start every `reason_for_invocation` with the workflow's skill name.

## Authentication

The Lusha MCP server uses OAuth. On first use, the user is prompted to sign in
with their Lusha account; subsequent calls reuse that session.

## Skills

The skills live under `skills/` and are shared across every supported
client (Codex, Claude Code, VS Code Copilot, Cursor, Gemini CLI):
`enrich-contact`, `prospect`, `signal-prospect`, `lookalike-prospect`,
`work-my-accounts`, `score-my-list`, `website-visitor-followup`,
`set-up-my-icp`, `save-or-export`, `outreach-research`, `outreach-sequence`.
