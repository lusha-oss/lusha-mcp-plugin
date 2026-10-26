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

## Lusha call rules

1. Pass `conversation_id` from the most recent Lusha response on every call. Start every `reason_for_invocation` with `prospect: ` (or with the calling skill's name, when another skill delegated here).
2. State the credit cost before every reveal and wait for a yes on large batches. On a 402 (out of credits), offer `purchase_options`.
3. Keep the chain short: every call counts toward the user's AI usage.
4. If a response carries `next_step_hints` and the user picks one of its offers, pass its `ref` as `next_step_ref`.

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

**No results?** Don't stop. Say exactly what was searched, then offer the widening that fits, most useful first:
1. An exact title (e.g. "CTO") → the department plus seniority (`departments` + `seniority` ids).
2. The narrowest company filter (size, location or industry) → drop it.
3. A location → its country or region.

## Step 4 — Enrich Top Results

Search results are previews — they carry no phones/emails but include a `canReveal[]` list per contact showing which fields can be revealed and their per-field credit cost in `canReveal[].credits`.

Use `prospecting_contact_enrich` with the contact `id`s to reveal phones and email. Pass `reveal` set from the results' `canReveal[].field` to control exactly which fields (and credits) you pay for. Up to **50** contacts per call — split larger sets across calls.

Before enriching, sum the `canReveal[].credits` for the fields you'll reveal, state the total to the user, and wait for confirmation on large batches. Use `account_usage` first if the user wants to confirm their balance covers it.

**What a reveal returns.**
- **Third-party costs.** `canReveal[].credits` is Lusha's own price. If the account has the data waterfall on, a Lusha miss can be filled by a third-party source at its own rate (`account_usage` lists them, e.g. a phone at 8 credits). Say so when quoting the cost. Offer `waterfallEnabled: false` for a Lusha-only reveal.
- **`COMPLIANCE_RESTRICTED`** on a row means that contact can't be shown, for compliance reasons, and nothing was charged. Say so and offer the next person.
- **`doNotCall: true`** marks a phone that is masked and not to be called. Show it as "Do not call", never as a number to dial.
- **A different company.** If the enrich result shows a different company from the search, the person has changed jobs. Show the new company and say so.

**Background reveals.** A `job` block in an enrich response means some reveals (usually from third-party sources) are still running. Show what has landed and how many are still running (`job.outstandingCount`). Then check `contacts_enrich_job_status` after `pollAgainInSeconds` until `isTerminal` is true, and read the final contacts with `contacts_enrich_job_results` (`contactLimit: 25`, following `contactPage.nextContactOffset` while `hasMore`). Never enrich the same ids again: that charges twice. The job tools are free. Larger sets still go in calls of 50; each call may carry its own job.

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
5. **Score the list** — rank these companies by ICP fit and buying signals into A/B/C tiers with `score-my-list`
6. **Save to a Workspace table** — hand the contact ids to `save-or-export` (contacts tables are free)
7. **Export to CRM** — through `save-or-export`, which checks the CRM connection first and offers to connect one if there is none
8. **Export** — format as CSV for copy-paste
