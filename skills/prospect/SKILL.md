---
name: prospect
description: >
  Build a targeted list of contacts or companies from Lusha and return verified phone numbers
  alongside emails. Use when the user says "find me [title] at [company type]",
  "build a list of [ICP description]", "prospect [criteria]", "who should I be calling at [industry]",
  or any request to generate a lead list from an ICP or persona description.
---

# Prospect

Go from an ICP description to a ranked, phone-enriched lead list. Filters are resolved before search — never guess filter values.

## Step 1 — Parse the ICP

Extract structured filters from the user's natural language description:

**Contact filters:**
- Job titles → resolve via `mcp__lusha__prospecting_contact_filters` (type: `departments`, `seniority`)
- Location → resolve via `mcp__lusha__prospecting_contact_filters` (type: `locations`)

**Company filters:**
- Industry → resolve via `mcp__lusha__prospecting_company_filters` (type: `industries_labels`)
- Size → resolve via `mcp__lusha__prospecting_company_filters` (type: `sizes`)
- Revenue → resolve via `mcp__lusha__prospecting_company_filters` (type: `revenues`)
- Location → resolve via `mcp__lusha__prospecting_company_filters` (type: `locations`)
- Tech stack → resolve via `mcp__lusha__prospecting_company_filters` (type: `technologies`)
- Buying intent → resolve via `mcp__lusha__prospecting_company_filters` (type: `intent_topics`)

Resolve all filters before running any search. Run filter lookups in parallel where possible.

If the ICP is too vague to resolve (no title, no industry, no company size), ask one clarifying question before proceeding. At minimum, a title or department and at least one company-level constraint are required.

See `references/filter-guide.md` for filter resolution details.

## Step 2 — Search Companies

Use `mcp__lusha__prospecting_company_search` with resolved company filters. Request up to 25 results. This scopes the contact search to qualified accounts.

If the user only specified contact-level criteria (no company filters), skip this step and go directly to Step 3.

## Step 3 — Search Contacts

Use `mcp__lusha__prospecting_contact_search` with resolved contact filters. Scope to the company results from Step 2 where applicable. Request up to 25 results.

## Step 4 — Enrich Top Results

Use `mcp__lusha__prospecting_contact_enrich` on the top results to reveal phone numbers and email addresses. Enrich up to 10 contacts per call. Batch if more than 10.

Before enriching, state how many credits will be consumed and wait for confirmation if the batch is larger than 10 contacts.

## Step 5 — Present the Lead List

### Filters Applied
Show the user exactly what was used so they can verify:

| Filter | Value |
|--------|-------|
| ... | ... |

### Lead List

| # | Name | Title | Company | Industry | Size | Direct Phone | Mobile | Email | Intent Signal |
|---|------|-------|---------|----------|------|-------------|--------|-------|---------------|

- Surface direct phone and mobile as separate columns — do not merge or hide them
- Mark missing phone numbers with `—` not blank cells
- Include intent signal column only if `intent_topics` filter was used

### Summary
- Results found: X (showing top Y)
- Contacts with verified phone: Z
- Credits consumed: N

## Step 6 — Offer Next Actions

1. **Refine** — adjust filters and re-run
2. **Add intent filter** — narrow to companies actively researching a topic
3. **Add tech stack filter** — narrow to companies using a specific technology
4. **Run signal-prospect** — cross this list against current buying signals
5. **Export** — format as CSV for copy-paste
