---
name: website-visitor-followup
description: >
  Turn the companies visiting the user's own website into a call list: rank recent visitors by
  engagement, keep the hot ones, check them against the user's ICP, find the decision makers and
  reveal their phones. Use when the user says "who visited our website", "which companies are on
  our site", "follow up on site visitors", "show me hot website visitors", "who's been looking at
  our pricing page", or "turn website traffic into leads". Not for companies showing a buying
  signal elsewhere (funding, hiring): use signal-prospect for that.
metadata:
  author: Lusha <support@lusha.com>
  version: 0.2.0
  tags: website-visitors, intent, follow-up, decision-makers
---

# Website Visitor Follow-up

A company that keeps coming back to the user's site, and reads the high-intent pages, is the warmest account they have. This skill finds those companies, keeps the ones that fit, and ends with the people to call.

## Lusha call rules

1. Pass `conversation_id` from the most recent Lusha response on every call. Start every `reason_for_invocation` with `website-visitor-followup: `.
2. Run the free calls first and branch on what they return. No visit data means a fallback, never an error.
3. State the credit cost before every paid call and wait for a yes. Reveal only the people the user picks. On a 402 (out of credits), offer `purchase_options`.
4. Keep the chain short: every call counts toward the user's AI usage.
5. If a response carries `next_step_hints` and the user picks one of its offers, pass its `ref` as `next_step_ref`.

## Step 1 — Rank the visitors (free)

Call `website_visits_search` with:
- `filters: { scoreBands: ["hot"] }`
- `sort: { by: "score", order: "desc" }`
- `pagination: { size: 25 }`

The default window is the last 30 days. Pass `startDate` / `endDate` if the user named a period; keep the range to 90 days or less, because a longer one is refused. Pass `domains` only when the user names one of their tracked sites.

- **No hot visitors, but the call worked:** say so, and run it once more with `scoreBands: ["warm"]`. Offer a longer window, up to 90 days, if warm is empty too.
- **An error, or nothing in any band:** go to the fallback below.

Show the ranking:

| # | Company | Domain | Visit score | Band | Days visited | High-intent pages | Last visit |
|---|---------|--------|------------|------|--------------|-------------------|------------|

List up to three `highIntentPages` labels per company (e.g. "Pricing ×4, Demo ×1"). They tell the user what the visitor wants, and make a good opener.

## Step 2 — Keep the ones that fit (optional, paid)

Call `icp_profiles_get` with `status: "active"` (free).
- **Active profiles exist:** offer to drop visitors outside the ICP: *"Check these N companies against your ICP? About N credits."* On yes, call `icp_fit_score_companies` with their ids and up to 3 `targetProfileIds`. Mark fit ≥ 0.6 as a fit, and keep the rest visible but lower.
- **No profile:** skip this step and mention `set-up-my-icp` at the end.

Do not add a signal score. The visit is already the buying signal.

Ask which companies to work, or default to the top 5 by visit score.

## Step 3 — Find the decision makers

**The user named a role:** call `prospecting_contact_search` with `companyIds`, `jobTitles` and `page_size: 10`.

**No role named:** state the cost first: up to 3 credits per company. Then call `decision_makers_buying_group_search` with:
- `companies`: the picked visitors by `id` or `domain`, up to 25
- `personas: ["decision_maker"]`
- `contactsLimit: 3`

It charges per contact returned, so an empty answer costs nothing. If it errors, or returns no contacts for every company, fall back to `prospecting_contact_search` with `companyIds` and senior `seniority` ids from `prospecting_contact_filters`.

## Step 4 — Enrich the people the user picks

Sum `canReveal[].credits` for the fields being revealed, state the total, and wait for a yes. Then call `prospecting_contact_enrich` with those ids, up to 50 per call.

**What a reveal returns.**
- **Third-party costs.** `canReveal[].credits` is Lusha's own price. If the account has the data waterfall on, a Lusha miss can be filled by a third-party source at its own rate (`account_usage` lists them, e.g. a phone at 8 credits). Say so when quoting the cost. Offer `waterfallEnabled: false` for a Lusha-only reveal.
- **`COMPLIANCE_RESTRICTED`** on a row means that contact can't be shown, for compliance reasons, and nothing was charged. Say so and offer the next person.
- **`doNotCall: true`** marks a phone that is masked and not to be called. Show it as "Do not call", never as a number to dial.
- **A different company.** If the enrich result shows a different company from the search, the person has changed jobs. Show the new company and say so.

**Background reveals.** A `job` block in the response means some reveals are still running.
1. Show what has landed and how many are outstanding (`job.outstandingCount`).
2. Check `contacts_enrich_job_status` after `pollAgainInSeconds` until `isTerminal` is true.
3. Read the final contacts with `contacts_enrich_job_results` (`contactLimit: 25`, following `contactPage.nextContactOffset` while `hasMore`).
4. Never enrich the same ids again: that charges twice. The job tools are free.

## Step 5 — Present the call list

| # | Name | Title | Company | Direct Phone | Mobile | Email | What they looked at | Last visit |
|---|------|-------|---------|-------------|--------|-------|---------------------|-----------|

- Phones come first. Mark a missing phone with `—`.
- "What they looked at" holds the company's high-intent pages. Never claim that a specific person visited: visits are tracked per company.

### Summary
- Hot visitors: X (worked: N)
- Decision makers found: Y; with a phone: Z
- Credits used: sum of `billing.creditsCharged` / `creditsCharged`

## Fallback — no visit data

If `website_visits_search` errors, or returns nothing in any band over 90 days, website tracking is probably not set up for this account. Tell the user: *"I can't see website visits for your account. Visitor tracking may not be set up yet; it's configured in the Lusha platform."*

Then offer the closest thing that still uses their ICP:
1. Call `recommendations_companies_filters` (free).
2. If its `availableSignals` lists a website-traffic-increase signal, call `recommendations_companies` with `filters.signals` set to that id and `pagination: { size: 10 }`.
3. Otherwise sort by `signalScore`.
4. State the cost first: 10 credits.

These are companies in the user's ICP whose activity is rising, not visitors to their site, so say that plainly. Then continue from Step 3 with the accounts the user picks.

## Step 6 — Next actions

1. **Save the call list to a Workspace table** — hand off to `save-or-export` (contacts tables are free).
2. **Export to the CRM** — through `save-or-export`.
3. **See the rest of your best accounts** — `work-my-accounts`.
4. **No ICP profile?** Run `set-up-my-icp` so visitors can be checked for fit.
