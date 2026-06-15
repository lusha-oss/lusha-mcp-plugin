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

Extract structured filters from the user's natural language description. Some filters take free-form text directly; others must be resolved to canonical values first.

**Contact filters (`prospecting_contact_search`):**
- Job titles → pass directly as `jobTitles` (free-form strings, e.g. "VP of Sales"). No resolution call needed.
- Department / seniority → resolve via `prospecting_contact_filters` (type: `departments`, `seniority`). Use these for broad role targeting when a specific title isn't given.
- Country → resolve via `prospecting_contact_filters` (type: `all_countries`); Location → type: `locations` (requires `locationSearchText`).

**Company filters (`prospecting_company_search`):**
- Industry → resolve via `prospecting_company_filters` (type: `industries_labels`)
- Size → resolve via `prospecting_company_filters` (type: `sizes`)
- Revenue → resolve via `prospecting_company_filters` (type: `revenues`)
- Location → resolve via `prospecting_company_filters` (type: `locations`, requires `q`)
- Tech stack → resolve via `prospecting_company_filters` (type: `technologies`, requires `q`)
- Buying intent → resolve via `prospecting_company_filters` (type: `intent_topics`)

Resolve every non-title filter to canonical values before searching — passing raw natural-language strings as structured filter values is the most common cause of search failures. Each `prospecting_*_filters` call resolves one filter type; run the independent lookups in parallel.

If the ICP is too vague to resolve (no title, no industry, no company size), ask one clarifying question before proceeding. At minimum, a title or department and at least one company-level constraint are required.

See `references/filter-guide.md` for filter resolution details.

## Step 2 — Search Companies

Use `prospecting_company_search` with resolved company filters. Request up to 25 results. This scopes the contact search to qualified accounts.

If the user only specified contact-level criteria (no company filters), skip this step and go directly to Step 3.

## Step 3 — Search Contacts

Use `prospecting_contact_search` with resolved contact filters. Scope to the company results from Step 2 where applicable. Request up to 25 results.

## Step 4 — Enrich Top Results

Search results are previews — they carry no phones/emails but include a `canReveal[]` list per contact showing which fields can be revealed and their per-field credit cost in `canReveal[].credits`.

Use `prospecting_contact_enrich` with the contact `id`s to reveal phones and email. Pass `reveal` set from the results' `canReveal[].field` to control exactly which fields (and credits) you pay for. Up to **50** contacts per call — split larger sets across calls.

Before enriching, sum the `canReveal[].credits` for the fields you'll reveal, state the total to the user, and wait for confirmation on large batches. Use `account_usage` first if the user wants to confirm their balance covers it.

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
