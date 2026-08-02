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

## Step 5 — Pull Signal Detail and Enrich the Shortlist

The discovery search returns the matched companies/contacts but not the underlying signal events or their dates. To surface the actual event, its date, and to keep only a specific news sub-type, run a signals lookup on the matched Lusha IDs:

**Company mode** — `signals_companies_get` with the matched company IDs. Pass `filters.include.newsEventTypes` (e.g. `["Funding Round"]`), `hiringByDepartments`, or `hiringByLocations` to keep only the events you care about. Returns the signal events, date window, and `billing.creditsCharged`.

**Contact mode** — `signals_contacts_get` with the matched contact IDs → promotion / company-change events with dates.

This step consumes credits per signal returned, so run it only on the shortlist you intend to act on, and state the cost first. If you have company/contact identifiers but no Lusha IDs (e.g. a user-supplied list of domains), use `signals_companies_search` / `signals_contacts_search` instead — they resolve the identifier and return signals in one call.

**Company mode — once the shortlist is final:** by default, call `companies_search` with each shortlisted company's domain (or name) and `enrich: true`. This renders each company as an interactive card (industry, location, employee count, description). Only skip this and pass the bare identifiers along instead if the user has explicitly asked for plain/tabular/CSV output.

Note: `companies_search`'s enrich bundle carries no signal/hiring-surge fields — that data only exists in this step's `signals_companies_get` output above. Hold onto each company's signal figures (latest date, count, % vs. historical average) for the visualization in Step 8, since the company card won't surface them on its own.

## Step 6 — Find Decision Makers (Company Signal Mode Only)

For the matched companies, use `prospecting_contact_search` scoped to them via `companyDomains` or `companyNames`, plus the target role — `jobTitles` (free-form) or resolved `seniority` / `departments`. If no role was specified, ask: *"What role are you looking to reach at these companies?"*

Skip this step in contact signal mode — the triggered contacts are already the targets.

## Step 7 — Enrich and Reveal Phones

By default, use `contacts_search` with the contact `id`s and `enrich: true` to reveal direct/mobile numbers and email — this renders each contact as an interactive card. Batches are capped at **25** contacts per call (lower than `prospecting_contact_enrich`'s 50), so chunk larger shortlists into groups of 25.

Only use `prospecting_contact_enrich` instead if the user has explicitly asked for plain, tabular, or CSV-style output — it returns the same reveal data with no card rendering. Never run both for the same contact: `contacts_search` with `enrich: true` already reveals and charges, so a follow-up `prospecting_contact_enrich` on the same person pays twice.

If a contact comes back with an enrich failure or compliance restriction, that's expected behavior, not a dead end — pull the next-most-senior candidate from Step 6's results at the same company and retry before reporting a gap to the user.

Estimate cost from Step 6's result count using `account_usage`'s per-unit pricing (`contactSearch`, `revealEmail`, `revealPhone`) rather than a per-contact `canReveal` preview — `contacts_search` doesn't expose one — and state the estimate before enriching large batches.

## Step 8 — Present Results

### Signal Used
State exactly which signal was applied and what it means (e.g., "Funding Round events since 2026-05-01").

### Results

By default, the company cards (Step 5) and contact cards (Step 7) already rendered are the presentation — don't also build the tables below, since that just duplicates what's on screen. Write a short prose/bullet recap referencing "the cards above" instead, plus the chart described below. In the recap, explicitly call out any contact whose card came back with no verified phone rather than letting the card stand as if complete.

Only build the tables below if the user has explicitly asked for plain/tabular/CSV/non-visual output:

**Company signal mode:**

| # | Company | Signal | Signal Date | Contact Name | Title | Direct Phone | Mobile | Email |
|---|---------|--------|-------------|-------------|-------|-------------|--------|-------|

**Contact signal mode:**

| # | Name | Signal | Previous Role | New Role / Company | Direct Phone | Mobile | Email |
|---|------|--------|--------------|-------------------|-------------|--------|-------|

- Lead with phone columns — never bury them at the end
- Mark missing phones with `—`
- Surface the signal date (from Step 5) so the user knows how fresh the trigger is

### Visualize Signal History

If Step 5 returned more than one dated data point per company (an actual trend, not a single snapshot), chart it — one bar or point per date, labeled with the date and % change vs. historical average — using whichever visualization capability is available in the current environment. Don't only narrate the trend in prose; draw it. Skip this only if Step 5 returned a single data point with nothing to compare across time.

### Summary
- Companies / contacts matched: X
- Decision makers found: Y
- Verified phones revealed: Z
- Credits consumed: N

## Step 9 — Offer Next Actions

1. **Narrow by geography or company size** — apply additional filters to the matched companies
2. **Change the target role** — re-run Step 6 with a different title or seniority
3. **Run a different signal** — try a related signal type (e.g. also check `headcountIncrease3m` alongside funding)
4. **Export** — format as CSV
