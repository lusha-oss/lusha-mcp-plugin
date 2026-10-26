---
name: signal-prospect
description: >
  Find companies or contacts triggered by a buying signal, then surface verified phone numbers
  for the right decision makers. Use when the user says "find companies that just raised funding",
  "who's surging in sales hiring right now", "show me companies with headcount growth",
  "find contacts who just got promoted", "who changed jobs recently in [industry]",
  "show me [title] at companies that just [signal event]", or any request that starts
  with a real-world trigger rather than a static filter.
---

# Signal-Prospect

Start from a buying signal — company or contact level — and end with a call-ready list of enriched decision makers. This is Lusha's core differentiated workflow: trigger → identify → phone reveal.

## Lusha call rules

1. Pass `conversation_id` from the most recent Lusha response on every call. Start every `reason_for_invocation` with `signal-prospect: ` (or with the calling skill's name, when another skill delegated here, as `outreach-sequence` does).
2. State the credit cost before every paid call and wait for a yes on large batches. On a 402 (out of credits), offer `purchase_options`.
3. Zero results is not the end of the session: say what was searched and what coverage exists, then offer to widen (Step 4a).
4. Keep the chain short: every call counts toward the user's AI usage.
5. If a response carries `next_step_hints` and the user picks one of its offers, pass its `ref` as `next_step_ref`.

## Step 1 — Identify the Signal Mode

Determine which mode applies based on the user's request:

**Company signal mode** — the trigger is something happening at a company (funding, hiring surge, headcount change, news event). Goal: find the right people at those companies and get their phones.

**Contact signal mode** — the trigger is something happening to a person (got promoted, changed company). Goal: find those people and get their updated contact details.

If unclear, ask: *"Are you looking for companies showing a specific signal, or individual contacts who recently changed roles or employers?"*

## Step 2 — Discover Available Signal Types and Sub-Filters

These tools are the authoritative source of valid signal identifiers — never assume a signal type exists without confirming it here, since invalid values are rejected with a 400.

**Company signals:** Call `signals_company_filters` with no `filterType` to get the directory: `{ signalTypes, availableFilters: [{ filterType, requiresQuery }] }`. To enumerate the values for a sub-filter, call it again with `filterType` set to `newsEventTypes`, `hiringByDepartments`, or `hiringByLocations` (`hiringByLocations` requires a `query`).

**Contact signals:** Call `signals_contact_filters` to get the supported contact signal types (e.g. `promotion`, `companyChange`, `allSignals`).

## Step 3 — Map User Intent to a Signal Type

Match the user's phrasing to a signal identifier returned in Step 2. The table is a starting point — always validate the identifier against the live directory before using it:

| User says | Signal type (`names`) | News sub-type (applied in Step 5) |
|-----------|----------------------|-----------------------------------|
| "raised funding / Series A/B/C / IPO" | `financialEventsNews` | `Funding Round`, `IPO`, `Strategic Investment` |
| "surging in hiring / lots of open roles" | `surgeInHiring` | — |
| "growing fast / headcount up" | `headcountIncrease3m` / `headcountIncrease6m` | — |
| "hiring sales reps" | `surgeInHiringByDepartment` (+ `filterByDepartment`) | — |
| "new partnership / new customer" | `commercialActivityNews` | `New Customer`, `Partnership`, `New Location` |
| "new product launch" | `productActivityNews` | `Product Launch`, `Product Integration` |
| "executive just joined / new CRO" | `peopleNews` | `Executive Hire`, `Executive Departure` |
| "contact just got promoted" | contact signal `promotion` | — |
| "contact changed company / new job" | contact signal `companyChange` | — |

The signal **type** (`names`) is what the discovery search in Step 4 accepts. The **news sub-type** (right column) is a different mechanism — it cannot be passed to the discovery search; it is applied in Step 5 via `signals_company_filters` values. If the user's intent doesn't map cleanly, present the closest available types and confirm.

## Step 4 — Discover by Signal (Search)

Discovery narrows the population to companies/contacts that currently have the signal. The `signals` filter on the prospecting search tools is what does this — it accepts signal **type names** plus hiring sub-filters only.

**Company signal mode** — `prospecting_company_search` with:

```
signals: {
  names: ["<signal type>", ...],        // OR-combined; from Step 2/3
  startDate: "YYYY-MM-DD",              // optional; defaults to last 6 months
  filterByDepartment: [{ department }], // optional; for surgeInHiringByDepartment
  filterByLocation: [{ country, state }]// optional; for surgeInHiringByLocation
}
```

Combine with ordinary company filters (industry, size, location — resolved via `prospecting_company_filters`) to scope the account population. News-event types like `Funding Round` **cannot** be narrowed here — pass the parent type (`financialEventsNews`) and narrow in Step 5.

**Contact signal mode** — `prospecting_contact_search` with `signals: { names: [...], startDate? }` (contact signals support `names` + `startDate` only). Request up to 50 results (`page_size`).

## Step 4a — When Discovery Comes Back Empty

Never end the session on an empty result. Tell the user exactly what was searched, e.g. *"No companies with a Funding Round since 2026-09-01 among US fintech companies of 50–200 people."* Then offer the widenings that apply, most useful first:

1. **Widen the date window** — if `startDate` was narrower than the 6-month default, offer to drop it.
2. **Related signal types** — offer one or two neighbouring types from the Step 2 directory (e.g. `headcountIncrease3m` alongside `surgeInHiring`, or the parent news type instead of a narrow sub-type).
3. **Loosen the company filters** — name the narrowest filter (size, location, industry) and offer to drop it.

The same applies in Step 5. When `signals_companies_get` / `signals_contacts_get` returns `NO_SIGNALS_FOUND` for companies or contacts the user cares about, re-check those ids once without the narrow sub-type filter (the parent type only). The response's own `startDate` / `endDate` show the window that was searched. Then report the coverage that exists: *"No funding round since April; the latest financial news at Stayforlong is a revenue report from July."* If there is nothing even then, say this company has no recorded events of this type in the window.

## Step 5 — Pull Signal Detail (Events, Dates, News Sub-Type)

The discovery search returns the matched companies/contacts but not the underlying signal events or their dates. To surface the actual event, its date, and to keep only a specific news sub-type, run a signals lookup on the matched Lusha IDs:

**Company mode** — `signals_companies_get` with the matched company IDs. Pass `filters.include.newsEventTypes` (e.g. `["Funding Round"]`), `hiringByDepartments`, or `hiringByLocations` to keep only the events you care about. Returns the signal events, date window, and `billing.creditsCharged`.

**Contact mode** — `signals_contacts_get` with the matched contact IDs → promotion / company-change events with dates.

This step consumes credits per signal returned, so run it only on the shortlist you intend to act on, and state the cost first. If you have company/contact identifiers but no Lusha IDs (e.g. a user-supplied list of domains), use `signals_companies_search` / `signals_contacts_search` instead — they resolve the identifier and return signals in one call.

## Step 6 — Find Decision Makers (Company Signal Mode Only)

For the matched companies, use `prospecting_contact_search` scoped to them via `companyDomains` or `companyNames`, plus the target role — `jobTitles` (free-form) or resolved `seniority` / `departments`. If no role was specified, ask: *"What role are you looking to reach at these companies?"*

Skip this step in contact signal mode — the triggered contacts are already the targets.

## Step 7 — Enrich and Reveal Phones

Use `prospecting_contact_enrich` with the contact `id`s to reveal direct and mobile numbers. Set `reveal` from each result's `canReveal[].field`; up to **50** contacts per call. Sum the `canReveal[].credits` and state the total before enriching large batches — use `account_usage` to confirm the balance if needed.

**What a reveal returns.**
- **Third-party costs.** `canReveal[].credits` is Lusha's own price. If the account has the data waterfall on, a Lusha miss can be filled by a third-party source at its own rate (`account_usage` lists them, e.g. a phone at 8 credits). Say so when quoting the cost. Offer `waterfallEnabled: false` for a Lusha-only reveal.
- **`COMPLIANCE_RESTRICTED`** on a row means that contact can't be shown, for compliance reasons, and nothing was charged. Say so and offer the next person.
- **`doNotCall: true`** marks a phone that is masked and not to be called. Show it as "Do not call", never as a number to dial.
- **A different company.** If the enrich result shows a different company from the search, the person has changed jobs. Show the new company and say so.

**Background reveals.** A `job` block in an enrich response means some reveals (usually from third-party sources) are still running. Show what has landed and how many are still running (`job.outstandingCount`). Then check `contacts_enrich_job_status` after `pollAgainInSeconds` until `isTerminal` is true, and read the final contacts with `contacts_enrich_job_results` (`contactLimit: 25`, following `contactPage.nextContactOffset` while `hasMore`). Never enrich the same ids again: that charges twice. The job tools are free. Larger sets still go in calls of 50; each call may carry its own job.

## Step 8 — Present Results

### Signal Used
State exactly which signal was applied and what it means (e.g., "Funding Round events since 2026-05-01").

### Results

**Company signal mode:**

| # | Company | Signal | Signal Date | Contact Name | Title | Direct Phone | Mobile | Email |
|---|---------|--------|-------------|-------------|-------|-------------|--------|-------|

**Contact signal mode:**

| # | Name | Signal | Previous Role | New Role / Company | Direct Phone | Mobile | Email |
|---|------|--------|--------------|-------------------|-------------|--------|-------|

- Lead with phone columns — never bury them at the end
- Mark missing phones with `—`
- Surface the signal date (from Step 5) so the user knows how fresh the trigger is

### Summary
- Companies / contacts matched: X
- Decision makers found: Y
- Verified phones revealed: Z
- Credits consumed: N

## Step 9 — Offer Next Actions

1. **Narrow by geography or company size** — apply additional filters to the matched companies
2. **Change the target role** — re-run Step 6 with a different title or seniority
3. **Run a different signal** — try a related signal type (e.g. also check `headcountIncrease3m` alongside funding)
4. **Save to a Workspace table** — hand the contact ids to `save-or-export` (contacts tables are free)
5. **Export to CRM** — through `save-or-export`, which checks the CRM connection first and offers to connect one if there is none
6. **Export** — format as CSV
