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

## Step 2 — Discover Available Signal Types

**Company signals:** Use `mcp__lusha__signals_company_filters` to retrieve the full list of available signal types and sub-filters (news event types, hiring departments, hiring locations).

**Contact signals:** Use `mcp__lusha__signals_contact_filters` to retrieve available contact signal types.

Always call these tools first — they are the authoritative source of available signals. Do not assume a signal type exists without confirming it appears in the API response.

## Step 3 — Map User Intent to Signal Type

Match the user's description to a signal identifier returned in Step 2. The table below covers common phrasings as a starting point — always validate the identifier against the live API response before using it:

| User says | Likely signal type |
|-----------|-------------|
| "raised funding / Series A/B/C / IPO" | `financialEventsNews` → `Funding Round` or `IPO` |
| "surging in hiring / lots of open roles" | `surgeInHiring` |
| "growing fast / headcount up" | `headcountIncrease3m` or `headcountIncrease6m` |
| "hiring sales reps / opening sales roles" | `surgeInHiringByDepartment` → `Sales` |
| "new partnership / new customer announced" | `commercialActivityNews` → `Partnership` or `New Customer` |
| "new product launch" | `productActivityNews` → `Product Launch` |
| "executive just joined / new CRO hired" | `peopleNews` → `Executive Hire` |
| "contact just got promoted" | contact signal: `promotion` |
| "contact changed company / new job" | contact signal: `companyChange` |

If the user's intent doesn't map cleanly to a signal in the API response, present the closest available options and ask the user to confirm before searching.

## Step 4 — Search by Signal

**Company signal mode:**
Use `mcp__lusha__prospecting_company_search` with the resolved signal type applied as a signals filter (and any sub-filters: department, location, news event type). Request up to 25 results.

**Contact signal mode:**
Use `mcp__lusha__prospecting_contact_search` with the resolved signal type applied as a signals filter. Request up to 25 results.

## Step 5 — Find Decision Makers (Company Signal Mode Only)

For each matched company, use `mcp__lusha__prospecting_contact_search` scoped to those companies with the user's target title or seniority. If no title was specified, ask: *"What role are you looking to reach at these companies?"*

Resolve title/seniority filters via `mcp__lusha__prospecting_contact_filters` before searching.

Skip this step in contact signal mode — the triggered contacts are already the targets.

## Step 6 — Enrich and Reveal Phones

Use `mcp__lusha__prospecting_contact_enrich` on the top results to reveal direct and mobile phone numbers.

State the number of credits to be consumed before enriching batches larger than 10.

## Step 7 — Present Results

### Signal Used
State exactly which signal was applied and what it means (e.g., "Funding Round events in the last 30 days").

### Results

**Company signal mode:**

| # | Company | Signal | Signal Date | Contact Name | Title | Direct Phone | Mobile | Email |
|---|---------|--------|-------------|-------------|-------|-------------|--------|-------|

**Contact signal mode:**

| # | Name | Signal | Previous Role | New Role / Company | Direct Phone | Mobile | Email |
|---|------|--------|--------------|-------------------|-------------|--------|-------|

- Lead with phone columns — never bury them at the end
- Mark missing phones with `—`
- Surface the signal date so the user knows how fresh the trigger is

### Summary
- Companies / contacts matched: X
- Decision makers found: Y
- Verified phones revealed: Z

## Step 8 — Offer Next Actions

1. **Narrow by geography or company size** — apply additional filters to the matched companies
2. **Change the target role** — re-run Step 5 with a different title or seniority
3. **Run a different signal** — try a related signal type (e.g., also check `headcountIncrease3m` alongside funding)
4. **Export** — format as CSV
