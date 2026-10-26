---
name: work-my-accounts
description: >
  Tell the user which accounts to work next and why, from Lusha's recommendations ranked on their
  own ICP and live buying signals, then find and enrich the decision makers at the accounts they
  pick. Use when the user asks "who should I go after", "which accounts should I prioritise",
  "what should I work on this week", "give me my best accounts", "any warm accounts for me",
  "where should I focus today", or any targeting question that names no criteria of its own.
  Not when the user describes the companies or people to find (industry, size, title, location):
  use prospect for that.
metadata:
  author: Lusha <support@lusha.com>
  version: 0.2.0
  tags: recommendations, prioritisation, icp, signals, decision-makers
---

# Work My Accounts

Answer "who should I go after?" with ten accounts, a reason for each, and a call list for the ones the user picks. Lusha's recommendations are personalised to the user's Target Profiles and ranked by lead score (ICP fit plus live buying signals), so the user does not have to describe a market.

## Lusha call rules

1. Pass `conversation_id` from the most recent Lusha response on every call. Start every `reason_for_invocation` with `work-my-accounts: `.
2. Run the free calls first and branch on what they return. A missing profile gets a setup offer, never an error.
3. State the credit cost before every paid call and wait for a yes. Preview 10 before a full page. Reveal only the people the user picks. On a 402 (out of credits), offer `purchase_options`.
4. Zero results is not the end: say what was searched, then offer to widen.
5. Keep the chain short: every call counts toward the user's AI usage.
6. If a response carries `next_step_hints` and the user picks one of its offers, pass its `ref` as `next_step_ref`.

## Step 1 — Recommend 10 accounts

Say: *"I'll pull your top 10 recommended accounts. That costs 10 credits (one per account)."* Then call `recommendations_companies` with `pagination: { size: 10 }` and no filters. Results come back sorted by lead score, which is right for this question.

Change the call only when the user asked for something specific:
- **"Who's hot right now"** → `sort: [{ by: "signalScore" }]`.
- **A named segment or one of their profiles** → get the ids from `recommendations_companies_filters` (free) and pass `filters.targetIcp`.
- **A named signal** (hiring, funding) → get the ids from the same filters call and pass `filters.signals`.

Never construct a profile or signal id.

- **Account-wide API key (403):** recommendations need a personal login. Say so, and offer `prospect` instead.
- **No results:** say the recommendations came back empty for this profile, and offer `prospect` with the user's own criteria.

## Step 2 — Say why each account is listed

| # | Company | Domain | Lead score | ICP fit | Signal score | Why it's here |
|---|---------|--------|-----------|---------|--------------|---------------|

"Why it's here" is one line built from the record: the target profile it matched, plus the signals that fired, e.g. *"Matches 'Mid-market fintech'; hiring surge in Sales, headcount +12% in 6 months."* Never write a reason the record does not support.

**No profile of their own:** if the matched profile is the *Lusha Calculated Target Profile*, or the response carries a `target_profile_suggestion`, tell the user: *"These are based on a profile Lusha calculated for you. Setting up your own ICP makes them sharper. Want to do that next with set-up-my-icp?"* Show the suggestion's `message` if there is one.

Ask which accounts to work: *"Which of these should I find people at? Pick by number, or say 'top 3'."* Offer the next 10 (`page: 1`, 10 more credits) if none fit.

## Step 3 — Find the people at the picked accounts

**The user named a role** (e.g. "VP Sales"): call `prospecting_contact_search` with `companyIds` set to the picked accounts' ids, `jobTitles` set to the role, and `page_size: 10`.

**No role named:** find the decision makers. State the cost first: up to 3 credits per account. Then call `decision_makers_buying_group_search` with:
- `companies`: the picked accounts by `domain` or `id`, up to 25 per call
- `personas: ["decision_maker"]`
- `contactsLimit: 3`

It charges per contact returned, so an empty answer costs nothing. If it errors, or returns no contacts for every account, fall back to `prospecting_contact_search` with `companyIds` and senior decision makers. Resolve the senior levels to `seniority` ids with `prospecting_contact_filters` (`seniority`).

Show the people found, without phones or emails yet:

| # | Name | Title | Company | Role in deal | Can reveal |
|---|------|-------|---------|--------------|-----------|

## Step 4 — Enrich only the people the user picks

Ask who to reveal. Sum `canReveal[].credits` for the fields being revealed, state the total, and wait for a yes. Then call `prospecting_contact_enrich` with those ids and `reveal` taken from `canReveal[].field`, up to 50 per call.

**What a reveal returns.**
- **Third-party costs.** `canReveal[].credits` is Lusha's own price. If the account has the data waterfall on, a Lusha miss can be filled by a third-party source at its own rate (`account_usage` lists them, e.g. a phone at 8 credits). Say so when quoting the cost. Offer `waterfallEnabled: false` for a Lusha-only reveal.
- **`COMPLIANCE_RESTRICTED`** on a row means that contact can't be shown, for compliance reasons, and nothing was charged. Say so and offer the next person.
- **`doNotCall: true`** marks a phone that is masked and not to be called. Show it as "Do not call", never as a number to dial.
- **A different company.** If the enrich result shows a different company from the search, the person has changed jobs. Show the new company and say so.

**Background reveals.** A `job` block in the response means some reveals, usually from third-party sources, are still running.
1. Show what has landed and how many are still running (`job.outstandingCount`).
2. Wait `pollAgainInSeconds`, then check `contacts_enrich_job_status` until `isTerminal` is true.
3. Read the final contacts with `contacts_enrich_job_results` (`contactLimit: 25`, following `contactPage.nextContactOffset` while `hasMore`).
4. Never enrich the same ids again: that charges twice. The job tools are free.

## Step 5 — Present the call list

| # | Name | Title | Company | Direct Phone | Mobile | Email | Why this account |
|---|------|-------|---------|-------------|--------|-------|------------------|

- Phones come first. Mark a missing phone with `—`.
- Carry the Step 2 reason onto each row, so the user has an opener.

### Summary
- Accounts recommended: 10 (picked: N)
- People found: X; enriched: Y; with a phone: Z
- Credits used: sum of `billing.creditsCharged` / `creditsCharged`

## Step 6 — Next actions

1. **Save the call list to a Workspace table** — hand off to `save-or-export` (contacts tables are free).
2. **Export to the CRM** — through `save-or-export`.
3. **Score a list of your own the same way** — `score-my-list`.
4. **Using the calculated profile?** Run `set-up-my-icp` to make recommendations your own.
